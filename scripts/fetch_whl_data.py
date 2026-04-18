#!/usr/bin/env python3
"""
Fetch WHL team schedules from HockeyTech API and update cache
"""

import json
import os
import requests
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).parent.parent
CACHE_FILE = BASE_DIR / "data" / "cache" / "all_teams.json"

# WHL team IDs from HockeyTech
WHL_TEAM_IDS = {
    "Edmonton Oil Kings": "209",
    "Calgary Hitmen": "207",
    "Red Deer Rebels": "215",
    "Lethbridge Hurricanes": "211",
    "Medicine Hat Tigers": "212"
}

# Team ID to name mapping
WHL_TEAM_NAMES = {
    "207": "CGY",
    "209": "EDM",
    "211": "LTH",
    "212": "MH",
    "213": "PG",
    "214": "PA",
    "215": "RD",
    "216": "SWC",
    "217": "KAM",
    "218": "VAN",
    "219": "VIC",
    "220": "KEL",
    "221": "POR",
    "222": "SEA",
    "223": "SPO",
    "224": "TRI",
    "225": "EVE",
    "226": "WPG",
    "227": "MOO",
    "228": "SAS",
    "229": "REG",
    "230": "BRN"
}

def fetch_whl_schedule(team_id):
    """Fetch schedule for a WHL team."""
    params = {
        "feed": "modulekit",
        "view": "schedule",
        "key": os.environ.get("HOCKEYTECH_KEY_WHL", "41b145a848f4bd67"),
        "fmt": "json",
        "client_code": "whl",
        "lang": "en"
    }
    
    response = requests.get("https://lscluster.hockeytech.com/feed/", params=params, timeout=10)
    response.raise_for_status()
    data = response.json()
    
    games = []
    # Filter schedule for this team's games
    for game in data.get("SiteKit", {}).get("Schedule", []):
        home_team = game.get("home_team", "")
        visiting_team = game.get("visiting_team", "")
        
        # Skip if this game doesn't involve our team
        if team_id not in [home_team, visiting_team]:
            continue
        
        status = game.get("game_status", "")
        is_home = home_team == team_id
        
        if is_home:
            team_score = int(game.get("home_goal_count", 0))
            opp_score = int(game.get("visiting_goal_count", 0))
        else:
            team_score = int(game.get("visiting_goal_count", 0))
            opp_score = int(game.get("home_goal_count", 0))
        
        # Get opponent name
        opponent_id = visiting_team if is_home else home_team
        opponent = WHL_TEAM_NAMES.get(opponent_id, f"Team {opponent_id}")
        
        if "Final" in status:
            result = "W" if team_score > opp_score else ("L" if team_score < opp_score else "T")
        else:
            result = "SCHEDULED"
        
        games.append({
            "id": game.get("id"),
            "date": game.get("date_played", ""),
            "opponent": opponent,
            "team_score": team_score,
            "opponent_score": opp_score,
            "status": status,
            "is_home": is_home,
            "result": result,
            "league": "WHL"
        })
    
    return games

def main():
    # Load existing cache
    with open(CACHE_FILE) as f:
        cache = json.load(f)
    
    # Fetch WHL teams
    for team_name, team_id in WHL_TEAM_IDS.items():
        print(f"Fetching {team_name} (ID: {team_id})...")
        
        try:
            games = fetch_whl_schedule(team_id)
            
            if team_name not in cache["teams"]:
                cache["teams"][team_name] = {
                    "league": "WHL",
                    "abbrev": "",
                    "games": [],
                    "news": []
                }
            
            cache["teams"][team_name]["games"] = games
            
            completed = [g for g in games if g["status"] == "Final"]
            upcoming = [g for g in games if g["result"] == "SCHEDULED"]
            
            print(f"  ✅ {len(games)} games ({len(completed)} completed, {len(upcoming)} upcoming)")
            
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    # Update timestamp
    cache["fetched_at"] = datetime.now().isoformat()
    
    # Save
    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f, indent=2)
    
    print(f"\n✅ Cache updated with WHL data")

if __name__ == "__main__":
    main()
