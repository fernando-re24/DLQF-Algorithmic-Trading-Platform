"""DynamoDB-backed jobs repository."""
import uuid
from datetime import datetime, timezone

from boto3.dynamodb.conditions import Attr

from aws import DYNAMO_JOBS_TABLE, dynamodb

_table = dynamodb.Table(DYNAMO_JOBS_TABLE)

STATUS_PENDING_UPLOAD = "pending_upload"
STATUS_QUEUED = "queued"
STATUS_RUNNING = "running"
STATUS_COMPLETED = "completed"
STATUS_FAILED = "failed"
STATUS_CANCELLED = "cancelled"

_TERMINAL = {STATUS_COMPLETED, STATUS_FAILED, STATUS_CANCELLED}


def create(user_id: str, project_id: str, s3_key: str) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    item = {
        "job_id": str(uuid.uuid4()),
        "user_id": user_id,
        "project_id": project_id,
        "status": STATUS_PENDING_UPLOAD,
        "s3_key": s3_key,
        "created_at": now,
        "updated_at": now,
    }
    _table.put_item(Item=item)
    return item


def get(job_id: str) -> dict | None:
    resp = _table.get_item(Key={"job_id": job_id})
    return resp.get("Item")


def list_by_project(project_id: str) -> list[dict]:
    resp = _table.scan(FilterExpression=Attr("project_id").eq(project_id))
    return resp.get("Items", [])


def list_by_user(user_id: str) -> list[dict]:
    resp = _table.scan(FilterExpression=Attr("user_id").eq(user_id))
    return resp.get("Items", [])


def update_status(job_id: str, status: str) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    resp = _table.update_item(
        Key={"job_id": job_id},
        UpdateExpression="SET #s = :s, updated_at = :u",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":s": status, ":u": now},
        ReturnValues="ALL_NEW",
    )
    return resp["Attributes"]


def is_terminal(status: str) -> bool:
    return status in _TERMINAL
