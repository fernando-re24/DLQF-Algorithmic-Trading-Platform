"""DynamoDB-backed user repository."""
from datetime import datetime, timezone

from aws import DYNAMO_USERS_TABLE, dynamodb

_table = dynamodb.Table(DYNAMO_USERS_TABLE)


def get_user(user_id: str) -> dict | None:
    resp = _table.get_item(Key={"user_id": user_id})
    return resp.get("Item")


def upsert_user(user_id: str, email: str) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    existing = get_user(user_id)
    item = {
        "user_id": user_id,
        "email": email,
        "created_at": existing["created_at"] if existing else now,
        "updated_at": now,
    }
    _table.put_item(Item=item)
    return item
