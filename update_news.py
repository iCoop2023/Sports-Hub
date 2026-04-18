#!/usr/bin/env python3
"""
Update news in the cached teams data with fresh articles from web search
"""

import json
from pathlib import Path
from datetime import datetime

# Paths
BASE_DIR = Path(__file__).parent
CACHE_FILE = BASE_DIR / "data" / "cache" / "all_teams.json"

# Fresh news data from web searches
FRESH_NEWS = {
    "Edmonton Oilers": [
        {
            "title": "Oilers sign forward Owen Michaels to entry-level contract",
            "url": "https://www.tsn.ca/nhl/article/oilers-sign-f-michaels-to-one-year-entry-level-contract/",
            "source": "tsn.ca",
            "age": "4d ago"
        },
        {
            "title": "Edmonton Oilers dropped a 5-1 decision on Hockey Night",
            "url": "https://www.nhl.com/oilers/",
            "source": "nhl.com",
            "age": "19h ago"
        },
        {
            "title": "McDavid sets up Savoie's power-play goal in 3-1 win over Blackhawks",
            "url": "https://www.espn.com/nhl/team/_/name/edm/edmonton-oilers",
            "source": "espn.com",
            "age": "5h ago"
        },
        {
            "title": "Bouchard converts off the keep-in late for his 21st goal",
            "url": "https://www.sportsnet.ca/hockey/nhl/teams/edmonton-oilers/",
            "source": "sportsnet.ca",
            "age": "2d ago"
        },
        {
            "title": "Oilers look to sweep season series against Vegas on Saturday",
            "url": "https://www.nhl.com/oilers/",
            "source": "nhl.com",
            "age": "19h ago"
        }
    ],
    "Pittsburgh Penguins": [
        {
            "title": "Malkin hat trick, 6 goals in 2nd period lead Pens past Panthers 9-4",
            "url": "https://www.nhl.com/news/florida-panthers-pittsburgh-penguins-game-recap-april-4-2026",
            "source": "nhl.com",
            "age": "1d ago"
        },
        {
            "title": "Penguins look to sweep season series vs Panthers TODAY at 3 PM",
            "url": "https://www.nhl.com/penguins/",
            "source": "nhl.com",
            "age": "1d ago"
        },
        {
            "title": "Crosby has goal, 2 assists as Penguins defeat Panthers 5-2",
            "url": "https://www.nhl.com/news/florida-panthers-pittsburgh-penguins-game-recap-april-5-2026",
            "source": "nhl.com",
            "age": "12h ago"
        },
        {
            "title": "Rakell scores twice, Crosby adds goal and two assists in win",
            "url": "https://www.espn.com/nhl/team/_/name/pit/pittsburgh-penguins",
            "source": "espn.com",
            "age": "19h ago"
        },
        {
            "title": "Penguins explode for 5 goals in 2nd, rally past Islanders 8-3",
            "url": "https://www.nhl.com/news/pittsburgh-penguins-new-york-islanders-game-recap-march-30-2026",
            "source": "nhl.com",
            "age": "1w ago"
        }
    ],
    "Toronto Blue Jays": [
        {
            "title": "Gausman turned in another gem, Jays fall 2-1 in 10 innings",
            "url": "https://www.tsn.ca/mlb/",
            "source": "tsn.ca",
            "age": "1d ago"
        },
        {
            "title": "Blue Jays option Little, Estrada to triple-A, select Mantiply, Voth",
            "url": "https://www.sportsnet.ca/mlb/article/blue-jays-option-little-estrada-to-triple-a-select-mantiply-voth/",
            "source": "sportsnet.ca",
            "age": "17h ago"
        },
        {
            "title": "Blue Jays sign veteran left-hander Patrick Corbin to 1-year deal",
            "url": "https://www.tsn.ca/mlb/main.asp",
            "source": "tsn.ca",
            "age": "4d ago"
        },
        {
            "title": "White Sox beat Toronto Blue Jays 6-3 Saturday",
            "url": "https://www.espn.com/mlb/team/_/name/tor/toronto-blue-jays",
            "source": "espn.com",
            "age": "6h ago"
        },
        {
            "title": "Toronto Blue Jays latest schedule and game info",
            "url": "https://www.mlb.com/bluejays",
            "source": "mlb.com",
            "age": "7h ago"
        }
    ],
    "Toronto Raptors": [
        {
            "title": "Raptors fail test against Kings as DeRozan, Achiuwa burn former team",
            "url": "https://www.sportsnet.ca/nba/article/raptors-fail-test-against-kings-as-derozan-achiuwa-burn-former-team/",
            "source": "sportsnet.ca",
            "age": "4d ago"
        },
        {
            "title": "Raptors fall out of 6th seed into play-in spot after loss to Kings",
            "url": "https://www.tsn.ca/nba/",
            "source": "tsn.ca",
            "age": "20h ago"
        },
        {
            "title": "Raptors coasted to 128-96 victory over Grizzlies on Friday night",
            "url": "https://www.espn.com/nba/team/_/name/tor/toronto-raptors",
            "source": "espn.com",
            "age": "16h ago"
        },
        {
            "title": "RJ Barrett scored 25 points, Brandon Ingram had 17 points",
            "url": "https://www.espn.com/nba/team/_/name/tor/toronto-raptors",
            "source": "espn.com",
            "age": "16h ago"
        },
        {
            "title": "The Official Site of the Toronto Raptors",
            "url": "https://www.nba.com/raptors/",
            "source": "nba.com",
            "age": "14h ago"
        }
    ],
    "Kansas City Chiefs": [
        {
            "title": "Chiefs agree to terms with 2022 first-round CB Kaiir Elam",
            "url": "https://www.nfl.com/news/nfl-news-roundup-latest-league-updates-from-thursday-april-2",
            "source": "nfl.com",
            "age": "4d ago"
        },
        {
            "title": "Andy Reid on Patrick Mahomes Week 1 return: 'I would never bet against him'",
            "url": "https://www.espn.com/nfl/story/_/id/48358973/andy-reid-patrick-mahomes-week-1-return-never-bet-him",
            "source": "espn.com",
            "age": "6d ago"
        },
        {
            "title": "After losing McDuffie and Watson to Rams, cornerback is top need",
            "url": "https://www.espn.com/blog/kansas-city-chiefs",
            "source": "espn.com",
            "age": "2d ago"
        },
        {
            "title": "Mansoor Delane blew scouts away with 4.38 40-yard dash at LSU pro day",
            "url": "https://www.espn.com/blog/kansas-city-chiefs",
            "source": "espn.com",
            "age": "2d ago"
        },
        {
            "title": "Kansas City Chiefs Latest News and Schedule",
            "url": "https://www.nfl.com/teams/kansas-city-chiefs/",
            "source": "nfl.com",
            "age": "4d ago"
        }
    ],
    "Real Madrid": [
        {
            "title": "Arbeloa sends message to Ancelotti after Vinicius' fatigue concerns",
            "url": "https://www.marca.com/en/football/real-madrid.html",
            "source": "marca.com",
            "age": "1d ago"
        },
        {
            "title": "Enzo Fernandez hints at Real Madrid move, benched for two games",
            "url": "https://www.goal.com/en/team/real-madrid/3kq9cckrnlogidldtdie2fkbl",
            "source": "goal.com",
            "age": "6d ago"
        },
        {
            "title": "Real Madrid letting three players go, setting tough conditions for four",
            "url": "https://www.goal.com/en-us/news/it-s-a-done-deal-madrid-are-letting-three-players-go-and-setting-tough-conditions-for-the-retention-of-four-others/blt77b93d83b490ca2a",
            "source": "goal.com",
            "age": "5h ago"
        },
        {
            "title": "Real Madrid lost 2-1 at Mallorca on Saturday in stoppage time",
            "url": "https://www.espn.com/soccer/team/_/id/86",
            "source": "espn.com",
            "age": "1d ago"
        },
        {
            "title": "Vedat Muriqi secured 2-1 win for Mallorca with stoppage-time goal",
            "url": "https://www.espn.com/soccer/report/_/gameId/748437",
            "source": "espn.com",
            "age": "1d ago"
        }
    ],
    "Edmonton Elks": [
        {
            "title": "Elks add Rick Campbell to coaching staff as analyst",
            "url": "https://www.cfl.ca/2026/04/01/elks-add-rick-campbell-to-coaching-staff/",
            "source": "cfl.ca",
            "age": "5d ago"
        },
        {
            "title": "Edmonton Elks 2026 schedule released - season opener May 23",
            "url": "https://www.goelks.com/2025/12/09/edmonton-elks-2026-schedule-released/",
            "source": "goelks.com",
            "age": "4mo ago"
        },
        {
            "title": "3 bold predictions for the 2026 CFL season",
            "url": "https://www.cfl.ca/2026/02/24/3-bold-predictions-for-the-2026-cfl-season/",
            "source": "cfl.ca",
            "age": "6w ago"
        },
        {
            "title": "Elks' quarterback room analysis heading into 2026",
            "url": "https://www.cfl.ca/2026/02/18/a-look-at-all-9-teams-quarterback-rooms/",
            "source": "cfl.ca",
            "age": "7w ago"
        },
        {
            "title": "Edmonton Elks latest news and roster updates",
            "url": "https://www.tsn.ca/cfl/team-page/edmonton-elks/114347/",
            "source": "tsn.ca",
            "age": "3d ago"
        }
    ],
    "Edmonton Stingers": [
        {
            "title": "Stingers bring back CEBL veteran and team captain Nick Hornsby",
            "url": "https://www.thestingers.ca/",
            "source": "thestingers.ca",
            "age": "3d ago"
        },
        {
            "title": "6'4 Canadian guard returns to Edmonton for 2026 season",
            "url": "https://www.thestingers.ca/",
            "source": "thestingers.ca",
            "age": "12d ago"
        },
        {
            "title": "Emmanuel Bandoumel joins Stingers roster for CEBL season",
            "url": "https://www.thestingers.ca/",
            "source": "thestingers.ca",
            "age": "17d ago"
        },
        {
            "title": "CEBL 2026 season schedule released - Stingers home opener May 22",
            "url": "https://www.cebl.ca/games",
            "source": "cebl.ca",
            "age": "1w ago"
        },
        {
            "title": "Stingers 2026 roster moves and season preview",
            "url": "https://www.thestingers.ca/schedule",
            "source": "thestingers.ca",
            "age": "5d ago"
        }
    ],
    "Edmonton Oil Kings": [
        {
            "title": "Oil Kings force Game 7 after double-overtime thriller vs Blades",
            "url": "https://www.oursportscentral.com/services/releases/holinkas-double-overtime-winner-sends-oil-kings-to-game-seven/n-6344336",
            "source": "oursportscentral.com",
            "age": "18h ago"
        },
        {
            "title": "Edmonton survives Game 6 overtime controversy to stay alive",
            "url": "https://www.ckom.com/2026/04/05/edmonton-oil-kings-game-6-overtime-controversy-saskatoon-blades-prepare/",
            "source": "ckom.com",
            "age": "11h ago"
        },
        {
            "title": "Blades drop Oil Kings in Game 5, Edmonton faces elimination",
            "url": "https://www.oursportscentral.com/services/releases/oil-kings-fall-to-blades-in-game-five/n-6343394",
            "source": "oursportscentral.com",
            "age": "3d ago"
        },
        {
            "title": "Oil Kings look to extend series in Saskatoon",
            "url": "https://www.oursportscentral.com/services/releases/oil-kings-down-to-final-strike-against-blades-in-game-6/n-6344175",
            "source": "oursportscentral.com",
            "age": "1d ago"
        },
        {
            "title": "Edmonton aims to tie series back up at Rogers Place",
            "url": "https://www.oursportscentral.com/services/releases/oil-kings-looking-to-tie-series-with-blades-back-up/n-6342002",
            "source": "oursportscentral.com",
            "age": "5d ago"
        }
    ]
}

def main():
    """Update the cache file with fresh news."""
    # Load current cache
    with open(CACHE_FILE) as f:
        data = json.load(f)
    
    # Update news for each team
    for team_name, news_list in FRESH_NEWS.items():
        if team_name in data["teams"]:
            data["teams"][team_name]["news"] = [
                {
                    "title": article["title"],
                    "url": article["url"],
                    "source": article["source"],
                    "age": article["age"]
                }
                for article in news_list
            ]
            print(f"✅ Updated {team_name}: {len(news_list)} articles")
        else:
            print(f"⚠️  Team not found: {team_name}")
    
    # Update timestamp
    data["fetched_at"] = datetime.utcnow().isoformat()
    
    # Save updated cache
    with open(CACHE_FILE, "w") as f:
        json.dump(data, f, indent=2)
    
    print(f"\n✅ Cache updated: {CACHE_FILE}")
    print(f"Timestamp: {data['fetched_at']}")

if __name__ == "__main__":
    main()
