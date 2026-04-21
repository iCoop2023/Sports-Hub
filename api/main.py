#!/usr/bin/env python3
"""
Sports Hub API Server
FastAPI backend for iOS app
"""

from fastapi import FastAPI, HTTPException, Header, Cookie, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pathlib import Path
import json
import os
import sys
import shutil
import tempfile
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
    from .auth import router as auth_router, resolve_token
except Exception:
    try:
        from auth import router as auth_router, resolve_token
    except Exception:
        auth_router = None
        def resolve_token(cookie_token, authorization):
            if cookie_token:
                return cookie_token
            if authorization and authorization.startswith("Bearer "):
                return authorization[len("Bearer "):]
            return None

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

# Rate limiter — wired here so slowapi can intercept excesses app-wide.
try:
    from slowapi.errors import RateLimitExceeded
    from slowapi import _rate_limit_exceeded_handler
    try:
        from .rate_limit import limiter
    except Exception:
        from rate_limit import limiter
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
except Exception as e:
    print(f"Rate limiter not configured: {e}")

# CORS — restrict to the frontend origins we actually serve.
# Override via CORS_ALLOWED_ORIGINS env var: comma-separated list of origins.
# Vercel generates per-deployment URLs like
#   sports-<hash>-<team>.vercel.app
# in addition to the canonical sports-hub-sepia.vercel.app, so we also
# accept any *.vercel.app subdomain via regex. Override the pattern with
# CORS_ALLOWED_ORIGIN_REGEX if you need to tighten it.
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
ALLOWED_ORIGIN_REGEX = os.environ.get(
    "CORS_ALLOWED_ORIGIN_REGEX",
    r"https://[a-z0-9-]+\.vercel\.app",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Include auth router if available
if auth_router:
    app.include_router(auth_router)

# Paths
BASE_DIR = Path(__file__).parent.parent
DASHBOARD_IMG = BASE_DIR / "sports_dashboard.png"
SETTINGS_FILE = BASE_DIR / "data" / "user_settings.json"

# Cache and status live in /tmp so they are writable on serverless platforms.
# The bundled data/cache files are used as a read-only seed if /tmp is empty.
_TMP_CACHE_DIR = Path(tempfile.gettempdir()) / "sports_hub"
_TMP_CACHE_DIR.mkdir(parents=True, exist_ok=True)

CACHE_FILE = _TMP_CACHE_DIR / "all_teams.json"
NEWS_CACHE_FILE = _TMP_CACHE_DIR / "news_cache.json"
REFRESH_STATUS = _TMP_CACHE_DIR / "refresh_status.json"

# Seed from the bundled copy if the writable copy doesn't exist yet
_BUNDLED_CACHE = BASE_DIR / "data" / "cache" / "all_teams.json"
_BUNDLED_NEWS  = BASE_DIR / "data" / "cache" / "news_cache.json"
if not CACHE_FILE.exists() and _BUNDLED_CACHE.exists():
    import shutil
    shutil.copy2(_BUNDLED_CACHE, CACHE_FILE)
if not NEWS_CACHE_FILE.exists() and _BUNDLED_NEWS.exists():
    import shutil
    shutil.copy2(_BUNDLED_NEWS, NEWS_CACHE_FILE)


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


_COMPLETED_STATUSES = {"off", "final", "full time", "ft", "completed", "complete", "game over", "f/ot", "f/so"}
# "crit" = NHL playoff critical game (upcoming, not yet played)
_UPCOMING_STATUSES = {"fut", "scheduled", "pre", "preview", "status_scheduled", "tbd", "crit"}
# Live game statuses – shown in the recent section with current score
_LIVE_STATUSES = {"live", "in progress", "in_progress", "halftime", "end of period", "end of half", "intermission"}

def format_team_payload(team_name: str, league: str, abbrev: str, games: List[Dict], news: List[Dict]):
    games_sorted = sorted(games, key=lambda x: x.get("date", ""))

    def _is_completed(g):
        s = (g.get("status") or "").lower().strip()
        return s in _COMPLETED_STATUSES or s.startswith("final")

    def _is_live(g):
        s = (g.get("status") or "").lower().strip()
        r = (g.get("result") or "").upper()
        return r == "LIVE" or s in _LIVE_STATUSES

    def _is_upcoming(g):
        s = (g.get("status") or "").lower().strip()
        return s in _UPCOMING_STATUSES

    completed = [g for g in games_sorted if _is_completed(g)]
    live = [g for g in games_sorted if _is_live(g)]
    upcoming = [g for g in games_sorted if _is_upcoming(g)]

    # Live games surface first in recent (most timely thing happening right now)
    recent_all = sorted(live + completed, key=lambda x: x.get("date", ""))

    return {
        "name": team_name,
        "league": league,
        "abbrev": abbrev,
        "recent_games": recent_all[-5:],
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

def load_cache() -> dict:
    """Load cached team data, returning an empty structure if not yet populated."""
    if not CACHE_FILE.exists():
        return {"teams": {}}
    try:
        with open(CACHE_FILE) as f:
            return json.load(f)
    except Exception:
        return {"teams": {}}


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
async def get_user_settings(
    sh_access_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None),
):
    """Return the persisted UI settings (from Supabase if logged in)."""
    token = resolve_token(sh_access_token, authorization)
    if SUPABASE_ENABLED and token:
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
async def update_user_settings(
    settings: UserSettings,
    sh_access_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None),
):
    """Persist settings (to Supabase if logged in, else local file)."""
    payload = settings.dict()

    token = resolve_token(sh_access_token, authorization)
    if SUPABASE_ENABLED and token:
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

def _cache_is_stale(games: List[Dict]) -> bool:
    """True if any scheduled game in the cache has a date that's already passed."""
    today = datetime.utcnow().strftime("%Y-%m-%d")
    scheduled = {"fut", "scheduled", "crit", "pre", "preview"}
    return any(
        g.get("date", "9999") < today and
        (g.get("status") or "").lower() in scheduled
        for g in games
    )


@app.get("/api/team/{team_name}")
async def get_team(team_name: str):
    """Get detailed data for a specific team."""
    data = load_cache()
    team_info = data.get("teams", {}).get(team_name)
    cached_games = team_info.get("games", []) if team_info else []

    # Use cache only when it has games AND none of the scheduled entries are past
    if cached_games and not _cache_is_stale(cached_games):
        league = team_info.get("league", "Unknown")
        news_data = fetch_latest_news(team_name, league, team_info.get("news", []))
        return format_team_payload(
            team_name,
            league,
            team_info.get("abbrev", ""),
            cached_games,
            news_data
        )

    # Cache missing, empty, or stale — fetch live
    try:
        detection, games, news = fetch_live_team_data(team_name)
    except Exception as exc:
        if not team_info:
            raise HTTPException(status_code=404, detail=str(exc))
        # Live fetch failed — serve stale cache rather than an empty response
        league = team_info.get("league", "Unknown")
        news_data = fetch_latest_news(team_name, league, team_info.get("news", []))
        return format_team_payload(team_name, league, team_info.get("abbrev", ""), cached_games, news_data)

    # Live fetch returned no games — fall back to stale cache rather than "Offseason"
    if not games and cached_games:
        league = detection.get("league", team_info.get("league", "Unknown"))
        news_data = fetch_latest_news(team_name, league, team_info.get("news", []))
        return format_team_payload(team_name, league, team_info.get("abbrev", ""), cached_games, news_data)

    # Write result back to cache so subsequent requests within this instance are instant
    if games:
        try:
            cache = load_cache()
            cache.setdefault("teams", {})[team_name] = {
                "league": detection["league"],
                "abbrev": detection.get("abbrev", ""),
                "games": games,
            }
            CACHE_FILE.write_text(json.dumps(cache, indent=2))
        except Exception:
            pass

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

def _run_refresh_inprocess(refresh_id: str) -> None:
    """Fetch all teams and rebuild the cache entirely in-process.
    Runs inside a BackgroundTask so it doesn't block the HTTP response."""
    def _write_status(payload: dict) -> None:
        payload.setdefault("refresh_id", refresh_id)
        payload.setdefault("updated_at", datetime.utcnow().isoformat() + "Z")
        REFRESH_STATUS.write_text(json.dumps(payload))

    _write_status({"status": "running", "message": "Fetching schedules…",
                   "started_at": datetime.utcnow().isoformat() + "Z"})
    try:
        scripts_dir = str(BASE_DIR / "scripts")
        if scripts_dir not in sys.path:
            sys.path.insert(0, scripts_dir)

        from fetch_all import load_teams, fetch_nhl_team, fetch_espn_team, fetch_whl_team
        from league_discovery import fetch_mlb_schedule, fetch_espn_schedule

        teams = load_teams()
        all_results: Dict = {}

        for team in teams.get("nhl", []):
            try:
                games = fetch_nhl_team(team["abbrev"], team["name"])
                all_results[team["name"]] = {"abbrev": team["abbrev"], "league": "NHL",
                                             "games": sorted(games, key=lambda x: x.get("date", ""))}
            except Exception as e:
                print(f"NHL fetch failed for {team['name']}: {e}")

        for team in teams.get("mlb", []):
            try:
                games = fetch_mlb_schedule(team["name"])
                all_results[team["name"]] = {"abbrev": team["abbrev"], "league": "MLB",
                                             "games": sorted(games, key=lambda x: x.get("date", ""))}
            except Exception as e:
                print(f"MLB fetch failed for {team['name']}: {e}")

        for league in ("NFL", "NBA", "CFL"):
            for team in teams.get(league.lower(), []):
                try:
                    games = fetch_espn_schedule(team["name"], team["abbrev"], league)
                    all_results[team["name"]] = {"abbrev": team["abbrev"], "league": league,
                                                 "games": sorted(games, key=lambda x: x.get("date", ""))}
                except Exception as e:
                    print(f"{league} fetch failed for {team['name']}: {e}")

        for team in teams.get("soccer", []):
            try:
                games = fetch_espn_team("La Liga", team["abbrev"], team["name"])
                all_results[team["name"]] = {"abbrev": team["abbrev"], "league": "La Liga",
                                             "games": sorted(games, key=lambda x: x.get("date", ""))}
            except Exception as e:
                print(f"Soccer fetch failed for {team['name']}: {e}")

        for team in teams.get("whl", []):
            if not team.get("team_id"):
                continue
            try:
                games = fetch_whl_team(team["team_id"])
                all_results[team["name"]] = {"abbrev": team.get("abbrev", ""), "league": "WHL",
                                             "games": sorted(games, key=lambda x: x.get("date", ""))}
            except Exception as e:
                print(f"WHL fetch failed for {team['name']}: {e}")

        _write_status({"status": "running", "message": "Fetching news…",
                       "started_at": datetime.utcnow().isoformat() + "Z"})

        try:
            from fetch_news import search_team_news
            news_cache: Dict = {}
            for name, info in all_results.items():
                try:
                    news_cache[name] = search_team_news(name, info["league"])
                except Exception:
                    pass
            NEWS_CACHE_FILE.write_text(json.dumps({"teams": news_cache}, indent=2))
        except Exception as e:
            print(f"News fetch failed: {e}")

        CACHE_FILE.write_text(json.dumps({"fetched_at": datetime.utcnow().isoformat(),
                                          "teams": all_results}, indent=2))

        _write_status({"status": "success",
                       "message": f"Refreshed {len(all_results)} teams.",
                       "completed_at": datetime.utcnow().isoformat() + "Z"})

    except Exception as exc:
        _write_status({"status": "error", "message": str(exc),
                       "completed_at": datetime.utcnow().isoformat() + "Z"})


@app.post("/api/refresh")
async def refresh_data(background_tasks: BackgroundTasks, force: bool = False):
    """Trigger an in-process background refresh of all team data."""
    status = read_refresh_status()
    if status.get("status") == "running" and not force:
        return {"status": "already_running", "message": "Refresh already in progress.",
                "refresh_id": status.get("refresh_id")}

    refresh_id = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    background_tasks.add_task(_run_refresh_inprocess, refresh_id)
    return {"status": "refresh_started", "refresh_id": refresh_id,
            "message": "Refresh started. Poll /api/refresh/status for updates."}


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
