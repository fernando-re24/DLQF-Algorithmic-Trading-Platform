"""DynamoDB-backed job_runs repository.

Schema: composite key (job_id HASH, run_id RANGE). All runs of a single job
live in one partition, so list_by_job / get_latest are cheap Queries.
"""
import uuid
from datetime import datetime, timezone

from boto3.dynamodb.conditions import Key

from aws import DYNAMO_JOB_RUNS_TABLE, dynamodb

_table = dynamodb.Table(DYNAMO_JOB_RUNS_TABLE)

STATUS_QUEUED = "queued"
STATUS_RUNNING = "running"
STATUS_COMPLETED = "completed"
STATUS_FAILED = "failed"


def create(job_id: str, user_id: str) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    item = {
        "run_id": str(uuid.uuid4()),
        "job_id": job_id,
        "user_id": user_id,
        "status": STATUS_QUEUED,
        "started_at": None,
        "finished_at": None,
        "error": None,
        "created_at": now,
    }
    _table.put_item(Item=item)
    return item


def get(job_id: str, run_id: str) -> dict | None:
    resp = _table.get_item(Key={"job_id": job_id, "run_id": run_id})
    return resp.get("Item")


def list_by_job(job_id: str) -> list[dict]:
    resp = _table.query(KeyConditionExpression=Key("job_id").eq(job_id))
    items = resp.get("Items", [])
    items.sort(key=lambda r: r.get("created_at", ""))
    return items


def get_latest(job_id: str) -> dict | None:
    items = list_by_job(job_id)
    return items[-1] if items else None


def update_status(
    job_id: str, run_id: str, status: str, error: str | None = None
) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    expr = "SET #s = :s"
    values: dict = {":s": status}
    names = {"#s": "status"}

    if status == STATUS_RUNNING:
        expr += ", started_at = :t"
        values[":t"] = now
    if status in (STATUS_COMPLETED, STATUS_FAILED):
        expr += ", finished_at = :t"
        values[":t"] = now
    if error is not None:
        expr += ", #e = :e"
        names["#e"] = "error"
        values[":e"] = error

    resp = _table.update_item(
        Key={"job_id": job_id, "run_id": run_id},
        UpdateExpression=expr,
        ExpressionAttributeNames=names,
        ExpressionAttributeValues=values,
        ReturnValues="ALL_NEW",
    )
    return resp["Attributes"]
