"""
DLQF Platform — FastAPI backend entry point.

Start with:
    uvicorn main:app --reload
"""
import os
import uuid

from dotenv import load_dotenv

load_dotenv()  # loads .env before any module reads os.environ

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from auth import get_current_user
from users_repo import get_user, upsert_user
from submissions_repo import create_submission, get_submission, list_submissions_for_user
from evaluator import run_evaluation
from evaluation_engine import FeatureScriptError

FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")

app = FastAPI(title="DLQF API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Public
# ---------------------------------------------------------------------------


@app.get("/health")
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Protected
# ---------------------------------------------------------------------------


@app.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    """
    Returns the authenticated user's profile.
    Creates a DynamoDB record on first call.
    """
    user_id = current_user["user_id"]
    email = current_user["email"]
    upsert_user(user_id, email)
    profile = get_user(user_id)
    return {"user_id": user_id, "email": email, "profile": profile}


@app.get("/leaderboard")
def leaderboard(current_user: dict = Depends(get_current_user)):
    """
    Returns leaderboard data (stub — DynamoDB query to be added later).
    Requires authentication.
    """
    # TODO: query DDB leaderboard table and return ranked entries
    return {"leaderboard": [], "user_id": current_user["user_id"]}


# ---------------------------------------------------------------------------
# Protected — Submissions
# ---------------------------------------------------------------------------


@app.post("/submit", status_code=201)
async def submit(
    model_file: UploadFile = File(...),
    data_file: UploadFile = File(...),
    feature_script: UploadFile | None = File(default=None),
    current_user: dict = Depends(get_current_user),
):
    """
    Accept a PyTorch model (.pt), CSV data file, and optional feature script (.py).
    Runs evaluation synchronously and stores the result.
    """
    model_bytes = await model_file.read()
    csv_bytes = await data_file.read()
    feature_script_bytes = await feature_script.read() if feature_script else None

    submission_id = str(uuid.uuid4())

    try:
        result = run_evaluation(model_bytes, csv_bytes, feature_script_bytes)
    except FeatureScriptError as exc:
        raise HTTPException(status_code=422, detail=f"Feature script error: {exc}")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=f"Evaluation input error: {exc}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {exc}")

    create_submission(
        submission_id=submission_id,
        user_id=current_user["user_id"],
        status="completed",
        summary=result["summary"],
        full_metrics=result["full_metrics"],
        html_report=result["html_report"],
    )
    return {"submission_id": submission_id, "status": "completed", "summary": result["summary"]}


@app.get("/submissions")
def list_submissions(current_user: dict = Depends(get_current_user)):
    """List all submissions for the authenticated user (summary view)."""
    return {"submissions": list_submissions_for_user(current_user["user_id"])}


@app.get("/submissions/{submission_id}")
def get_submission_detail(
    submission_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Return the full result for one submission, including the HTML report."""
    record = get_submission(submission_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    if record["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return record
