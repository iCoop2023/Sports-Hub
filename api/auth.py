"""Authentication endpoints for Sports Hub.

Sessions are stored as httpOnly cookies so JS can't read them (mitigates
token theft via XSS). Backwards-compatibility: protected endpoints still
accept an `Authorization: Bearer ...` header, which keeps non-browser
clients (iOS app, curl) working during the transition.
"""

from fastapi import APIRouter, HTTPException, Header, Cookie, Response
from pydantic import BaseModel, EmailStr
from typing import Optional
import os

try:
    from .supabase_client import get_supabase_client
    SUPABASE_ENABLED = True
except Exception:
    try:
        from supabase_client import get_supabase_client
        SUPABASE_ENABLED = True
    except Exception:
        SUPABASE_ENABLED = False

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Cookie names — prefixed so they don't collide with anything else.
ACCESS_COOKIE = "sh_access_token"
REFRESH_COOKIE = "sh_refresh_token"

# Secure cookies require HTTPS. Default on; flip off via env for local dev.
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "true").lower() != "false"
# Supabase access tokens default to 1h; match that.
ACCESS_MAX_AGE = 60 * 60
# Refresh tokens live for 30 days by default in Supabase.
REFRESH_MAX_AGE = 60 * 60 * 24 * 30


def _set_session_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    response.set_cookie(
        key=ACCESS_COOKIE,
        value=access_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=ACCESS_MAX_AGE,
        path="/",
    )
    if refresh_token:
        response.set_cookie(
            key=REFRESH_COOKIE,
            value=refresh_token,
            httponly=True,
            secure=COOKIE_SECURE,
            samesite="lax",
            max_age=REFRESH_MAX_AGE,
            path="/",
        )


def _clear_session_cookies(response: Response) -> None:
    response.delete_cookie(ACCESS_COOKIE, path="/")
    response.delete_cookie(REFRESH_COOKIE, path="/")


def resolve_token(
    cookie_token: Optional[str],
    authorization: Optional[str],
) -> Optional[str]:
    """Pick up the bearer token from cookie first, then Authorization header."""
    if cookie_token:
        return cookie_token
    if authorization and authorization.startswith("Bearer "):
        return authorization[len("Bearer "):]
    return None


class LoginRequest(BaseModel):
    email: EmailStr


class SessionResponse(BaseModel):
    user_id: str
    email: str


@router.post("/login")
async def send_magic_link(request: LoginRequest):
    """Send magic link to user's email."""
    if not SUPABASE_ENABLED:
        raise HTTPException(status_code=503, detail="Auth not configured")

    try:
        supabase = get_supabase_client()
        supabase.auth.sign_in_with_otp({
            "email": request.email,
            "options": {
                "email_redirect_to": os.getenv("APP_URL", "https://sports-hub-sepia.vercel.app")
            }
        })
        return {
            "status": "success",
            "message": f"Magic link sent to {request.email}. Check your inbox!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send magic link: {str(e)}")


@router.post("/callback", response_model=SessionResponse)
async def auth_callback(
    response: Response,
    access_token: str = Header(...),
    refresh_token: str = Header(...),
):
    """Exchange Supabase tokens for a session cookie."""
    if not SUPABASE_ENABLED:
        raise HTTPException(status_code=503, detail="Auth not configured")

    try:
        supabase = get_supabase_client()
        session = supabase.auth.set_session(access_token, refresh_token)
        user = session.user
        if not user:
            raise HTTPException(status_code=401, detail="Invalid session")

        _set_session_cookies(response, access_token, refresh_token)
        return SessionResponse(user_id=user.id, email=user.email)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth failed: {str(e)}")


@router.get("/session")
async def get_session(
    sh_access_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None),
):
    """Validate current session."""
    if not SUPABASE_ENABLED:
        raise HTTPException(status_code=503, detail="Auth not configured")

    token = resolve_token(sh_access_token, authorization)
    if not token:
        raise HTTPException(status_code=401, detail="No auth token provided")

    try:
        supabase = get_supabase_client()
        user = supabase.auth.get_user(token)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid session")
        return {"user_id": user.user.id, "email": user.user.email}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Session invalid: {str(e)}")


@router.post("/logout")
async def logout(
    response: Response,
    sh_access_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None),
):
    """Sign out user and clear session cookies."""
    _clear_session_cookies(response)

    if not SUPABASE_ENABLED:
        return {"status": "success", "message": "Logged out"}

    token = resolve_token(sh_access_token, authorization)
    if not token:
        return {"status": "success", "message": "Logged out"}

    try:
        supabase = get_supabase_client()
        supabase.auth.sign_out()
    except Exception:
        pass
    return {"status": "success", "message": "Logged out"}
