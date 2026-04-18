#!/usr/bin/env python3
"""
Fetch standings and stats for teams across all leagues
"""

import requests
from typing import Dict, List, Optional

def fetch_nhl_standings() -> Dict[str, Dict]:
    """Fetch NHL standings for all teams."""
    try:
        url = "https://api-web.nhle.com/v1/standings/now"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        standings = {}
        for team in data.get("standings", []):
            team_abbrev = team.get("teamAbbrev", {}).get("default", "")
            standings[team_abbrev] = {
                "wins": team.get("wins", 0),
                "losses": team.get("losses", 0),
                "ot_losses": team.get("otLosses", 0),
                "points": team.get("points", 0),
                "games_played": team.get("gamesPlayed", 0),
                "conference_rank": team.get("conferenceSequence", 0),
                "division_rank": team.get("divisionSequence", 0),
                "league_rank": team.get("leagueSequence", 0),
                "win_pct": team.get("pointPctg", 0.0),
                "goals_for": team.get("goalFor", 0),
                "goals_against": team.get("goalAgainst", 0),
                "goal_diff": team.get("goalDifferential", 0),
                "streak_code": team.get("streakCode", ""),
                "streak_count": team.get("streakCount", 0),
                "last_10": f"{team.get('l10Wins', 0)}-{team.get('l10Losses', 0)}-{team.get('l10OtLosses', 0)}"
            }
        
        return standings
    except Exception as e:
        print(f"NHL standings fetch failed: {e}")
        return {}


def fetch_mlb_standings() -> Dict[str, Dict]:
    """Fetch MLB standings via ESPN."""
    try:
        url = "https://site.api.espn.com/apis/v2/sports/baseball/mlb/standings"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        standings = {}
        for entry in data.get("children", []):
            for standing in entry.get("standings", {}).get("entries", []):
                team = standing.get("team", {})
                abbrev = team.get("abbreviation", "").lower()
                stats = {}
                for stat in standing.get("stats", []):
                    try:
                        stats[stat["name"]] = float(stat["value"])
                    except (ValueError, TypeError, KeyError):
                        stats[stat["name"]] = 0
                
                standings[abbrev] = {
                    "wins": int(stats.get("wins", 0)),
                    "losses": int(stats.get("losses", 0)),
                    "games_played": int(stats.get("gamesPlayed", 0)),
                    "win_pct": float(stats.get("winPercent", 0.0)),
                    "games_back": float(stats.get("gamesBehind", 0.0)),
                    "streak": stats.get("streak", ""),
                    "division_rank": int(stats.get("divisionRank", 0)),
                    "runs_for": int(stats.get("pointsFor", 0)),
                    "runs_against": int(stats.get("pointsAgainst", 0))
                }
        
        return standings
    except Exception as e:
        print(f"MLB standings fetch failed: {e}")
        return {}


def fetch_nba_standings() -> Dict[str, Dict]:
    """Fetch NBA standings via ESPN."""
    try:
        url = "https://site.api.espn.com/apis/v2/sports/basketball/nba/standings"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        standings = {}
        for entry in data.get("children", []):
            for standing in entry.get("standings", {}).get("entries", []):
                team = standing.get("team", {})
                abbrev = team.get("abbreviation", "").lower()
                stats = {}
                for stat in standing.get("stats", []):
                    try:
                        stats[stat["name"]] = float(stat["value"])
                    except (ValueError, TypeError, KeyError):
                        stats[stat["name"]] = 0
                
                standings[abbrev] = {
                    "wins": int(stats.get("wins", 0)),
                    "losses": int(stats.get("losses", 0)),
                    "games_played": int(stats.get("gamesPlayed", 0)),
                    "win_pct": float(stats.get("winPercent", 0.0)),
                    "games_back": float(stats.get("gamesBehind", 0.0)),
                    "streak": stats.get("streak", ""),
                    "conference_rank": int(stats.get("rank", 0)),
                    "points_per_game": float(stats.get("avgPointsFor", 0.0)),
                    "points_against": float(stats.get("avgPointsAgainst", 0.0))
                }
        
        return standings
    except Exception as e:
        print(f"NBA standings fetch failed: {e}")
        return {}


def fetch_nfl_standings() -> Dict[str, Dict]:
    """Fetch NFL standings via ESPN."""
    try:
        url = "https://site.api.espn.com/apis/v2/sports/football/nfl/standings"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        standings = {}
        for entry in data.get("children", []):
            for standing in entry.get("standings", {}).get("entries", []):
                team = standing.get("team", {})
                abbrev = team.get("abbreviation", "").lower()
                stats = {}
                for stat in standing.get("stats", []):
                    try:
                        stats[stat["name"]] = float(stat["value"])
                    except (ValueError, TypeError, KeyError):
                        stats[stat["name"]] = 0
                
                standings[abbrev] = {
                    "wins": int(stats.get("wins", 0)),
                    "losses": int(stats.get("losses", 0)),
                    "ties": int(stats.get("ties", 0)),
                    "games_played": int(stats.get("gamesPlayed", 0)),
                    "win_pct": float(stats.get("winPercent", 0.0)),
                    "division_rank": int(stats.get("divisionRank", 0)),
                    "points_for": int(stats.get("pointsFor", 0)),
                    "points_against": int(stats.get("pointsAgainst", 0)),
                    "point_diff": int(stats.get("pointDifferential", 0)),
                    "streak": stats.get("streak", "")
                }
        
        return standings
    except Exception as e:
        print(f"NFL standings fetch failed: {e}")
        return {}


def fetch_soccer_standings(league_code: str) -> Dict[str, Dict]:
    """Fetch soccer standings via ESPN."""
    try:
        url = f"https://site.api.espn.com/apis/v2/sports/soccer/{league_code}/standings"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        standings = {}
        for entry in data.get("children", []):
            for standing in entry.get("standings", {}).get("entries", []):
                team = standing.get("team", {})
                team_id = team.get("id", "")
                stats = {}
                for stat in standing.get("stats", []):
                    try:
                        stats[stat["name"]] = float(stat["value"])
                    except (ValueError, TypeError, KeyError):
                        stats[stat["name"]] = 0
                
                standings[team_id] = {
                    "wins": int(stats.get("wins", 0)),
                    "losses": int(stats.get("losses", 0)),
                    "draws": int(stats.get("ties", 0)),
                    "games_played": int(stats.get("gamesPlayed", 0)),
                    "points": int(stats.get("points", 0)),
                    "rank": int(stats.get("rank", 0)),
                    "goals_for": int(stats.get("pointsFor", 0)),
                    "goals_against": int(stats.get("pointsAgainst", 0)),
                    "goal_diff": int(stats.get("pointDifferential", 0))
                }
        
        return standings
    except Exception as e:
        print(f"Soccer standings fetch failed for {league_code}: {e}")
        return {}


def fetch_all_standings() -> Dict[str, Dict]:
    """Fetch standings for all supported leagues."""
    all_standings = {
        "NHL": fetch_nhl_standings(),
        "MLB": fetch_mlb_standings(),
        "NBA": fetch_nba_standings(),
        "NFL": fetch_nfl_standings(),
        "Premier League": fetch_soccer_standings("eng.1"),
        "La Liga": fetch_soccer_standings("esp.1"),
        "Serie A": fetch_soccer_standings("ita.1"),
        "Bundesliga": fetch_soccer_standings("ger.1"),
        "Ligue 1": fetch_soccer_standings("fra.1"),
        "MLS": fetch_soccer_standings("usa.1")
    }
    
    return all_standings


def get_head_to_head_stats(team_name: str, opponent_name: str, games: List[Dict]) -> Dict:
    """Calculate head-to-head stats between two teams from game history."""
    h2h_games = [g for g in games if g.get("opponent") == opponent_name and g.get("result") in ["W", "L", "T"]]
    
    if not h2h_games:
        return {"games": 0, "wins": 0, "losses": 0, "ties": 0}
    
    wins = sum(1 for g in h2h_games if g.get("result") == "W")
    losses = sum(1 for g in h2h_games if g.get("result") == "L")
    ties = sum(1 for g in h2h_games if g.get("result") == "T")
    
    return {
        "games": len(h2h_games),
        "wins": wins,
        "losses": losses,
        "ties": ties,
        "record": f"{wins}-{losses}" + (f"-{ties}" if ties > 0 else "")
    }


if __name__ == "__main__":
    # Test
    print("Fetching NHL standings...")
    nhl = fetch_nhl_standings()
    if "EDM" in nhl:
        print(f"Edmonton Oilers: {nhl['EDM']['wins']}-{nhl['EDM']['losses']}-{nhl['EDM']['ot_losses']}, {nhl['EDM']['points']} pts")
    
    print(f"\nTotal teams with standings: {sum(len(v) for v in fetch_all_standings().values())}")
