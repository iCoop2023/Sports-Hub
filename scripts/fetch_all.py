#!/usr/bin/env python3
"""
Unified Sports Data Fetcher
Fetches, deduplicates, and caches all team data.
"""

import json
import os
import sys
import requests
from datetime import datetime, timedelta
from pathlib import Path

# Reuse the well-tested fetch functions from league_discovery
sys.path.insert(0, str(Path(__file__).parent))
from league_discovery import (
    fetch_mlb_schedule, fetch_espn_schedule, MLB_TEAM_IDS,
    ESPN_NBA_IDS, ESPN_NFL_IDS,
)

# Configuration
CACHE_DIR = Path(__file__).parent.parent / "data" / "cache"
TEAMS_CONFIG = Path(__file__).parent.parent / "config" / "teams.json"

# API Bases
NHL_API = "https://api-web.nhle.com/v1"
ESPN_API = "https://site.api.espn.com/apis/site/v2/sports"

NHL_ABBREV_TO_NAME = {
    "ANA": "Anaheim Ducks", "BOS": "Boston Bruins", "BUF": "Buffalo Sabres",
    "CGY": "Calgary Flames", "CAR": "Carolina Hurricanes", "CHI": "Chicago Blackhawks",
    "COL": "Colorado Avalanche", "CBJ": "Columbus Blue Jackets", "DAL": "Dallas Stars",
    "DET": "Detroit Red Wings", "EDM": "Edmonton Oilers", "FLA": "Florida Panthers",
    "LAK": "Los Angeles Kings", "MIN": "Minnesota Wild", "MTL": "Montreal Canadiens",
    "NSH": "Nashville Predators", "NJD": "New Jersey Devils", "NYI": "New York Islanders",
    "NYR": "New York Rangers", "OTT": "Ottawa Senators", "PHI": "Philadelphia Flyers",
    "PIT": "Pittsburgh Penguins", "SJS": "San Jose Sharks", "SEA": "Seattle Kraken",
    "STL": "St. Louis Blues", "TBL": "Tampa Bay Lightning", "TOR": "Toronto Maple Leafs",
    "UTA": "Utah Hockey Club", "VAN": "Vancouver Canucks", "VGK": "Vegas Golden Knights",
    "WSH": "Washington Capitals", "WPG": "Winnipeg Jets",
}

# League mappings
LEAGUE_MAP = {
    "MLB": "baseball/mlb",
    "NFL": "football/nfl",
    "NBA": "basketball/nba",
    "CFL": "football/cfl",
    "La Liga": "soccer/esp.1"
}

HOCKEY_TECH_KEY = os.environ.get("HOCKEYTECH_KEY_WHL", "41b145a848f4bd67")
HOCKEY_TECH_CLIENT = "whl"
HOCKEY_TECH_SEASON = "79"

def load_teams():
    """Load team configuration."""
    with open(TEAMS_CONFIG) as f:
        return json.load(f)

def fetch_nhl_team(abbrev, team_name):
    """Fetch NHL team schedule from NHL API."""
    games = {}  # Use dict to dedupe by game ID
    today = datetime.now()
    
    # Check past 7 days + next 7 days
    for offset in range(-7, 8):
        date = (today + timedelta(days=offset)).strftime("%Y-%m-%d")
        try:
            response = requests.get(f"{NHL_API}/scoreboard/{date}", timeout=10)
            response.raise_for_status()
            data = response.json()
            
            for day_data in data.get("gamesByDate", []):
                for game in day_data.get("games", []):
                    game_id = game.get("id")
                    home = game.get("homeTeam", {})
                    away = game.get("awayTeam", {})
                    home_abbrev = home.get("abbrev", "")
                    away_abbrev = away.get("abbrev", "")
                    
                    if abbrev in [home_abbrev, away_abbrev]:
                        is_home = abbrev == home_abbrev
                        opp_abbrev_raw = away_abbrev if is_home else home_abbrev
                        opponent = NHL_ABBREV_TO_NAME.get(opp_abbrev_raw, opp_abbrev_raw)
                        
                        home_score = home.get("score", 0)
                        away_score = away.get("score", 0)
                        team_score = home_score if is_home else away_score
                        opp_score = away_score if is_home else home_score
                        
                        status = game.get("gameState", "")
                        
                        # Determine result
                        if status in ["FINAL", "OFF"]:
                            if team_score > opp_score:
                                result = "W"
                            elif team_score < opp_score:
                                result = "L"
                            else:
                                result = "T"
                        elif status == "LIVE":
                            result = "LIVE"
                        else:
                            result = "SCHEDULED"
                        
                        games[game_id] = {
                            "id": game_id,
                            "date": game.get("gameDate"),
                            "opponent": opponent,
                            "team_score": team_score,
                            "opponent_score": opp_score,
                            "status": status,
                            "result": result,
                            "is_home": is_home,
                            "league": "NHL"
                        }
        except:
            continue
    
    return list(games.values())

def fetch_espn_team(league, team_abbrev, team_name):
    """Fetch team data from ESPN API."""
    league_path = LEAGUE_MAP.get(league)
    if not league_path:
        return []
    
    games = {}
    
    try:
        # First, find the team ID from teams endpoint
        teams_response = requests.get(f"{ESPN_API}/{league_path}/teams", timeout=10)
        teams_response.raise_for_status()
        teams_data = teams_response.json()
        
        team_id = None
        for team in teams_data.get("sports", [{}])[0].get("leagues", [{}])[0].get("teams", []):
            team_info = team.get("team", {})
            if team_info.get("abbreviation") == team_abbrev:
                team_id = team_info.get("id")
                break
        
        if not team_id:
            print(f"Could not find team ID for {team_abbrev}")
            return []
        
        schedule_url = f"{ESPN_API}/{league_path}/teams/{team_id}/schedule"
        response = requests.get(schedule_url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        for event in data.get("events", []):
            event_id = event.get("id")
            
            for competition in event.get("competitions", []):
                competitors = competition.get("competitors", [])
                if len(competitors) < 2:
                    continue
                
                home_team = competitors[0] if competitors[0].get("homeAway") == "home" else competitors[1]
                away_team = competitors[1] if competitors[0].get("homeAway") == "home" else competitors[0]
                
                home_abbrev = home_team.get("team", {}).get("abbreviation", "")
                away_abbrev = away_team.get("team", {}).get("abbreviation", "")
                
                if team_abbrev in [home_abbrev, away_abbrev]:
                    is_home = team_abbrev == home_abbrev
                    opp_team = away_team if is_home else home_team
                    opponent = (opp_team.get("team", {}).get("displayName")
                                or opp_team.get("team", {}).get("abbreviation", ""))
                    
                    # Safely parse scores (might be int, str, or dict)
                    def safe_int(val, default=0):
                        if isinstance(val, (int, float)):
                            return int(val)
                        if isinstance(val, str):
                            try:
                                return int(val)
                            except:
                                return default
                        if isinstance(val, dict):
                            return safe_int(val.get("value", default), default)
                        return default
                    
                    home_score = safe_int(home_team.get("score", 0))
                    away_score = safe_int(away_team.get("score", 0))
                    team_score = home_score if is_home else away_score
                    opp_score = away_score if is_home else home_score
                    
                    status_obj = competition.get("status", {})
                    status_type = status_obj.get("type", {})
                    status = status_type.get("description", "")
                    completed = status_type.get("completed", False)
                    
                    # Determine result
                    if completed:
                        if team_score > opp_score:
                            result = "W"
                        elif team_score < opp_score:
                            result = "L"
                        else:
                            result = "T"
                    elif status_type.get("state") == "in":
                        result = "LIVE"
                    else:
                        result = "SCHEDULED"
                    
                    games[event_id] = {
                        "id": event_id,
                        "date": event.get("date", ""),
                        "opponent": opponent,
                        "team_score": team_score,
                        "opponent_score": opp_score,
                        "status": status,
                        "result": result,
                        "is_home": is_home,
                        "league": league
                    }
    except Exception as e:
        print(f"Error fetching {league} data: {e}")
    
    return list(games.values())


def fetch_whl_team(team_id):
    """Fetch WHL schedule from HockeyTech."""
    params = {
        "feed": "modulekit",
        "view": "schedule",
        "key": HOCKEY_TECH_KEY,
        "fmt": "json",
        "client_code": HOCKEY_TECH_CLIENT,
        "team_id": team_id,
        "season_id": HOCKEY_TECH_SEASON,
        "lang": "en"
    }

    response = requests.get("https://lscluster.hockeytech.com/feed/", params=params, timeout=10)
    response.raise_for_status()
    data = response.json()

    games = []
    for game in data.get("SiteKit", {}).get("Gamesbydate", []):
        status = game.get("game_status", "")
        gf = int(game.get("goals_for", 0))
        ga = int(game.get("goals_against", 0))

        if "Final" in status:
            result = "W" if gf > ga else ("L" if gf < ga else "T")
            normalized_status = "Final"
        else:
            result = "SCHEDULED"
            normalized_status = "Scheduled"

        games.append({
            "id": game.get("id"),
            "date": game.get("date_with_day", "")[:10],
            "opponent": game.get("opponent", ""),
            "team_score": gf,
            "opponent_score": ga,
            "status": normalized_status,
            "is_home": game.get("location", "") == "Home",
            "result": result,
            "league": "WHL"
        })

    return games

def main():
    """Main execution."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    teams = load_teams()
    
    all_results = {}
    
    # NHL
    for team in teams.get("nhl", []):
        print(f"Fetching {team['name']}...")
        games = fetch_nhl_team(team['abbrev'], team['name'])
        all_results[team['name']] = {
            "abbrev": team['abbrev'],
            "league": "NHL",
            "games": sorted(games, key=lambda x: x.get('date', ''))
        }
    
    # MLB — official MLB Stats API
    for team in teams.get("mlb", []):
        print(f"Fetching {team['name']} (MLB)...")
        games = fetch_mlb_schedule(team['name'])
        all_results[team['name']] = {
            "abbrev": team['abbrev'],
            "league": "MLB",
            "games": sorted(games, key=lambda x: x.get('date', ''))
        }

    # NFL — ESPN with hardcoded IDs
    for team in teams.get("nfl", []):
        print(f"Fetching {team['name']} (NFL)...")
        games = fetch_espn_schedule(team['name'], team['abbrev'], "NFL")
        all_results[team['name']] = {
            "abbrev": team['abbrev'],
            "league": "NFL",
            "games": sorted(games, key=lambda x: x.get('date', ''))
        }

    # NBA — ESPN with hardcoded IDs
    for team in teams.get("nba", []):
        print(f"Fetching {team['name']} (NBA)...")
        games = fetch_espn_schedule(team['name'], team['abbrev'], "NBA")
        all_results[team['name']] = {
            "abbrev": team['abbrev'],
            "league": "NBA",
            "games": sorted(games, key=lambda x: x.get('date', ''))
        }

    # La Liga — ESPN soccer
    for team in teams.get("soccer", []):
        print(f"Fetching {team['name']} (soccer)...")
        games = fetch_espn_team("La Liga", team['abbrev'], team['name'])
        all_results[team['name']] = {
            "abbrev": team['abbrev'],
            "league": "La Liga",
            "games": sorted(games, key=lambda x: x.get('date', ''))
        }

    # WHL (HockeyTech)
    for team in teams.get("whl", []):
        team_id = team.get("team_id")
        if not team_id:
            continue
        print(f"Fetching {team['name']} (WHL)...")
        try:
            games = fetch_whl_team(team_id)
        except Exception as exc:
            print(f"Error fetching WHL data for {team['name']}: {exc}")
            games = []

        all_results[team['name']] = {
            "abbrev": team.get("abbrev", ""),
            "league": "WHL",
            "games": sorted(games, key=lambda x: x.get('date', ''))
        }

    # Save cache
    cache_file = CACHE_DIR / "all_teams.json"
    cache_data = {
        "fetched_at": datetime.now().isoformat(),
        "teams": all_results
    }
    
    with open(cache_file, "w") as f:
        json.dump(cache_data, f, indent=2)
    
    print(f"\n✅ Data cached: {cache_file}")
    print(f"📊 Teams fetched: {len(all_results)}")
    
    total_games = sum(len(t['games']) for t in all_results.values())
    print(f"🎮 Total games found: {total_games}")

if __name__ == "__main__":
    main()
