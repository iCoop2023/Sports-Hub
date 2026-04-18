#!/usr/bin/env python3
"""
Sports Hub API Server
FastAPI backend for iOS app
"""

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pathlib import Path
import json
import os
import subprocess
from datetime import datetime
from typing import Dict, List, Optional, Union
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

try:
    from .supabase_client import get_supabase_client, get_supabase_admin
    SUPABASE_ENABLED = True
except Exception:
    try:
        from supabase_client import get_supabase_client, get_supabase_admin
        SUPABASE_ENABLED = True
    except Exception as e:
        print(f"Supabase not configured: {e}")
        SUPABASE_ENABLED = False
try:
    from auto_discovery import discover_team_data_source, get_news_sources_for_team
except:
    discover_team_data_source = None
    get_news_sources_for_team = None

try:
    from .auth import router as auth_router
except Exception:
    try:
        from auth import router as auth_router
    except Exception:
        auth_router = None

# Models
class NewsArticle(BaseModel):
    title: str
    url: str = ""
    age: str
    source: str

class Game(BaseModel):
    id: Union[str, int]
    date: str
    opponent: str
    team_score: int
    opponent_score: int
    status: str
    is_home: bool
    result: str
    league: str

class Team(BaseModel):
    name: str
    league: str
    abbrev: str
    games: List[Game]
    news: List[NewsArticle]

class DashboardResponse(BaseModel):
    teams: List[Team]
    fetched_at: str
    timestamp: str

class TeamSettings(BaseModel):
    name: str
    league: str
    abbrev: Optional[str] = ""
    custom: Optional[bool] = False
    team_id: Optional[str] = None

class UserSettings(BaseModel):
    teams: List[TeamSettings] = []
    newsSources: Dict[str, bool] = {}
    newsCount: int = 5

# Initialize FastAPI
app = FastAPI(
    title="Sports Hub API",
    description="Backend for J's Sports Dashboard",
    version="1.0.0"
)

# CORS — restrict to the frontend origins we actually serve.
# Override via CORS_ALLOWED_ORIGINS env var: comma-separated list of origins.
# The previous "*" + allow_credentials=True combination was unsafe (and is
# also rejected by modern browsers), letting any site make authenticated
# requests to the API.
_default_origins = [
    "https://sports-hub-sepia.vercel.app",
    "http://localhost:3000",
    "http://localhost:8000",
]
_env_origins = os.environ.get("CORS_ALLOWED_ORIGINS", "").strip()
ALLOWED_ORIGINS = (
    [o.strip() for o in _env_origins.split(",") if o.strip()]
    if _env_origins
    else _default_origins
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Include auth router if available
if auth_router:
    app.include_router(auth_router)

# Paths
BASE_DIR = Path(__file__).parent.parent
CACHE_FILE = BASE_DIR / "data" / "cache" / "all_teams.json"
DASHBOARD_IMG = BASE_DIR / "sports_dashboard.png"
REFRESH_SCRIPT = BASE_DIR / "scripts" / "run_refresh.py"
REFRESH_STATUS = BASE_DIR / "data" / "cache" / "refresh_status.json"
SETTINGS_FILE = BASE_DIR / "data" / "user_settings.json"
NEWS_CACHE_FILE = BASE_DIR / "data" / "cache" / "news_cache.json"


def fetch_live_team_data(team_name: str):
    """Detect league, fetch schedule, and fetch news on-demand."""
    import sys
    sys.path.insert(0, str(BASE_DIR / "scripts"))
    from league_discovery import detect_league, fetch_team_schedule
    from fetch_news import search_team_news

    detection = detect_league(team_name)
    if not detection:
        raise HTTPException(status_code=404, detail=f"Team '{team_name}' not found in any known league")

    games = fetch_team_schedule(team_name)
    news = search_team_news(team_name, detection["league"])

    return detection, games, news


def format_team_payload(team_name: str, league: str, abbrev: str, games: List[Dict], news: List[Dict]):
    games_sorted = sorted(games, key=lambda x: x.get("date", ""))
    completed = [g for g in games_sorted if g.get("status") in ["OFF", "FINAL", "Final", "Full Time"]]
    upcoming = [g for g in games_sorted if g.get("status") in ["FUT", "SCHEDULED", "Scheduled"]]

    return {
        "name": team_name,
        "league": league,
        "abbrev": abbrev,
        "recent_games": completed[-5:],
        "upcoming_games": upcoming[:5],
        "news": news,
        "record": {
            "wins": len([g for g in completed if g.get("result") == "W"]),
            "losses": len([g for g in completed if g.get("result") == "L"]),
            "total": len(completed)
        }
    }


def fetch_latest_news(team_name: str, league: str, fallback: List[Dict]) -> List[Dict]:
    cached = NEWS_CACHE.get(team_name)
    if cached:
        return cached

    try:
        import sys
        sys.path.insert(0, str(BASE_DIR / "scripts"))
        from fetch_news import search_team_news
        fresh = search_team_news(team_name, league)
        if fresh:
            NEWS_CACHE[team_name] = fresh
            return fresh
    except Exception as exc:
        print(f"Live news fetch failed for {team_name}: {exc}")
    return fallback or []

DEFAULT_SETTINGS = {
    "teams": [],
    "newsSources": {
        "tsn": True,
        "sportsnet": True,
        "cbc": False,
        "espn": True,
        "leagues": True,
        "athletic": False,
        "bbc": True,
        "marca": True
    },
    "newsCount": 5
}

def load_cache():
    """Load cached team data."""
    if not CACHE_FILE.exists():
        raise HTTPException(status_code=503, detail="Cache not initialized")
    
    with open(CACHE_FILE) as f:
        return json.load(f)


def default_user_settings() -> dict:
    return json.loads(json.dumps(DEFAULT_SETTINGS))  # deep copy


def load_user_settings() -> dict:
    if SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE) as f:
                return json.load(f)
        except Exception:
            pass
    settings = default_user_settings()
    save_user_settings(settings)
    return settings


def save_user_settings(settings: dict) -> None:
    SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(SETTINGS_FILE, "w") as f:
        json.dump(settings, f, indent=2)


def load_news_cache() -> Dict[str, List[Dict]]:
    if not NEWS_CACHE_FILE.exists():
        return {}
    try:
        with open(NEWS_CACHE_FILE) as f:
            data = json.load(f)
        return data.get("teams", {})
    except Exception as exc:
        print(f"Failed to load news cache: {exc}")
        return {}


NEWS_CACHE = load_news_cache()

def read_refresh_status():
    """Return last refresh status if available."""
    if not REFRESH_STATUS.exists():
        return {
            "status": "idle",
            "message": "No refresh has run yet"
        }
    try:
        with open(REFRESH_STATUS) as f:
            return json.load(f)
    except Exception as exc:
        return {
            "status": "unknown",
            "message": f"Failed to read refresh status: {exc}"
        }

@app.get("/")
async def root():
    """API root - health check."""
    return {
        "status": "ok",
        "service": "Sports Hub API",
        "version": "1.0.0",
        "endpoints": {
            "dashboard": "/api/dashboard",
            "teams": "/api/teams",
            "team_detail": "/api/team/{team_name}",
            "image": "/api/dashboard/image"
        }
    }


@app.get("/api/settings")
async def get_user_settings(authorization: Optional[str] = Header(None)):
    """Return the persisted UI settings (from Supabase if logged in)."""
    if SUPABASE_ENABLED and authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        try:
            supabase = get_supabase_client()
            user_response = supabase.auth.get_user(token)
            user_id = user_response.user.id
            
            admin = get_supabase_admin()
            result = admin.table("user_settings").select("*").eq("user_id", user_id).execute()
            
            if result.data and len(result.data) > 0:
                row = result.data[0]
                return {
                    "teams": row.get("teams", []),
                    "newsSources": row.get("news_sources", {}),
                    "newsCount": row.get("news_count", 5)
                }
        except Exception as e:
            print(f"Supabase settings fetch failed: {e}")
    
    # Fallback to local file
    return load_user_settings()


@app.post("/api/settings")
async def update_user_settings(settings: UserSettings, authorization: Optional[str] = Header(None)):
    """Persist settings (to Supabase if logged in, else local file)."""
    payload = settings.dict()
    
    if SUPABASE_ENABLED and authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        try:
            supabase = get_supabase_client()
            user_response = supabase.auth.get_user(token)
            user_id = user_response.user.id
            
            admin = get_supabase_admin()
            admin.table("user_settings").upsert({
                "user_id": user_id,
                "teams": payload.get("teams", []),
                "news_sources": payload.get("newsSources", {}),
                "news_count": payload.get("newsCount", 5),
                "updated_at": datetime.utcnow().isoformat()
            }).execute()
            
            return {
                "status": "ok",
                "saved_at": datetime.utcnow().isoformat(),
                "synced": True
            }
        except Exception as e:
            print(f"Supabase settings save failed: {e}")
    
    # Fallback to local file
    save_user_settings(payload)
    return {
        "status": "ok",
        "saved_at": datetime.utcnow().isoformat(),
        "synced": False
    }

@app.get("/api/dashboard", response_model=DashboardResponse)
async def get_dashboard():
    """
    Get complete dashboard data for all teams.
    Returns teams, games, and news in one response.
    """
    data = load_cache()
    
    teams = []
    for team_name, team_info in data.get("teams", {}).items():
        games_data = team_info.get("games", [])
        news_data = team_info.get("news", [])
        
        # Sort games by date
        games_data.sort(key=lambda x: x.get("date", ""))
        
        teams.append(Team(
            name=team_name,
            league=team_info.get("league", "Unknown"),
            abbrev=team_info.get("abbrev", ""),
            games=[Game(**g) for g in games_data],
            news=[NewsArticle(**n) for n in news_data]
        ))
    
    return DashboardResponse(
        teams=teams,
        fetched_at=data.get("fetched_at", ""),
        timestamp=datetime.now().isoformat()
    )

@app.get("/api/teams")
async def get_teams():
    """Get list of all teams (names and leagues only)."""
    data = load_cache()
    
    teams = []
    for team_name, team_info in data.get("teams", {}).items():
        teams.append({
            "name": team_name,
            "league": team_info.get("league", "Unknown"),
            "abbrev": team_info.get("abbrev", "")
        })
    
    return {"teams": teams}

@app.get("/api/team/{team_name}")
async def get_team(team_name: str):
    """Get detailed data for a specific team."""
    data = load_cache()
    team_info = data.get("teams", {}).get(team_name)
    
    if team_info:
        league = team_info.get("league", "Unknown")
        news_data = fetch_latest_news(team_name, league, team_info.get("news", []))
        return format_team_payload(
            team_name,
            league,
            team_info.get("abbrev", ""),
            team_info.get("games", []),
            news_data
        )
    
    # Not in cache – fetch live data so new teams still show real news
    detection, games, news = fetch_live_team_data(team_name)
    news = fetch_latest_news(team_name, detection.get("league", "Unknown"), news)
    return format_team_payload(
        team_name,
        detection.get("league", "Unknown"),
        detection.get("abbrev", ""),
        games,
        news
    )

@app.get("/api/dashboard/image")
async def get_dashboard_image():
    """Get the dashboard as a PNG image."""
    if not DASHBOARD_IMG.exists():
        raise HTTPException(status_code=404, detail="Dashboard image not found")
    
    return FileResponse(
        DASHBOARD_IMG,
        media_type="image/png",
        filename="sports_dashboard.png"
    )

@app.post("/api/refresh")
async def refresh_data(force: bool = False):
    """Trigger a background job that rebuilds the cache."""
    status = read_refresh_status()
    if status.get("status") == "running" and not force:
        return {
            "status": "already_running",
            "message": "Refresh already running",
            "refresh_id": status.get("refresh_id"),
            "started_at": status.get("started_at")
        }

    if not REFRESH_SCRIPT.exists():
        raise HTTPException(status_code=500, detail="Refresh script missing")

    refresh_id = datetime.utcnow().strftime("%Y%m%d%H%M%S")

    env = os.environ.copy()
    env["SPORTS_HUB_REFRESH_ID"] = refresh_id

    try:
        subprocess.Popen(
            ["python3", str(REFRESH_SCRIPT), "--refresh-id", refresh_id],
            cwd=BASE_DIR,
            env=env
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to start refresh: {exc}")

    return {
        "status": "refresh_started",
        "refresh_id": refresh_id,
        "message": "Refresh started. Check /api/refresh/status for updates."
    }


@app.get("/api/refresh/status")
async def refresh_status():
    """Return current/last refresh job state."""
    return read_refresh_status()

@app.post("/api/team/fetch")
@app.get("/api/team/fetch")
async def fetch_team_data(team_name: str):
    """Fetch schedule and news for a newly added team."""
    try:
        detection, games, news = fetch_live_team_data(team_name)
        
        # Best-effort cache update (may be read-only in serverless envs)
        try:
            cache = load_cache()
            cache.setdefault("teams", {})[team_name] = {
                "league": detection["league"],
                "abbrev": detection.get("abbrev", ""),
                "games": games,
                "news": news
            }
            CACHE_FILE.write_text(json.dumps(cache, indent=2))
            print(f"✓ Saved {team_name} to cache with {len(games)} games and {len(news)} articles")
        except Exception as write_err:
            print(f"Warning: Could not write to cache file: {write_err}")
        
        return {
            "status": "success",
            "team": team_name,
            "league": detection["league"],
            "games_found": len(games),
            "news_found": len(news),
            "games": games,
            "news": news
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch team data: {str(e)}")

@app.get("/api/discover/{team_name}")
async def discover_team(team_name: str):
    """
    Auto-discover data sources and news for a team.
    Returns available data sources and recommended news sources.
    """
    # Team metadata lookup would go here
    # For now, return template
    
    return {
        "team": team_name,
        "data_sources": [],
        "news_sources": [],
        "status": "discovery_in_progress",
        "message": "Searching for data sources..."
    }

@app.get("/api/standings")
async def get_standings():
    """Fetch current standings for all leagues."""
    try:
        import sys
        sys.path.insert(0, str(BASE_DIR / "scripts"))
        from fetch_standings import fetch_all_standings
        
        standings = fetch_all_standings()
        return {
            "status": "success",
            "standings": standings,
            "fetched_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch standings: {str(e)}")

@app.get("/api/whl-schedule/{team_id}")
async def get_whl_schedule(team_id: str):
    """
    Fetch WHL team schedule from HockeyTech API.
    """
    import requests
    
    try:
        params = {
            "feed": "modulekit",
            "view": "schedule",
            "key": os.environ.get("HOCKEYTECH_KEY_WHL", "41b145a848f4bd67"),
            "fmt": "json",
            "client_code": "whl",
            "team_id": team_id,
            "season_id": "79",
            "lang": "en"
        }
        
        response = requests.get("https://lscluster.hockeytech.com/feed/", params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        games = []
        for game in data.get("SiteKit", {}).get("Gamesbydate", []):
            games.append({
                "id": game.get("id"),
                "date": game.get("date_with_day", "")[:10],
                "opponent": game.get("opponent", ""),
                "team_score": int(game.get("goals_for", 0)),
                "opponent_score": int(game.get("goals_against", 0)),
                "status": game.get("game_status", ""),
                "is_home": game.get("location", "") == "Home",
                "result": get_whl_result(game),
                "league": "WHL"
            })
        
        return {"games": games, "team_id": team_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch WHL schedule: {str(e)}")

def get_whl_result(game):
    """Determine W/L/T from WHL game."""
    status = game.get("game_status", "")
    if "Final" in status or "Completed" in status:
        gf = int(game.get("goals_for", 0))
        ga = int(game.get("goals_against", 0))
        if gf > ga:
            return "W"
        elif gf < ga:
            return "L"
        else:
            return "T"
    return "SCHEDULED"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
