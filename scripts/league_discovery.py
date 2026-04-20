#!/usr/bin/env python3
"""
Universal team discovery - detect league and fetch data for any team
"""

import os
import requests
from typing import Dict, List, Optional

# League API patterns
LEAGUE_APIS = {
    "NHL": {
        "schedule": "https://api-web.nhle.com/v1/club-schedule-season/{abbrev}/now",
        "id_type": "abbrev",
        "teams": {
            "Anaheim Ducks": "ANA", "Arizona Coyotes": "ARI", "Boston Bruins": "BOS",
            "Buffalo Sabres": "BUF", "Calgary Flames": "CGY", "Carolina Hurricanes": "CAR",
            "Chicago Blackhawks": "CHI", "Colorado Avalanche": "COL", "Columbus Blue Jackets": "CBJ",
            "Dallas Stars": "DAL", "Detroit Red Wings": "DET", "Edmonton Oilers": "EDM",
            "Florida Panthers": "FLA", "Los Angeles Kings": "LAK", "Minnesota Wild": "MIN",
            "Montreal Canadiens": "MTL", "Nashville Predators": "NSH", "New Jersey Devils": "NJD",
            "New York Islanders": "NYI", "New York Rangers": "NYR", "Ottawa Senators": "OTT",
            "Philadelphia Flyers": "PHI", "Pittsburgh Penguins": "PIT", "San Jose Sharks": "SJS",
            "Seattle Kraken": "SEA", "St. Louis Blues": "STL", "Tampa Bay Lightning": "TBL",
            "Toronto Maple Leafs": "TOR", "Utah Hockey Club": "UTA", "Vancouver Canucks": "VAN",
            "Vegas Golden Knights": "VGK", "Washington Capitals": "WSH", "Winnipeg Jets": "WPG"
        }
    },
    "MLB": {
        "schedule": "espn",
        "espn_id": True,
        "teams": {
            "Arizona Diamondbacks": "ari", "Atlanta Braves": "atl", "Baltimore Orioles": "bal",
            "Boston Red Sox": "bos", "Chicago Cubs": "chc", "Chicago White Sox": "chw",
            "Cincinnati Reds": "cin", "Cleveland Guardians": "cle", "Colorado Rockies": "col",
            "Detroit Tigers": "det", "Houston Astros": "hou", "Kansas City Royals": "kc",
            "Los Angeles Angels": "laa", "Los Angeles Dodgers": "lad", "Miami Marlins": "mia",
            "Milwaukee Brewers": "mil", "Minnesota Twins": "min", "New York Mets": "nym",
            "New York Yankees": "nyy", "Oakland Athletics": "oak", "Philadelphia Phillies": "phi",
            "Pittsburgh Pirates": "pit", "San Diego Padres": "sd", "San Francisco Giants": "sf",
            "Seattle Mariners": "sea", "St. Louis Cardinals": "stl", "Tampa Bay Rays": "tb",
            "Texas Rangers": "tex", "Toronto Blue Jays": "tor", "Washington Nationals": "wsh"
        }
    },
    "NBA": {
        "schedule": "espn",
        "espn_id": True,
        "teams": {
            "Atlanta Hawks": "atl", "Boston Celtics": "bos", "Brooklyn Nets": "bkn",
            "Charlotte Hornets": "cha", "Chicago Bulls": "chi", "Cleveland Cavaliers": "cle",
            "Dallas Mavericks": "dal", "Denver Nuggets": "den", "Detroit Pistons": "det",
            "Golden State Warriors": "gs", "Houston Rockets": "hou", "Indiana Pacers": "ind",
            "LA Clippers": "lac", "Los Angeles Lakers": "lal", "Memphis Grizzlies": "mem",
            "Miami Heat": "mia", "Milwaukee Bucks": "mil", "Minnesota Timberwolves": "min",
            "New Orleans Pelicans": "no", "New York Knicks": "ny", "Oklahoma City Thunder": "okc",
            "Orlando Magic": "orl", "Philadelphia 76ers": "phi", "Phoenix Suns": "phx",
            "Portland Trail Blazers": "por", "Sacramento Kings": "sac", "San Antonio Spurs": "sa",
            "Toronto Raptors": "tor", "Utah Jazz": "utah", "Washington Wizards": "wsh"
        }
    },
    "NFL": {
        "schedule": "espn",
        "espn_id": True,
        "teams": {
            "Arizona Cardinals": "ari", "Atlanta Falcons": "atl", "Baltimore Ravens": "bal",
            "Buffalo Bills": "buf", "Carolina Panthers": "car", "Chicago Bears": "chi",
            "Cincinnati Bengals": "cin", "Cleveland Browns": "cle", "Dallas Cowboys": "dal",
            "Denver Broncos": "den", "Detroit Lions": "det", "Green Bay Packers": "gb",
            "Houston Texans": "hou", "Indianapolis Colts": "ind", "Jacksonville Jaguars": "jax",
            "Kansas City Chiefs": "kc", "Las Vegas Raiders": "lv", "Los Angeles Chargers": "lac",
            "Los Angeles Rams": "lar", "Miami Dolphins": "mia", "Minnesota Vikings": "min",
            "New England Patriots": "ne", "New Orleans Saints": "no", "New York Giants": "nyg",
            "New York Jets": "nyj", "Philadelphia Eagles": "phi", "Pittsburgh Steelers": "pit",
            "San Francisco 49ers": "sf", "Seattle Seahawks": "sea", "Tampa Bay Buccaneers": "tb",
            "Tennessee Titans": "ten", "Washington Commanders": "wsh"
        }
    },
    "CFL": {
        "schedule": "placeholder",  # Season not started
        "teams": {
            "BC Lions": "BC", "Calgary Stampeders": "CGY", "Edmonton Elks": "EDM",
            "Saskatchewan Roughriders": "SSK", "Winnipeg Blue Bombers": "WPG",
            "Hamilton Tiger-Cats": "HAM", "Montreal Alouettes": "MTL",
            "Ottawa Redblacks": "OTT", "Toronto Argonauts": "TOR"
        }
    },
    "CEBL": {
        "schedule": "placeholder",  # Season not started
        "teams": {
            "Brampton Honey Badgers": "BRA", "Calgary Surge": "CGY",
            "Edmonton Stingers": "EDM", "Montreal Alliance": "MTL",
            "Niagara River Lions": "NIA", "Ottawa BlackJacks": "OTT",
            "Saskatchewan Rattlers": "SSK", "Scarborough Shooting Stars": "SCA",
            "Vancouver Bandits": "VAN", "Winnipeg Sea Bears": "WPG"
        }
    },
    "WHL": {
        "schedule": "hockeytech",
        "api_base": "https://lscluster.hockeytech.com/feed/index.php",
        "teams": {
            "Brandon Wheat Kings": "16", "Calgary Hitmen": "2", "Edmonton Oil Kings": "20",
            "Kamloops Blazers": "4", "Kelowna Rockets": "5", "Lethbridge Hurricanes": "6",
            "Medicine Hat Tigers": "7", "Moose Jaw Warriors": "21", "Portland Winterhawks": "8",
            "Prince Albert Raiders": "22", "Prince George Cougars": "9", "Red Deer Rebels": "10",
            "Regina Pats": "23", "Saskatoon Blades": "24", "Seattle Thunderbirds": "11",
            "Spokane Chiefs": "12", "Swift Current Broncos": "25", "Tri-City Americans": "13",
            "Vancouver Giants": "14", "Victoria Royals": "15", "Wenatchee Wild": "26"
        }
    },
    "Premier League": {
        "schedule": "espn_soccer",
        "espn_league": "eng.1",
        "teams": {
            "Arsenal": "359", "Aston Villa": "362", "Bournemouth": "349",
            "Brentford": "337", "Brighton": "331", "Chelsea": "363",
            "Crystal Palace": "384", "Everton": "368", "Fulham": "370",
            "Ipswich Town": "373", "Leicester City": "375", "Liverpool": "364",
            "Manchester City": "382", "Manchester United": "360", "Newcastle United": "361",
            "Nottingham Forest": "393", "Southampton": "376", "Tottenham": "367",
            "West Ham": "371", "Wolverhampton": "380"
        }
    },
    "La Liga": {
        "schedule": "espn_soccer",
        "espn_league": "esp.1",
        "teams": {
            "Athletic Bilbao": "621", "Atletico Madrid": "1068", "Barcelona": "83",
            "Celta Vigo": "558", "Getafe": "3302", "Girona": "9867",
            "Las Palmas": "2719", "Leganes": "2720", "Mallorca": "714",
            "Osasuna": "2817", "Rayo Vallecano": "858", "Real Betis": "244",
            "Real Madrid": "86", "Real Sociedad": "243", "Real Valladolid": "94",
            "Sevilla": "559", "Valencia": "95", "Villarreal": "102",
            "Espanyol": "93", "Alaves": "97"
        }
    },
    "Serie A": {
        "schedule": "espn_soccer",
        "espn_league": "ita.1",
        "teams": {
            "AC Milan": "103", "Atalanta": "104", "Bologna": "1913",
            "Cagliari": "1863", "Como": "5766", "Empoli": "2282",
            "Fiorentina": "107", "Genoa": "110", "Inter Milan": "108",
            "Juventus": "111", "Lazio": "112", "Lecce": "2284",
            "Monza": "11025", "Napoli": "113", "Parma": "2285",
            "Roma": "114", "Torino": "115", "Udinese": "116",
            "Venezia": "2425", "Verona": "117"
        }
    },
    "Bundesliga": {
        "schedule": "espn_soccer",
        "espn_league": "ger.1",
        "teams": {
            "Augsburg": "132", "Bayern Munich": "131", "Bochum": "133",
            "Borussia Dortmund": "134", "Borussia Monchengladbach": "135", "Eintracht Frankfurt": "137",
            "FC Heidenheim": "10280", "Freiburg": "138", "Hoffenheim": "2204",
            "Holstein Kiel": "197", "Leverkusen": "141", "Mainz": "2225",
            "RB Leipzig": "4331", "St. Pauli": "2534", "Stuttgart": "146",
            "Union Berlin": "2257", "Werder Bremen": "148", "Wolfsburg": "149"
        }
    },
    "Ligue 1": {
        "schedule": "espn_soccer",
        "espn_league": "fra.1",
        "teams": {
            "Angers": "2573", "Auxerre": "165", "Brest": "6997",
            "Le Havre": "172", "Lens": "173", "Lille": "174",
            "Lyon": "176", "Marseille": "177", "Monaco": "178",
            "Montpellier": "179", "Nantes": "180", "Nice": "181",
            "Paris Saint-Germain": "182", "Reims": "3243", "Rennes": "184",
            "Saint-Etienne": "185", "Strasbourg": "3252", "Toulouse": "188"
        }
    },
    "MLS": {
        "schedule": "espn_soccer",
        "espn_league": "usa.1",
        "teams": {
            "Atlanta United": "9781", "Austin FC": "12536", "Charlotte FC": "13796",
            "Chicago Fire": "1100", "Colorado Rapids": "1102", "Columbus Crew": "1101",
            "DC United": "1103", "FC Cincinnati": "11134", "FC Dallas": "1104",
            "Houston Dynamo": "9776", "Inter Miami": "11140", "LA Galaxy": "1105",
            "LAFC": "11149", "Minnesota United": "9789", "Montreal": "9796",
            "Nashville SC": "11922", "New England Revolution": "1106", "New York City FC": "9668",
            "New York Red Bulls": "9772", "Orlando City": "9752", "Philadelphia Union": "9773",
            "Portland Timbers": "9779", "Real Salt Lake": "9784", "San Jose Earthquakes": "1107",
            "Seattle Sounders": "9726", "Sporting Kansas City": "9797", "St. Louis City": "16331",
            "Toronto FC": "9788", "Vancouver Whitecaps": "9778"
        }
    },
    "Liga MX": {
        "schedule": "espn_soccer",
        "espn_league": "mex.1",
        "teams": {
            "America": "189", "Atlas": "190", "Atletico San Luis": "191",
            "Cruz Azul": "192", "Guadalajara": "193", "Juarez": "5826",
            "Leon": "5533", "Mazatlan": "11922", "Monterrey": "194",
            "Necaxa": "195", "Pachuca": "196", "Puebla": "2278",
            "Pumas UNAM": "198", "Queretaro": "4234", "Santos Laguna": "2672",
            "Tijuana": "3801", "Tigres UANL": "2283", "Toluca": "2672"
        }
    },
    "Champions League": {
        "schedule": "espn_soccer",
        "espn_league": "uefa.champions",
        "teams": {}  # UCL teams vary by season
    },
    "NWSL": {
        "schedule": "espn_soccer",
        "espn_league": "usa.nwsl",
        "teams": {
            "Angel City": "14260", "Bay FC": "16552", "Chicago Red Stars": "12558",
            "Houston Dash": "12557", "Kansas City Current": "12559", "NJ/NY Gotham FC": "12560",
            "North Carolina Courage": "12561", "Orlando Pride": "12562", "Portland Thorns": "12563",
            "Racing Louisville": "12831", "San Diego Wave": "14261", "Seattle Reign": "12564",
            "Utah Royals": "16553", "Washington Spirit": "12565"
        }
    },
    "WNBA": {
        "schedule": "espn",
        "espn_id": True,
        "teams": {
            "Atlanta Dream": "atl", "Chicago Sky": "chi", "Connecticut Sun": "conn",
            "Dallas Wings": "dal", "Golden State Valkyries": "gs", "Indiana Fever": "ind",
            "Las Vegas Aces": "lv", "Los Angeles Sparks": "la", "Minnesota Lynx": "min",
            "New York Liberty": "ny", "Phoenix Mercury": "phx", "Seattle Storm": "sea",
            "Washington Mystics": "wsh"
        }
    },
    "NHL (AHL)": {
        "schedule": "placeholder",
        "teams": {
            "Abbotsford Canucks": "ABO", "Bakersfield Condors": "BAK", "Belleville Senators": "BEL",
            "Calgary Wranglers": "CGY", "Charlotte Checkers": "CHA", "Chicago Wolves": "CHI",
            "Cleveland Monsters": "CLE", "Coachella Valley Firebirds": "COA", "Colorado Eagles": "COL",
            "Grand Rapids Griffins": "GRA", "Hartford Wolf Pack": "HAR", "Henderson Silver Knights": "HEN",
            "Hershey Bears": "HER", "Iowa Wild": "IOW", "Laval Rocket": "LAV",
            "Lehigh Valley Phantoms": "LEH", "Manitoba Moose": "MAN", "Milwaukee Admirals": "MIL",
            "Ontario Reign": "ONT", "Providence Bruins": "PRO", "Rochester Americans": "ROC",
            "Rockford IceHogs": "ROK", "San Diego Gulls": "SAN", "San Jose Barracuda": "SJ",
            "Springfield Thunderbirds": "SPR", "Syracuse Crunch": "SYR", "Texas Stars": "TEX",
            "Toronto Marlies": "TOR", "Tucson Roadrunners": "TUC", "Utica Comets": "UTI",
            "Wilkes-Barre/Scranton Penguins": "WBS"
        }
    },
    "CPL": {
        "schedule": "placeholder",
        "teams": {
            "Atletico Ottawa": "ATL", "Cavalry FC": "CAV", "FC Edmonton": "EDM",
            "Forge FC": "FOR", "HFX Wanderers": "HFX", "Pacific FC": "PAC",
            "Valour FC": "VAL", "Vancouver FC": "VAN", "York United": "YOR"
        }
    },
    "PWHL": {
        "schedule": "placeholder",
        "teams": {
            "Boston Fleet": "BOS", "Minnesota Frost": "MIN", "Montreal Victoire": "MTL",
            "New York Sirens": "NY", "Ottawa Charge": "OTT", "Toronto Sceptres": "TOR"
        }
    }
}


def detect_league(team_name: str) -> Optional[Dict]:
    """Detect which league a team belongs to."""
    for league, config in LEAGUE_APIS.items():
        if team_name in config["teams"]:
            return {
                "league": league,
                "abbrev": config["teams"][team_name],
                "config": config
            }
    return None


def fetch_team_schedule(team_name: str) -> Optional[List[Dict]]:
    """Fetch schedule for any team by auto-detecting league."""
    detection = detect_league(team_name)
    if not detection:
        return None
    
    league = detection["league"]
    abbrev = detection["abbrev"]
    config = detection["config"]
    
    if config["schedule"] == "placeholder":
        # Season hasn't started yet
        return []
    elif config["schedule"] == "espn":
        return fetch_espn_schedule(team_name, abbrev, league)
    elif config["schedule"] == "espn_soccer":
        return fetch_espn_soccer_schedule(team_name, abbrev, config.get("espn_league", ""))
    elif config["schedule"] == "hockeytech":
        return fetch_hockeytech_schedule(team_name, abbrev)
    elif league == "NHL":
        return fetch_nhl_schedule(abbrev)
    
    return []


def fetch_nhl_schedule(abbrev: str) -> List[Dict]:
    """Fetch NHL schedule."""
    url = f"https://api-web.nhle.com/v1/club-schedule-season/{abbrev}/now"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        nhl_abbrev_to_name = {v: k for k, v in LEAGUE_APIS["NHL"]["teams"].items()}

        games = []
        for game in data.get("games", []):
            opp_abbrev = game.get("opponentAbbrev", "")
            opponent_name = nhl_abbrev_to_name.get(opp_abbrev, opp_abbrev)
            games.append({
                "id": game["id"],
                "date": game["gameDate"][:10],
                "opponent": opponent_name,
                "team_score": game.get("teamScore", 0),
                "opponent_score": game.get("opponentScore", 0),
                "status": game.get("gameState", ""),
                "is_home": game.get("homeRoadFlag", "") == "H",
                "result": get_result(game),
                "league": "NHL"
            })
        return games
    except Exception as e:
        print(f"NHL fetch failed for {abbrev}: {e}")
        return []


def fetch_espn_schedule(team_name: str, abbrev: str, league: str) -> List[Dict]:
    """Fetch schedule from ESPN API."""
    sport_map = {"MLB": "baseball/mlb", "NBA": "basketball/nba", "NFL": "football/nfl"}
    sport = sport_map.get(league)
    if not sport:
        return []
    
    url = f"https://site.api.espn.com/apis/site/v2/sports/{sport}/teams/{abbrev}/schedule"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        games = []
        for event in data.get("events", []):
            comp = event["competitions"][0]
            home_team = comp["competitors"][0] if comp["competitors"][0]["homeAway"] == "home" else comp["competitors"][1]
            away_team = comp["competitors"][1] if comp["competitors"][0]["homeAway"] == "home" else comp["competitors"][0]
            
            is_home = home_team["team"]["abbreviation"] == abbrev.upper()
            opponent = away_team["team"]["displayName"] if is_home else home_team["team"]["displayName"]
            
            # Extract scores safely
            home_score = home_team.get("score", 0)
            away_score = away_team.get("score", 0)
            
            # Handle both dict and int score formats
            if isinstance(home_score, dict):
                home_score = int(float(home_score.get("value", 0)))
            if isinstance(away_score, dict):
                away_score = int(float(away_score.get("value", 0)))
            
            games.append({
                "id": event["id"],
                "date": event["date"][:10] if "T" in event["date"] else event["date"],
                "opponent": opponent,
                "team_score": home_score if is_home else away_score,
                "opponent_score": away_score if is_home else home_score,
                "status": comp["status"]["type"]["description"],
                "is_home": is_home,
                "result": get_espn_result(comp, is_home),
                "league": league
            })
        return games
    except Exception as e:
        print(f"ESPN fetch failed for {team_name}: {e}")
        return []


def fetch_espn_soccer_schedule(team_name: str, team_id: str, league_code: str) -> List[Dict]:
    """Fetch soccer schedule from ESPN API."""
    url = f"https://site.api.espn.com/apis/site/v2/sports/soccer/{league_code}/teams/{team_id}/schedule"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        games = []
        for event in data.get("events", []):
            comp = event["competitions"][0]
            home_team = comp["competitors"][0] if comp["competitors"][0]["homeAway"] == "home" else comp["competitors"][1]
            away_team = comp["competitors"][1] if comp["competitors"][0]["homeAway"] == "home" else comp["competitors"][0]
            
            is_home = home_team["team"]["id"] == team_id
            opponent = away_team["team"]["displayName"] if is_home else home_team["team"]["displayName"]
            
            # Extract scores safely
            home_score = home_team.get("score", 0)
            away_score = away_team.get("score", 0)
            if isinstance(home_score, dict):
                home_score = int(float(home_score.get("value", 0)))
            if isinstance(away_score, dict):
                away_score = int(float(away_score.get("value", 0)))
            
            games.append({
                "id": event["id"],
                "date": event["date"][:10] if "T" in event["date"] else event["date"],
                "opponent": opponent,
                "team_score": home_score if is_home else away_score,
                "opponent_score": away_score if is_home else home_score,
                "status": comp["status"]["type"]["description"],
                "is_home": is_home,
                "result": get_espn_result(comp, is_home),
                "league": league_code.upper().replace(".", " ")
            })
        return games
    except Exception as e:
        print(f"ESPN soccer fetch failed for {team_name}: {e}")
        return []


def fetch_hockeytech_schedule(team_name: str, team_id: str) -> List[Dict]:
    """Fetch WHL schedule via HockeyTech."""
    url = "https://lscluster.hockeytech.com/feed/index.php"
    params = {
        "feed": "modulekit",
        "view": "gamesbydate",
        "key": os.environ.get("HOCKEYTECH_KEY_WHL", "41b145a848f4bd67"),
        "fmt": "json",
        "client_code": "whl",
        "lang": "en",
        "season_id": "79",
        "team_id": team_id,
        "fmt": "json"
    }
    
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        games = []
        for game in data.get("SiteKit", {}).get("Gamesbydate", []):
            games.append({
                "id": game.get("id"),
                "date": game.get("date_with_day", "")[:10],
                "opponent": game.get("opponent", ""),
                "team_score": int(game.get("goals_for", 0)),
                "opponent_score": int(game.get("goals_against", 0)),
                "status": normalize_whl_status(game.get("game_status", "")),
                "is_home": game.get("location", "") == "Home",
                "result": get_whl_result(game),
                "league": "WHL"
            })
        return games
    except Exception as e:
        print(f"WHL fetch failed for {team_name}: {e}")
        return []


def get_result(game: Dict) -> str:
    """Determine W/L/T from NHL game."""
    if game.get("gameState") in ["OFF", "FINAL"]:
        ts = game.get("teamScore", 0)
        os = game.get("opponentScore", 0)
        if ts > os:
            return "W"
        elif ts < os:
            return "L"
        else:
            return "T"
    return "SCHEDULED"


def get_espn_result(comp: Dict, is_home: bool) -> str:
    """Determine W/L from ESPN game."""
    if comp["status"]["type"]["completed"]:
        home = comp["competitors"][0] if comp["competitors"][0]["homeAway"] == "home" else comp["competitors"][1]
        away = comp["competitors"][1] if comp["competitors"][0]["homeAway"] == "home" else comp["competitors"][0]
        
        # Handle both dict and int score formats
        home_score = home.get("score", 0)
        away_score = away.get("score", 0)
        if isinstance(home_score, dict):
            home_score = float(home_score.get("value", 0))
        if isinstance(away_score, dict):
            away_score = float(away_score.get("value", 0))
        
        if is_home:
            return "W" if home_score > away_score else "L"
        else:
            return "W" if away_score > home_score else "L"
    return "SCHEDULED"


def get_whl_result(game: Dict) -> str:
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


def normalize_whl_status(status: str) -> str:
    """Normalize WHL game status."""
    if "Final" in status or "Completed" in status:
        return "Final"
    return "Scheduled"


if __name__ == "__main__":
    # Test
    test_teams = ["Edmonton Oilers", "Toronto Blue Jays", "Edmonton Elks", "Edmonton Oil Kings"]
    for team in test_teams:
        detection = detect_league(team)
        if detection:
            print(f"✓ {team}: {detection['league']} ({detection['abbrev']})")
            games = fetch_team_schedule(team)
            print(f"  Found {len(games)} games")
        else:
            print(f"✗ {team}: Not found")
