"""DynamoDB-backed results repository. Source of the leaderboard.

Schema: composite key (project_id HASH, run_id RANGE). One partition per
project lets the leaderboard be a single Query.
"""
from datetime import datetime, timezone
from decimal import Decimal

from boto3.dynamodb.conditions import Key

from aws import DYNAMO_RESULTS_TABLE, dynamodb

_table = dynamodb.Table(DYNAMO_RESULTS_TABLE)


def _to_decimal(x) -> Decimal:
    return Decimal(str(x))


def put(
    run_id: str,
    job_id: str,
    project_id: str,
    user_id: str,
    score: float,
    max_drawdown: float,
    full_metrics_s3_key: str,
    report_s3_key: str,
) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    item = {
        "run_id": run_id,
        "job_id": job_id,
        "project_id": project_id,
        "user_id": user_id,
        "score": _to_decimal(score),
        "max_drawdown": _to_decimal(max_drawdown),
        "full_metrics_s3_key": full_metrics_s3_key,
        "report_s3_key": report_s3_key,
        "created_at": now,
    }
    _table.put_item(Item=item)
    return item


def get_by_run(project_id: str, run_id: str) -> dict | None:
    resp = _table.get_item(Key={"project_id": project_id, "run_id": run_id})
    return resp.get("Item")


def leaderboard(project_id: str) -> list[dict]:
    resp = _table.query(KeyConditionExpression=Key("project_id").eq(project_id))
    items = resp.get("Items", [])
    items.sort(
        key=lambda r: (r.get("score", Decimal(0)), r.get("max_drawdown", Decimal(0))),
        reverse=True,
    )
    return items
