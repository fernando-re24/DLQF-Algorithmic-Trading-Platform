"""In-memory submissions repository (stub). Replace with DynamoDB when ready."""
from datetime import datetime, timezone

_store: dict[str, dict] = {}


def create_submission(
    submission_id: str,
    user_id: str,
    status: str,
    summary: dict,
    full_metrics: dict,
    html_report: str,
) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    record = {
        "submission_id": submission_id,
        "user_id": user_id,
        "status": status,
        "summary": summary,
        "full_metrics": full_metrics,
        "html_report": html_report,
        "created_at": now,
        "updated_at": now,
    }
    _store[submission_id] = record
    return record


def get_submission(submission_id: str) -> dict | None:
    return _store.get(submission_id)


def list_submissions_for_user(user_id: str) -> list[dict]:
    return [
        {
            "submission_id": r["submission_id"],
            "user_id": r["user_id"],
            "status": r["status"],
            "summary": r["summary"],
            "created_at": r["created_at"],
        }
        for r in _store.values()
        if r["user_id"] == user_id
    ]
