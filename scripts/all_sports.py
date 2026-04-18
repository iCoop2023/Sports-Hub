#!/usr/bin/env python3
"""
All Sports Fetcher
Retrieves scores and schedules for all of J's favorite teams.
"""

import json
import requests
from datetime import datetime, timedelta
from pathlib import Path

# Configuration
CACHE_DIR = Path(__file__).parent.parent / "data" / "cache"
TEAMS_CONFIG = Path(__file__).parent.parent / "config" / "teams.json"

# API Bases
NHL_API = "https://api-web.nhle.com/v1"
ESPN_API = "https://site.api.espn.com/apis/site/v2/sports"

# ESPN League mappings
LEAGUE_MAP = {
    "MLB": "baseball/mlb",
    "NFL": "football/nfl",
    "NBA": "basketball/nba",
    "CFL": "football/cfl"
}

def load_teams():
    """Load team configuration."""
    with open(TEAMS_CONFIG) as f:
        return json.load(f)

def fetch_nhl_team(abbrev):
    """Fetch NHL team schedule from NHL API."""
    games = []
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
                    home = game.get("homeTeam", {}).get("abbrev", "")
                    away = game.get("awayTeam", {}).get("abbrev", "")
                    
                    if abbrev in [home, away]:
                        games.append({
                            "date": game.get("gameDate"),
                            "opponent": away if abbrev == home else home,
                            "score": f"{game.get('awayTeam', {}).get('score', 0)} - {game.get('homeTeam', {}).get('score', 0)}",
                            "status": game.get("gameState"),
                            "is_home": abbrev == home
                        })
        except:
            continue
    
    return games

def fetch_espn_team(league, team_abbrev):
    """Fetch team data from ESPN API."""
    league_path = LEAGUE_MAP.get(league)
    if not league_path:
        return []
    
    games = []
    
    try:
        # Fetch scoreboard
        response = requests.get(f"{ESPN_API}/{league_path}/scoreboard", timeout=10)
        response.raise_for_status()
        data = response.json()
        
        for event in data.get("events", []):
            for competition in event.get("competitions", []):
                home_team = competition.get("competitors", [])[0]
                away_team = competition.get("competitors", [])[1]
                
                home_abbrev = home_team.get("team", {}).get("abbreviation", "")
                away_abbrev = away_team.get("team", {}).get("abbreviation", "")
                
                if team_abbrev in [home_abbrev, away_abbrev]:
                    is_home = team_abbrev == home_abbrev
                    opponent = away_abbrev if is_home else home_abbrev
                    
                    games.append({
                        "date": event.get("date", ""),
                        "opponent": opponent,
                        "score": f"{away_team.get('score', 0)} - {home_team.get('score', 0)}",
                        "status": competition.get("status", {}).get("type", {}).get("description", ""),
                        "is_home": is_home
                    })
    except Exception as e:
        print(f"Error fetching {league} data: {e}")
    
    return games

def format_game(game):
    """Format a game for display."""
    status = game.get("status", "")
    score = game.get("score", "")
    opponent = game.get("opponent", "")
    location = "Home" if game.get("is_home") else "Away"
    
    return f"{game['date'][:10]} | {status:15} | vs {opponent:4} ({location}) | {score}"

def main():
    """Main execution."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    teams = load_teams()
    
    all_results = {}
    
    print("🏒 NHL Teams")
    print("=" * 80)
    for team in teams.get("nhl", []):
        print(f"\n{team['name']} ({team['abbrev']})")
        games = fetch_nhl_team(team['abbrev'])
        
        if games:
            # Sort by date
            sorted_games = sorted(games, key=lambda x: x.get('date', ''))
            recent = [g for g in sorted_games if g['status'] in ['FINAL', 'OFF']][-3:]
            upcoming = [g for g in sorted_games if g['status'] == 'FUT'][:3]
            
            if recent:
                print("  Recent:")
                for game in recent:
                    print(f"    {format_game(game)}")
            
            if upcoming:
                print("  Upcoming:")
                for game in upcoming:
                    print(f"    {format_game(game)}")
        else:
            print("  No games found.")
        
        all_results[team['name']] = games
    
    print("\n\n⚾ MLB Teams")
    print("=" * 80)
    for team in teams.get("mlb", []):
        print(f"\n{team['name']} ({team['abbrev']})")
        games = fetch_espn_team("MLB", team['abbrev'])
        
        if games:
            for game in games[:5]:
                print(f"  {format_game(game)}")
        else:
            print("  No games found.")
        
        all_results[team['name']] = games
    
    print("\n\n🏈 NFL Teams")
    print("=" * 80)
    for team in teams.get("nfl", []):
        print(f"\n{team['name']} ({team['abbrev']})")
        games = fetch_espn_team("NFL", team['abbrev'])
        
        if games:
            for game in games[:5]:
                print(f"  {format_game(game)}")
        else:
            print("  No games found.")
        
        all_results[team['name']] = games
    
    print("\n\n🏀 NBA Teams")
    print("=" * 80)
    for team in teams.get("nba", []):
        print(f"\n{team['name']} ({team['abbrev']})")
        games = fetch_espn_team("NBA", team['abbrev'])
        
        if games:
            for game in games[:5]:
                print(f"  {format_game(game)}")
        else:
            print("  No games found.")
        
        all_results[team['name']] = games
    
    # Save cache
    cache_file = CACHE_DIR / "all_teams.json"
    with open(cache_file, "w") as f:
        json.dump({
            "fetched_at": datetime.now().isoformat(),
            "teams": all_results
        }, f, indent=2)
    
    print(f"\n\n✅ Data cached: {cache_file}")

if __name__ == "__main__":
    main()
