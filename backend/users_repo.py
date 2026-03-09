"""
In-memory user repository (stub).

Replaces DynamoDB for local development. Swap back to the DynamoDB
implementation when AWS credentials are configured.
"""
from datetime import datetime, timezone

# { user_id: { user_id, email, created_at, updated_at } }
_store: dict[str, dict] = {}


def get_user(user_id: str) -> dict | None:
    return _store.get(user_id)


def upsert_user(user_id: str, email: str) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    existing = _store.get(user_id)
    _store[user_id] = {
        "user_id": user_id,
        "email": email,
        "created_at": existing["created_at"] if existing else now,
        "updated_at": now,
    }
    return _store[user_id]
