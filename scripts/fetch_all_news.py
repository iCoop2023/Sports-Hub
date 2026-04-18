#!/usr/bin/env python3
"""
Fetch news for all teams from multiple sources
Prioritizes Canadian sources for Canadian teams
"""

import json
import requests
from pathlib import Path
from datetime import datetime

# Paths
BASE_DIR = Path(__file__).parent.parent
CACHE_FILE = BASE_DIR / "data" / "cache" / "all_teams.json"

# Canadian teams
CANADIAN_TEAMS = [
    "Edmonton Oilers",
    "Calgary Flames", 
    "Vancouver Canucks",
    "Toronto Maple Leafs",
    "Ottawa Senators",
    "Montreal Canadiens",
    "Winnipeg Jets",
    "Toronto Blue Jays",
    "Toronto Raptors",
    "Vancouver Whitecaps"
]

# News sources to try (in priority order)
NEWS_SOURCES = {
    "canadian": [
        "tsn.ca",
        "sportsnet.ca", 
        "thehockeynews.com",
        "cbc.ca/sports",
        "thestar.com",
        "globalnews.ca"
    ],
    "us": [
        "espn.com",
        "nhl.com",
        "mlb.com",
        "nba.com",
        "nfl.com",
        "theathletic.com",
        "si.com"
    ],
    "international": [
        "bbc.com/sport",
        "marca.com",
        "goal.com"
    ]
}

def search_news(team_name, is_canadian=False, limit=5):
    """
    Search for team news using web search.
    This is a placeholder - actual implementation would use web_search tool.
    """
    # In practice, this will be called by the agent with web_search tool
    # For now, return placeholder structure
    return []

def fetch_team_news_multi_source(team_name, is_canadian=False):
    """
    Fetch news from multiple sources for a team.
    Prioritizes Canadian sources for Canadian teams.
    """
    all_articles = []
    
    # Determine which sources to prioritize
    if is_canadian:
        source_priority = ["canadian", "us", "international"]
    else:
        # For international teams (Real Madrid), prioritize international
        if "Madrid" in team_name or "Barcelona" in team_name:
            source_priority = ["international", "us"]
        else:
            source_priority = ["us", "international"]
    
    # Build search query with source restrictions
    queries = []
    for category in source_priority[:2]:  # Use top 2 categories
        sources = NEWS_SOURCES.get(category, [])
        for source in sources[:3]:  # Top 3 sources per category
            queries.append({
                "team": team_name,
                "source": source,
                "category": category
            })
    
    # This will be populated by agent using web_search
    # For now, return structure
    return {
        "team": team_name,
        "is_canadian": is_canadian,
        "queries": queries,
        "articles": []  # Will be filled by agent
    }

def main():
    """Generate news query config for agent to execute."""
    with open(CACHE_FILE) as f:
        data = json.load(f)
    
    news_config = {}
    
    for team_name in data["teams"].keys():
        is_canadian = team_name in CANADIAN_TEAMS
        news_config[team_name] = fetch_team_news_multi_source(team_name, is_canadian)
        
        print(f"\n{team_name} ({'Canadian' if is_canadian else 'International'}):")
        print(f"  Priority sources:")
        for q in news_config[team_name]["queries"][:5]:
            print(f"    - {q['source']} ({q['category']})")
    
    # Save config
    config_file = BASE_DIR / "data" / "cache" / "news_config.json"
    with open(config_file, "w") as f:
        json.dump(news_config, f, indent=2)
    
    print(f"\n✅ News config saved: {config_file}")
    print("Agent should now fetch news using web_search for each query")

if __name__ == "__main__":
    main()
