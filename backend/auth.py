"""
JWT verification using Supabase JWKS.

Supabase's new JWT Signing Keys issue ES256 JWTs. Public keys are fetched from:
  ${SUPABASE_URL}/auth/v1/.well-known/jwks.json

That endpoint requires the project's anon key as an `apikey` header. PyJWKClient
caches keys in-process and re-fetches on cache miss (handles key rotation
automatically). The `sub` claim becomes the platform user_id.
"""
import os

import jwt
from jwt import PyJWKClient, PyJWKClientError
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]
JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"

_jwks_client = PyJWKClient(
    JWKS_URL,
    cache_keys=True,
    headers={"apikey": SUPABASE_ANON_KEY},
)
_bearer = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(_bearer),
) -> dict:
    """
    FastAPI dependency — verifies the Bearer token and returns user info.

    Returns:
        {"user_id": str, "email": str, "claims": dict}

    Raises:
        HTTPException 401 on any verification failure.
    """
    token = credentials.credentials
    try:
        signing_key = _jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256"],
            # audience verification skipped for MVP — enable once you configure
            # the JWT audience in Supabase dashboard
            options={"verify_aud": False},
            issuer=f"{SUPABASE_URL}/auth/v1",
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except (jwt.InvalidTokenError, PyJWKClientError) as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}")

    return {
        "user_id": payload["sub"],
        "email": payload.get("email", ""),
        "claims": payload,
    }
