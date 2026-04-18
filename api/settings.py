"""
User settings management for Sports Hub
"""

import json
from pathlib import Path
from typing import List, Dict, Optional

BASE_DIR = Path(__file__).parent.parent
SETTINGS_FILE = BASE_DIR / "data" / "settings.json"

# Default settings
DEFAULT_SETTINGS = {
    "news_sources": {
        "canadian": {
            "enabled": True,
            "sources": [
                {"name": "TSN", "domain": "tsn.ca", "enabled": True},
                {"name": "Sportsnet", "domain": "sportsnet.ca", "enabled": True},
                {"name": "The Hockey News", "domain": "thehockeynews.com", "enabled": True},
                {"name": "CBC Sports", "domain": "cbc.ca/sports", "enabled": True},
                {"name": "Toronto Star", "domain": "thestar.com", "enabled": False},
                {"name": "Global News", "domain": "globalnews.ca", "enabled": False}
            ]
        },
        "us": {
            "enabled": True,
            "sources": [
                {"name": "ESPN", "domain": "espn.com", "enabled": True},
                {"name": "NHL.com", "domain": "nhl.com", "enabled": True},
                {"name": "MLB.com", "domain": "mlb.com", "enabled": True},
                {"name": "NBA.com", "domain": "nba.com", "enabled": True},
                {"name": "NFL.com", "domain": "nfl.com", "enabled": True},
                {"name": "The Athletic", "domain": "theathletic.com", "enabled": False},
                {"name": "Sports Illustrated", "domain": "si.com", "enabled": False}
            ]
        },
        "international": {
            "enabled": True,
            "sources": [
                {"name": "BBC Sport", "domain": "bbc.com/sport", "enabled": True},
                {"name": "Marca", "domain": "marca.com", "enabled": True},
                {"name": "Goal", "domain": "goal.com", "enabled": False}
            ]
        }
    },
    "teams": {
        "enabled_teams": [
            "Edmonton Oilers",
            "Pittsburgh Penguins",
            "Toronto Blue Jays",
            "Kansas City Chiefs",
            "Toronto Raptors",
            "Real Madrid"
        ],
        "available_teams": {
            "NHL": [
                "Anaheim Ducks", "Arizona Coyotes", "Boston Bruins", "Buffalo Sabres",
                "Calgary Flames", "Carolina Hurricanes", "Chicago Blackhawks", 
                "Colorado Avalanche", "Columbus Blue Jackets", "Dallas Stars",
                "Detroit Red Wings", "Edmonton Oilers", "Florida Panthers",
                "Los Angeles Kings", "Minnesota Wild", "Montreal Canadiens",
                "Nashville Predators", "New Jersey Devils", "New York Islanders",
                "New York Rangers", "Ottawa Senators", "Philadelphia Flyers",
                "Pittsburgh Penguins", "San Jose Sharks", "Seattle Kraken",
                "St. Louis Blues", "Tampa Bay Lightning", "Toronto Maple Leafs",
                "Vancouver Canucks", "Vegas Golden Knights", "Washington Capitals",
                "Winnipeg Jets"
            ],
            "MLB": [
                "Arizona Diamondbacks", "Atlanta Braves", "Baltimore Orioles",
                "Boston Red Sox", "Chicago Cubs", "Chicago White Sox",
                "Cincinnati Reds", "Cleveland Guardians", "Colorado Rockies",
                "Detroit Tigers", "Houston Astros", "Kansas City Royals",
                "Los Angeles Angels", "Los Angeles Dodgers", "Miami Marlins",
                "Milwaukee Brewers", "Minnesota Twins", "New York Mets",
                "New York Yankees", "Oakland Athletics", "Philadelphia Phillies",
                "Pittsburgh Pirates", "San Diego Padres", "San Francisco Giants",
                "Seattle Mariners", "St. Louis Cardinals", "Tampa Bay Rays",
                "Texas Rangers", "Toronto Blue Jays", "Washington Nationals"
            ],
            "NFL": [
                "Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens",
                "Buffalo Bills", "Carolina Panthers", "Chicago Bears",
                "Cincinnati Bengals", "Cleveland Browns", "Dallas Cowboys",
                "Denver Broncos", "Detroit Lions", "Green Bay Packers",
                "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars",
                "Kansas City Chiefs", "Las Vegas Raiders", "Los Angeles Chargers",
                "Los Angeles Rams", "Miami Dolphins", "Minnesota Vikings",
                "New England Patriots", "New Orleans Saints", "New York Giants",
                "New York Jets", "Philadelphia Eagles", "Pittsburgh Steelers",
                "San Francisco 49ers", "Seattle Seahawks", "Tampa Bay Buccaneers",
                "Tennessee Titans", "Washington Commanders"
            ],
            "NBA": [
                "Atlanta Hawks", "Boston Celtics", "Brooklyn Nets",
                "Charlotte Hornets", "Chicago Bulls", "Cleveland Cavaliers",
                "Dallas Mavericks", "Denver Nuggets", "Detroit Pistons",
                "Golden State Warriors", "Houston Rockets", "Indiana Pacers",
                "Los Angeles Clippers", "Los Angeles Lakers", "Memphis Grizzlies",
                "Miami Heat", "Milwaukee Bucks", "Minnesota Timberwolves",
                "New Orleans Pelicans", "New York Knicks", "Oklahoma City Thunder",
                "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns",
                "Portland Trail Blazers", "Sacramento Kings", "San Antonio Spurs",
                "Toronto Raptors", "Utah Jazz", "Washington Wizards"
            ]
        }
    },
    "display": {
        "news_per_team": 5,
        "games_recent": 3,
        "games_upcoming": 3,
        "theme": "dark"
    }
}

def load_settings() -> Dict:
    """Load settings from file, or create with defaults."""
    if not SETTINGS_FILE.exists():
        SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)
        save_settings(DEFAULT_SETTINGS)
        return DEFAULT_SETTINGS
    
    with open(SETTINGS_FILE) as f:
        return json.load(f)

def save_settings(settings: Dict):
    """Save settings to file."""
    SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(SETTINGS_FILE, "w") as f:
        json.dump(settings, f, indent=2)

def get_enabled_news_sources() -> List[str]:
    """Get list of enabled news source domains."""
    settings = load_settings()
    sources = []
    
    for category, config in settings["news_sources"].items():
        if config.get("enabled", True):
            for source in config.get("sources", []):
                if source.get("enabled", False):
                    sources.append(source["domain"])
    
    return sources

def get_enabled_teams() -> List[str]:
    """Get list of enabled team names."""
    settings = load_settings()
    return settings.get("teams", {}).get("enabled_teams", [])
