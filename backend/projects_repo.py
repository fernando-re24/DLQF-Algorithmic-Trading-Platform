"""DynamoDB-backed projects repository.

For now only one hardcoded project exists: the Spring 2026 challenge.
"""
from datetime import datetime, timezone

from aws import DYNAMO_PROJECTS_TABLE, dynamodb

_table = dynamodb.Table(DYNAMO_PROJECTS_TABLE)

DEFAULT_PROJECT_ID = "spring-2026-challenge"
DEFAULT_PROJECT_NAME = "DLQF Spring 2026 Challenge"
DEFAULT_PROJECT_DESCRIPTION = (
    "Submit a PyTorch model that predicts trading signals on OHLC data. "
    "Leaderboard ranks by excess Sharpe over buy-and-hold."
)


def get(project_id: str) -> dict | None:
    resp = _table.get_item(Key={"project_id": project_id})
    return resp.get("Item")


def get_or_create_default() -> dict:
    existing = get(DEFAULT_PROJECT_ID)
    if existing:
        return existing
    now = datetime.now(timezone.utc).isoformat()
    item = {
        "project_id": DEFAULT_PROJECT_ID,
        "name": DEFAULT_PROJECT_NAME,
        "description": DEFAULT_PROJECT_DESCRIPTION,
        "created_at": now,
    }
    _table.put_item(Item=item)
    return item
