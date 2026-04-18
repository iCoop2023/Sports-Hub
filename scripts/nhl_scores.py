#!/usr/bin/env python3
"""
NHL Scores Fetcher
Retrieves Edmonton Oilers game scores and schedules from NHL API.
"""

import json
import requests
from datetime import datetime, timedelta
from pathlib import Path

# Configuration
OILERS_ABBREV = "EDM"  # Edmonton Oilers abbreviation
NHL_API_BASE = "https://api-web.nhle.com/v1"
CACHE_DIR = Path(__file__).parent.parent / "data" / "cache"
CACHE_FILE = CACHE_DIR / "oilers_latest.json"

def fetch_team_schedule(team_abbrev="EDM", days_back=7, days_forward=7):
    """Fetch team schedule (recent + upcoming games) from scoreboard."""
    today = datetime.now()
    games_found = []
    
    # Check multiple dates (past + future)
    for offset in range(-days_back, days_forward + 1):
        check_date = (today + timedelta(days=offset)).strftime("%Y-%m-%d")
        url = f"{NHL_API_BASE}/scoreboard/{check_date}"
        
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Find Oilers games
            for day_data in data.get("gamesByDate", []):
                for game in day_data.get("games", []):
                    home_abbrev = game.get("homeTeam", {}).get("abbrev", "")
                    away_abbrev = game.get("awayTeam", {}).get("abbrev", "")
                    
                    if team_abbrev in [home_abbrev, away_abbrev]:
                        games_found.append(game)
        except Exception as e:
            # Skip dates with errors
            continue
    
    return {
        "success": True,
        "team_abbrev": team_abbrev,
        "fetched_at": datetime.now().isoformat(),
        "games": games_found
    }

def get_game_summary(game):
    """Format a single game summary."""
    game_date = game.get("gameDate", "")
    away_team = game.get("awayTeam", {})
    home_team = game.get("homeTeam", {})
    away_name = away_team.get("abbrev", "Away")
    home_name = home_team.get("abbrev", "Home")
    away_score = away_team.get("score", 0)
    home_score = home_team.get("score", 0)
    game_state = game.get("gameState", "UNKNOWN")
    
    # Determine result for Oilers
    is_oilers_home = home_team.get("abbrev", "") == "EDM"
    oilers_score = home_score if is_oilers_home else away_score
    opponent_score = away_score if is_oilers_home else home_score
    opponent = away_name if is_oilers_home else home_name
    
    if game_state == "FUT":
        status = "Upcoming"
        score_str = "TBD"
    elif game_state == "LIVE":
        status = "🔴 LIVE"
        score_str = f"Oilers {oilers_score} - {opponent_score} {opponent}"
    elif game_state in ["FINAL", "OFF"]:
        if oilers_score > opponent_score:
            result = "✅ W"
        elif oilers_score < opponent_score:
            result = "❌ L"
        else:
            result = "🤝 T"
        status = result
        score_str = f"Oilers {oilers_score} - {opponent_score} {opponent}"
    else:
        status = game_state
        score_str = f"{away_name} vs {home_name}"
    
    return {
        "date": game_date,
        "opponent": opponent,
        "status": status,
        "score": score_str,
        "is_home": is_oilers_home
    }

def main():
    """Main execution."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    
    print("Fetching Oilers schedule...")
    data = fetch_team_schedule(OILERS_ABBREV)
    
    if not data["success"]:
        print(f"❌ Error fetching data")
        return
    
    # Save to cache
    with open(CACHE_FILE, "w") as f:
        json.dump(data, f, indent=2)
    
    games = data["games"]
    print(f"\n📅 Found {len(games)} games (past 7 days + next 7 days)\n")
    
    if not games:
        print("No games found in this time window.")
        return
    
    # Separate past and future
    today = datetime.now().date()
    recent = []
    upcoming = []
    
    for game in games:
        game_date_str = game.get("gameDate", "")
        if game_date_str:
            try:
                game_date = datetime.fromisoformat(game_date_str).date()
                summary = get_game_summary(game)
                if game_date < today:
                    recent.append(summary)
                else:
                    upcoming.append(summary)
            except:
                continue
    
    # Display recent games
    if recent:
        print("🏒 Recent Games:")
        for game in sorted(recent, key=lambda x: x["date"], reverse=True)[:5]:
            print(f"  {game['date']} | {game['status']} | {game['score']}")
    
    # Display upcoming games
    if upcoming:
        print("\n📅 Upcoming Games:")
        for game in sorted(upcoming, key=lambda x: x["date"])[:5]:
            location = "Home" if game["is_home"] else "Away"
            print(f"  {game['date']} | vs {game['opponent']} ({location})")
    
    print(f"\n✅ Data cached: {CACHE_FILE}")

if __name__ == "__main__":
    main()
