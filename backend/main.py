"""
DLQF Platform — FastAPI backend entry point.

Queue-first: this module NEVER imports the evaluation engine. Compute runs in
the worker container (see worker/) which polls SQS.

Start with:
    uvicorn main:app --reload
"""
import io
import os
import re
import shutil
import subprocess
import tempfile
import uuid
import zipfile
from decimal import Decimal

from dotenv import load_dotenv

load_dotenv()  # loads .env before any module reads os.environ

from botocore.exceptions import ClientError
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from auth import get_current_user

import jobs_repo
import job_runs_repo
import projects_repo
import results_repo
import users_repo
from aws import S3_SUBMISSIONS_BUCKET, s3
from s3_helper import presigned_get, presigned_post, submission_key
from sqs_helper import enqueue_job

FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")

app = FastAPI(title="DLQF API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _decimals_to_floats(obj):
    """Recursively convert Decimals in a DDB-read dict to floats for JSON."""
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, list):
        return [_decimals_to_floats(x) for x in obj]
    if isinstance(obj, dict):
        return {k: _decimals_to_floats(v) for k, v in obj.items()}
    return obj


def _require_owned_job(job_id: str, user_id: str) -> dict:
    job = jobs_repo.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return job


def _s3_object_exists(key: str) -> bool:
    try:
        s3.head_object(Bucket=S3_SUBMISSIONS_BUCKET, Key=key)
        return True
    except ClientError as exc:
        code = exc.response.get("Error", {}).get("Code")
        if code in ("404", "NoSuchKey", "NotFound"):
            return False
        raise


# ---------------------------------------------------------------------------
# Public
# ---------------------------------------------------------------------------


@app.get("/health")
def health():
    return {"ok": True}


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------


@app.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    """Upsert user row, ensure default project exists, return both."""
    user = users_repo.upsert_user(current_user["user_id"], current_user["email"])
    project = projects_repo.get_or_create_default()
    return {"user": user, "project": project}


# ---------------------------------------------------------------------------
# Jobs — creation & lifecycle
# ---------------------------------------------------------------------------


@app.post("/projects/{project_id}/jobs", status_code=201)
def create_job(project_id: str, current_user: dict = Depends(get_current_user)):
    """
    Create a pending_upload job row and hand back a presigned POST for the zip.

    The frontend POSTs the zip directly to S3 using the returned fields, then
    calls /jobs/{job_id}/confirm-upload to enqueue the compute job.
    """
    project = projects_repo.get(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    user_id = current_user["user_id"]
    # create_job needs s3_key up front; generate from a fresh job_id
    job_id = str(uuid.uuid4())
    key = submission_key(user_id, job_id)

    # We can't use jobs_repo.create's auto-uuid because we need the id first.
    # Inline the row write to keep the key/id coupled atomically.
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc).isoformat()
    item = {
        "job_id": job_id,
        "user_id": user_id,
        "project_id": project_id,
        "status": jobs_repo.STATUS_PENDING_UPLOAD,
        "s3_key": key,
        "created_at": now,
        "updated_at": now,
    }
    jobs_repo._table.put_item(Item=item)  # type: ignore[attr-defined]

    upload = presigned_post(key)
    return {"job": item, "upload": upload}


class GithubSubmission(BaseModel):
    repo_url: str = Field(..., min_length=1, max_length=500)
    ref: str | None = Field(default=None, max_length=200)


_GITHUB_URL_RE = re.compile(
    r"^https://github\.com/[A-Za-z0-9._-]+/[A-Za-z0-9._-]+?(?:\.git)?/?$"
)
_MAX_GITHUB_ZIP_BYTES = 50 * 1024 * 1024


def _clone_and_zip_github(repo_url: str, ref: str | None) -> bytes:
    """Shallow-clone a public GitHub repo and return its contents as a zip blob."""
    with tempfile.TemporaryDirectory() as tmp:
        clone_dir = os.path.join(tmp, "repo")
        cmd = ["git", "clone", "--depth", "1"]
        if ref:
            cmd += ["--branch", ref]
        cmd += [repo_url, clone_dir]
        try:
            subprocess.run(
                cmd,
                check=True,
                capture_output=True,
                timeout=60,
                env={**os.environ, "GIT_TERMINAL_PROMPT": "0"},
            )
        except subprocess.TimeoutExpired:
            raise HTTPException(status_code=504, detail="git clone timed out")
        except subprocess.CalledProcessError as exc:
            stderr = exc.stderr.decode("utf-8", errors="replace")[:400]
            raise HTTPException(status_code=400, detail=f"git clone failed: {stderr}")

        shutil.rmtree(os.path.join(clone_dir, ".git"), ignore_errors=True)

        buf = io.BytesIO()
        total = 0
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            for root, _dirs, files in os.walk(clone_dir):
                for name in files:
                    path = os.path.join(root, name)
                    total += os.path.getsize(path)
                    if total > _MAX_GITHUB_ZIP_BYTES:
                        raise HTTPException(
                            status_code=413,
                            detail="Repository exceeds 50 MB limit after clone.",
                        )
                    arcname = os.path.relpath(path, clone_dir)
                    zf.write(path, arcname)
        return buf.getvalue()


@app.post("/projects/{project_id}/jobs/github", status_code=201)
def create_job_from_github(
    project_id: str,
    payload: GithubSubmission,
    current_user: dict = Depends(get_current_user),
):
    """
    Clone a public GitHub repo, zip it, upload to S3, and enqueue like a regular job.
    Control-plane only: no compute runs here — the worker still picks it up via SQS.
    """
    project = projects_repo.get(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    repo_url = payload.repo_url.strip()
    if not _GITHUB_URL_RE.match(repo_url):
        raise HTTPException(
            status_code=400,
            detail="repo_url must be a https://github.com/<owner>/<repo> URL",
        )

    user_id = current_user["user_id"]
    job_id = str(uuid.uuid4())
    key = submission_key(user_id, job_id)

    zip_blob = _clone_and_zip_github(repo_url, payload.ref)

    try:
        s3.put_object(
            Bucket=S3_SUBMISSIONS_BUCKET,
            Key=key,
            Body=zip_blob,
            ContentType="application/zip",
        )
    except ClientError as exc:
        raise HTTPException(status_code=502, detail=f"S3 upload failed: {exc}")

    from datetime import datetime, timezone

    now = datetime.now(timezone.utc).isoformat()
    item = {
        "job_id": job_id,
        "user_id": user_id,
        "project_id": project_id,
        "status": jobs_repo.STATUS_QUEUED,
        "s3_key": key,
        "source": "github",
        "repo_url": repo_url,
        "created_at": now,
        "updated_at": now,
    }
    jobs_repo._table.put_item(Item=item)  # type: ignore[attr-defined]

    run = job_runs_repo.create(job_id=job_id, user_id=user_id)
    try:
        enqueue_job(
            {
                "job_id": job_id,
                "run_id": run["run_id"],
                "user_id": user_id,
                "s3_key": key,
            }
        )
    except ClientError as exc:
        job_runs_repo.update_status(
            job_id,
            run["run_id"],
            job_runs_repo.STATUS_FAILED,
            error=f"enqueue failed: {exc}",
        )
        jobs_repo.update_status(job_id, jobs_repo.STATUS_FAILED)
        raise HTTPException(status_code=502, detail="Failed to enqueue job")

    return {"job": item, "run": run}


@app.post("/jobs/{job_id}/confirm-upload")
def confirm_upload(job_id: str, current_user: dict = Depends(get_current_user)):
    """
    Called by the frontend after the S3 upload completes.

    Verifies the object actually landed in S3, creates the first job_run row,
    enqueues a message on SQS, and flips the job to 'queued'. The worker is
    responsible for transitioning to 'running' once it picks the message up.
    """
    job = _require_owned_job(job_id, current_user["user_id"])

    if job["status"] != jobs_repo.STATUS_PENDING_UPLOAD:
        raise HTTPException(
            status_code=409,
            detail=f"Job is not awaiting upload (status={job['status']})",
        )

    if not _s3_object_exists(job["s3_key"]):
        raise HTTPException(
            status_code=400,
            detail="Upload not found in S3 — did the presigned POST succeed?",
        )

    run = job_runs_repo.create(job_id=job_id, user_id=job["user_id"])

    try:
        message_id = enqueue_job(
            {
                "job_id": job_id,
                "run_id": run["run_id"],
                "user_id": job["user_id"],
                "s3_key": job["s3_key"],
            }
        )
    except ClientError as exc:
        # SQS enqueue failed — mark the run failed so UI reflects reality.
        job_runs_repo.update_status(
            job_id,
            run["run_id"],
            job_runs_repo.STATUS_FAILED,
            error=f"enqueue failed: {exc}",
        )
        raise HTTPException(status_code=502, detail="Failed to enqueue job")

    updated_job = jobs_repo.update_status(job_id, jobs_repo.STATUS_QUEUED)
    return {"job": updated_job, "run": run, "sqs_message_id": message_id}


@app.get("/jobs/{job_id}")
def get_job(job_id: str, current_user: dict = Depends(get_current_user)):
    """Return job row + latest run (frontend polls this)."""
    job = _require_owned_job(job_id, current_user["user_id"])
    latest_run = job_runs_repo.get_latest(job_id)
    return {"job": job, "latest_run": latest_run}


@app.get("/jobs/{job_id}/runs")
def get_job_runs(job_id: str, current_user: dict = Depends(get_current_user)):
    """Full run history for a job."""
    _require_owned_job(job_id, current_user["user_id"])
    return {"runs": job_runs_repo.list_by_job(job_id)}


@app.get("/jobs/{job_id}/result")
def get_job_result(job_id: str, current_user: dict = Depends(get_current_user)):
    """Presigned GETs for artifacts + inline metrics. 404 until a run completes."""
    job = _require_owned_job(job_id, current_user["user_id"])
    latest_run = job_runs_repo.get_latest(job_id)
    if latest_run is None:
        raise HTTPException(status_code=404, detail="No runs yet")

    result = results_repo.get_by_run(job["project_id"], latest_run["run_id"])
    if result is None:
        raise HTTPException(status_code=404, detail="Result not ready")

    result = _decimals_to_floats(result)
    return {
        "run_id": result["run_id"],
        "score": result["score"],
        "max_drawdown": result["max_drawdown"],
        "report_url": presigned_get(result["report_s3_key"]),
        "metrics_url": presigned_get(result["full_metrics_s3_key"]),
    }


@app.get("/projects/{project_id}/jobs")
def list_project_jobs(
    project_id: str, current_user: dict = Depends(get_current_user)
):
    """List jobs in a project owned by the current user, newest first."""
    project = projects_repo.get(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    user_id = current_user["user_id"]
    rows = [
        j
        for j in jobs_repo.list_by_project(project_id)
        if j.get("user_id") == user_id
    ]
    rows.sort(key=lambda j: j.get("created_at", ""), reverse=True)

    jobs_with_runs = []
    for job in rows:
        latest_run = job_runs_repo.get_latest(job["job_id"])
        jobs_with_runs.append(
            {"job": _decimals_to_floats(job), "latest_run": _decimals_to_floats(latest_run)}
        )
    return {"jobs": jobs_with_runs}


@app.post("/jobs/{job_id}/cancel")
def cancel_job(job_id: str, current_user: dict = Depends(get_current_user)):
    """
    Cancel a job. Only valid from pending_upload or queued. Running jobs can't
    be cancelled by the user — the worker would need to co-operate.
    """
    job = _require_owned_job(job_id, current_user["user_id"])

    if job["status"] not in (jobs_repo.STATUS_PENDING_UPLOAD, jobs_repo.STATUS_QUEUED):
        raise HTTPException(
            status_code=409,
            detail=f"Cannot cancel job in status '{job['status']}'",
        )

    updated = jobs_repo.update_status(job_id, jobs_repo.STATUS_CANCELLED)

    latest_run = job_runs_repo.get_latest(job_id)
    if latest_run and latest_run["status"] == job_runs_repo.STATUS_QUEUED:
        job_runs_repo.update_status(
            job_id,
            latest_run["run_id"],
            job_runs_repo.STATUS_FAILED,
            error="cancelled by user",
        )

    return {"job": updated}


# ---------------------------------------------------------------------------
# Leaderboard
# ---------------------------------------------------------------------------


@app.get("/projects/{project_id}/leaderboard")
def project_leaderboard(
    project_id: str, current_user: dict = Depends(get_current_user)
):
    project = projects_repo.get(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    rows = _decimals_to_floats(results_repo.leaderboard(project_id))
    return {"leaderboard": rows}
