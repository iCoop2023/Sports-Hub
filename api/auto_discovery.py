"""
Auto-discovery service for team data and news sources
Finds schedule APIs and news sources based on team metadata
"""

import os
import requests
from typing import Dict, List, Optional
import json
from datetime import datetime

# HockeyTech API for CHL leagues.
# These are public feed keys embedded in the WHL/OHL/QMJHL websites (visible
# in their client JS), but we load them from env vars so they can be rotated
# or overridden without a code change. Fallbacks match the currently-published
# public values.
HOCKEYTECH_BASE = "https://lscluster.hockeytech.com/feed/"
HOCKEYTECH_KEYS = {
    "whl": os.environ.get("HOCKEYTECH_KEY_WHL", "41b145a848f4bd67"),
    "ohl": os.environ.get("HOCKEYTECH_KEY_OHL", "2976319eb44abe94"),
    "qmjhl": os.environ.get("HOCKEYTECH_KEY_QMJHL", "f322673b6bcae299"),
}

def fetch_whl_schedule(team_id: str) -> List[Dict]:
    """Fetch schedule for a WHL team using HockeyTech API."""
    try:
        params = {
            "feed": "modulekit",
            "view": "schedule",
            "key": HOCKEYTECH_KEYS["whl"],
            "fmt": "json",
            "client_code": "whl",
            "team_id": team_id,
            "season_id": "79",  # Current season
            "lang": "en"
        }
        
        response = requests.get(HOCKEYTECH_BASE, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        games = []
        for game in data.get("SiteKit", {}).get("Gamesbydate", []):
            games.append({
                "id": game.get("id"),
                "date": game.get("date_with_day", "")[:10],
                "opponent": game.get("opponent", ""),
                "team_score": int(game.get("team_goals", 0)),
                "opponent_score": int(game.get("opponent_goals", 0)),
                "status": game.get("game_status", ""),
                "is_home": game.get("game_location", "") == "Home",
                "result": get_game_result(game),
                "league": "WHL"
            })
        
        return games
    except Exception as e:
        print(f"Error fetching WHL schedule: {e}")
        return []

def fetch_ohl_schedule(team_id: str) -> List[Dict]:
    """Fetch schedule for an OHL team using HockeyTech API."""
    try:
        params = {
            "feed": "modulekit",
            "view": "schedule",
            "key": HOCKEYTECH_KEYS["ohl"],
            "fmt": "json",
            "client_code": "ohl",
            "team_id": team_id,
            "season_id": "79",
            "lang": "en"
        }
        
        response = requests.get(HOCKEYTECH_BASE, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        games = []
        for game in data.get("SiteKit", {}).get("Gamesbydate", []):
            games.append({
                "id": game.get("id"),
                "date": game.get("date_with_day", "")[:10],
                "opponent": game.get("opponent", ""),
                "team_score": int(game.get("team_goals", 0)),
                "opponent_score": int(game.get("opponent_goals", 0)),
                "status": game.get("game_status", ""),
                "is_home": game.get("game_location", "") == "Home",
                "result": get_game_result(game),
                "league": "OHL"
            })
        
        return games
    except Exception as e:
        print(f"Error fetching OHL schedule: {e}")
        return []

def get_game_result(game: Dict) -> str:
    """Determine game result (W/L/SCHEDULED)."""
    status = game.get("game_status", "")
    if status in ["Final", "Completed"]:
        team_goals = int(game.get("team_goals", 0))
        opp_goals = int(game.get("opponent_goals", 0))
        if team_goals > opp_goals:
            return "W"
        elif team_goals < opp_goals:
            return "L"
        else:
            return "T"
    return "SCHEDULED"

def discover_team_data_source(team_name: str, league: str, metadata: Dict) -> Optional[Dict]:
    """
    Discover the data source for a team based on league and metadata.
    Returns API info or None if not found.
    """
    
    # WHL teams
    if league == "WHL" and metadata.get("whl_id"):
        return {
            "type": "hockeytech",
            "league": "whl",
            "team_id": metadata["whl_id"],
            "fetcher": fetch_whl_schedule
        }
    
    # OHL teams
    if league == "OHL" and metadata.get("ohl_id"):
        return {
            "type": "hockeytech",
            "league": "ohl",
            "team_id": metadata["ohl_id"],
            "fetcher": fetch_ohl_schedule
        }
    
    # CFL teams - use ESPN
    if league == "CFL" and metadata.get("cfl_code"):
        return {
            "type": "espn",
            "sport": "football",
            "league": "cfl",
            "team_code": metadata["cfl_code"]
        }
    
    # ESPN-covered teams
    if metadata.get("espn_id"):
        sport_map = {
            "NHL": "hockey/nhl",
            "MLB": "baseball/mlb",
            "NBA": "basketball/nba",
            "NFL": "football/nfl",
            "MLS": "soccer/usa.1"
        }
        if league in sport_map:
            return {
                "type": "espn",
                "sport_path": sport_map[league],
                "team_id": metadata["espn_id"]
            }
    
    return None

def get_news_sources_for_team(team_name: str, metadata: Dict, league: str) -> List[Dict]:
    """
    Get recommended news sources for a team based on location and league.
    """
    sources = []
    
    # Local sources by city
    city = metadata.get("city", "")
    local_sources = {
        "Edmonton": ["edmontonjournal.com", "cbc.ca/news/canada/edmonton"],
        "Calgary": ["calgaryherald.com", "cbc.ca/news/canada/calgary"],
        "Toronto": ["thestar.com", "cbc.ca/news/canada/toronto"],
        "Vancouver": ["vancouversun.com", "cbc.ca/news/canada/british-columbia"],
        "Montreal": ["montrealgazette.com", "cbc.ca/news/canada/montreal"],
        "Pittsburgh": ["post-gazette.com"],
        "Kansas City": ["kansascity.com"]
    }
    
    if city in local_sources:
        sources.extend(local_sources[city])
    
    # National sources by country
    country = metadata.get("country", "")
    if country == "Canada":
        sources.extend(["tsn.ca", "sportsnet.ca", "cbc.ca/sports"])
    elif country == "USA":
        sources.extend(["espn.com", "si.com"])
    elif country == "Spain":
        sources.extend(["marca.com", "as.com"])
    
    # League-specific sources
    league_sources = {
        "WHL": ["whl.ca", "chl.ca"],
        "OHL": ["ohl.ca", "chl.ca"],
        "QMJHL": ["qmjhl.ca", "chl.ca"],
        "CFL": ["cfl.ca", "3downnation.com"],
        "CEBL": ["cebl.ca"],
        "MLS": ["mlssoccer.com"]
    }
    
    if league in league_sources:
        sources.extend(league_sources[league])
    
    return list(set(sources))  # Remove duplicates
