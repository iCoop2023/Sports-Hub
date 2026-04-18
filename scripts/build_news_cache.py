#!/usr/bin/env python3
"""Build a precomputed news cache for every known team."""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict

from fetch_news import search_team_news

BASE_DIR = Path(__file__).parent.parent
TEAM_METADATA_FILE = BASE_DIR / "data" / "team_metadata.json"
OUTPUT_FILE = BASE_DIR / "data" / "cache" / "news_cache.json"

LEAGUE_KEY_MAP = [
    ("nhl_code", "NHL"),
    ("mlb_code", "MLB"),
    ("nfl_code", "NFL"),
    ("nba_code", "NBA"),
    ("whl_id", "WHL"),
    ("cfl_code", "CFL"),
    ("cebl_id", "CEBL"),
    ("mls_id", "MLS")
]

MANUAL_LEAGUES = {
    "Real Madrid": "La Liga",
    "Barcelona": "La Liga"
}


def infer_league(team_name: str, metadata: Dict) -> str:
    for key, league in LEAGUE_KEY_MAP:
        if metadata.get(key):
            return league
    return MANUAL_LEAGUES.get(team_name, "")


def main() -> None:
    if not TEAM_METADATA_FILE.exists():
        raise SystemExit("team_metadata.json is missing. Run the export step first.")

    with TEAM_METADATA_FILE.open() as f:
        metadata_bundle = json.load(f)

    teams = metadata_bundle.get("TEAM_METADATA", {})
    cache = {}

    for team_name, metadata in teams.items():
        league = infer_league(team_name, metadata)
        print(f"Fetching news for {team_name} ({league or 'Unknown'})...")
        cache[team_name] = search_team_news(team_name, league)

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "teams": cache
    }
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_FILE.open("w") as f:
        json.dump(payload, f, indent=2)
    print(f"Saved news cache to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
