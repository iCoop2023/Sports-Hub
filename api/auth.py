"""Authentication endpoints for Sports Hub."""

from fastapi import APIRouter, HTTPException, Header
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

class LoginRequest(BaseModel):
    email: EmailStr

class SessionResponse(BaseModel):
    user_id: str
    email: str
    access_token: str

@router.post("/login")
async def send_magic_link(request: LoginRequest):
    """Send magic link to user's email."""
    if not SUPABASE_ENABLED:
        raise HTTPException(status_code=503, detail="Auth not configured")
    
    try:
        supabase = get_supabase_client()
        result = supabase.auth.sign_in_with_otp({
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

@router.post("/callback")
async def auth_callback(access_token: str = Header(...), refresh_token: str = Header(...)):
    """Exchange tokens for session after magic link click."""
    if not SUPABASE_ENABLED:
        raise HTTPException(status_code=503, detail="Auth not configured")
    
    try:
        supabase = get_supabase_client()
        session = supabase.auth.set_session(access_token, refresh_token)
        
        user = session.user
        if not user:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        return SessionResponse(
            user_id=user.id,
            email=user.email,
            access_token=access_token
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth failed: {str(e)}")

@router.get("/session")
async def get_session(authorization: Optional[str] = Header(None)):
    """Validate current session."""
    if not SUPABASE_ENABLED:
        raise HTTPException(status_code=503, detail="Auth not configured")
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No auth token provided")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        supabase = get_supabase_client()
        user = supabase.auth.get_user(token)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        return {
            "user_id": user.user.id,
            "email": user.user.email
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Session invalid: {str(e)}")

@router.post("/logout")
async def logout(authorization: Optional[str] = Header(None)):
    """Sign out user."""
    if not SUPABASE_ENABLED:
        raise HTTPException(status_code=503, detail="Auth not configured")
    
    if not authorization or not authorization.startswith("Bearer "):
        return {"status": "success", "message": "Logged out"}
    
    token = authorization.replace("Bearer ", "")
    
    try:
        supabase = get_supabase_client()
        supabase.auth.sign_out()
        return {"status": "success", "message": "Logged out"}
    except Exception as e:
        # Silent failure on logout
        return {"status": "success", "message": "Logged out"}
