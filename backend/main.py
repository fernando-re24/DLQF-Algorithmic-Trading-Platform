"""
DLQF Platform — FastAPI backend entry point.

Start with:
    uvicorn main:app --reload
"""
import os

from dotenv import load_dotenv

load_dotenv()  # loads .env before any module reads os.environ

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import get_current_user
from users_repo import get_user, upsert_user

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
