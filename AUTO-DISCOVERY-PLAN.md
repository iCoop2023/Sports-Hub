# Auto-Discovery System for Custom Teams

## Goal
When a user adds a team (e.g., Edmonton Oil Kings - WHL), automatically:
1. Find their schedule data
2. Discover relevant news sources
3. Generate calendar feeds
4. Add appropriate news sources based on location/league

## Phase 1: Team Metadata Database

Create a comprehensive team metadata file with:

```json
{
  "Edmonton Oil Kings": {
    "league": "WHL",
    "sport": "hockey",
    "country": "Canada",
    "region": "Alberta",
    "city": "Edmonton",
    "espn_id": null,  // WHL not on ESPN
    "official_site": "https://oilkings.ca",
    "data_sources": {
      "schedule": ["chl.ca", "whl.ca", "oilkings.ca/schedule"],
      "api": "https://lscluster.hockeytech.com/feed/?feed=modulekit&view=schedule&key=...",
      "calendar": "webcal://oilkings.ca/schedule.ics"
    },
    "news_sources": {
      "primary": ["edmonton journal", "cbc edmonton", "global edmonton"],
      "league": ["whl.ca", "chl.ca"],
      "canadian": ["tsn.ca", "sportsnet.ca", "the hockey news"]
    }
  },
  "Edmonton Elks": {
    "league": "CFL",
    "sport": "football",
    "country": "Canada",
    "region": "Alberta",
    "city": "Edmonton",
    "espn_id": null,  // CFL is on ESPN
    "espn_team_id": "edm",
    "official_site": "https://www.goelks.com",
    "data_sources": {
      "schedule": ["espn.com", "cfl.ca", "goelks.com/schedule"],
      "api": "https://site.api.espn.com/apis/site/v2/sports/football/cfl/teams/...",
      "calendar": "https://www.cfl.ca/schedule/download/..."
    },
    "news_sources": {
      "primary": ["edmonton journal", "cbc edmonton", "3downnation"],
      "league": ["cfl.ca", "3downnation"],
      "canadian": ["tsn.ca", "sportsnet.ca"]
    }
  }
}
```

## Phase 2: Intelligent Source Discovery

When a team is added, run this logic:

### A. Schedule Data Discovery
```python
def find_schedule_source(team_name, league, city, country):
    # 1. Try ESPN first (covers many leagues)
    espn_result = search_espn_teams(team_name, league)
    if espn_result:
        return {
            "type": "espn",
            "team_id": espn_result.team_id,
            "api": f"https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/teams/{team_id}"
        }
    
    # 2. Try official league API
    league_api = get_league_api(league)
    if league_api:
        team_id = search_league_teams(league_api, team_name)
        return {
            "type": "league_api",
            "api": league_api,
            "team_id": team_id
        }
    
    # 3. Try web scraping official team site
    team_site = search_web(f"{team_name} official website schedule")
    return {
        "type": "scrape",
        "url": team_site,
        "selector": ".schedule-table"  # Would need to be learned
    }
```

### B. News Source Discovery

Based on team metadata, auto-add news sources:

```python
def get_news_sources(team_name, league, city, country, region):
    sources = []
    
    # Canadian teams get Canadian sources
    if country == "Canada":
        sources.extend([
            {"name": "TSN", "domain": "tsn.ca", "priority": 1},
            {"name": "Sportsnet", "domain": "sportsnet.ca", "priority": 1},
            {"name": "CBC Sports", "domain": "cbc.ca/sports", "priority": 2}
        ])
    
    # Add local city sources
    local_sources = {
        "Edmonton": [
            {"name": "Edmonton Journal", "domain": "edmontonjournal.com", "priority": 1},
            {"name": "CBC Edmonton", "domain": "cbc.ca/news/canada/edmonton", "priority": 2},
            {"name": "Global Edmonton", "domain": "globalnews.ca/edmonton", "priority": 3}
        ],
        "Calgary": [...],
        "Toronto": [...],
        # etc.
    }
    sources.extend(local_sources.get(city, []))
    
    # Add league-specific sources
    league_sources = {
        "WHL": [{"name": "WHL.ca", "domain": "whl.ca"}],
        "CFL": [{"name": "3DownNation", "domain": "3downnation.com"}],
        "CEBL": [{"name": "CEBL.ca", "domain": "cebl.ca"}],
        # etc.
    }
    sources.extend(league_sources.get(league, []))
    
    # US teams get US sources
    if country == "USA":
        sources.extend([
            {"name": "ESPN", "domain": "espn.com", "priority": 1},
            {"name": "The Athletic", "domain": "theathletic.com", "priority": 2}
        ])
    
    return sources
```

## Phase 3: Implementation Steps

### Step 1: Build Team Metadata (This Week)
- Create `team-metadata.json` with all teams
- Include: city, region, country, sport, league
- Add known API endpoints
- Add official sites

### Step 2: ESPN Auto-Discovery (Next)
When team is added:
```javascript
// Frontend calls backend
POST /api/discover-team
{
  "name": "Edmonton Oil Kings",
  "league": "WHL"
}

// Backend searches:
1. ESPN API for team
2. League API registry
3. Returns data sources
```

### Step 3: News Source Auto-Config (Next)
```javascript
// When team is added, auto-enable relevant sources
function addTeamWithSources(team) {
    const sources = discoverNewsSources(team);
    
    // Auto-enable these sources in settings
    const settings = getSettings();
    sources.forEach(source => {
        settings.newsSources[source.id] = true;
    });
    
    saveSettings(settings);
}
```

### Step 4: Web Scraping Fallback (Later)
For teams with no API:
- Use Playwright/Puppeteer to scrape official sites
- Parse HTML schedule tables
- Cache results
- Update daily

## Known APIs to Integrate

### Already Working:
- ✅ NHL API
- ✅ ESPN API (MLB, NBA, NFL, some CFL, MLS)

### Need to Add:
- **CHL (WHL/OHL/QMJHL)**: `https://lscluster.hockeytech.com/feed/`
- **CFL**: Already on ESPN, just need team ID mapping
- **CEBL**: Check if they have an API or need scraping
- **BCHL**: Likely needs web scraping

### News APIs:
- **NewsAPI.org**: Free tier, search by team name
- **Brave Search API**: Already using this
- **Google News RSS**: `https://news.google.com/rss/search?q={team_name}`

## Quick Win: City/Country Mapping

Add this to team-database.js:

```javascript
const TEAM_LOCATIONS = {
    "Edmonton Oil Kings": { city: "Edmonton", region: "Alberta", country: "Canada" },
    "Edmonton Elks": { city: "Edmonton", region: "Alberta", country: "Canada" },
    "Edmonton Oilers": { city: "Edmonton", region: "Alberta", country: "Canada" },
    "Calgary Flames": { city: "Calgary", region: "Alberta", country: "Canada" },
    // ... etc
};

const LOCAL_NEWS_SOURCES = {
    "Edmonton": ["edmontonjournal.com", "cbc.ca/news/canada/edmonton"],
    "Calgary": ["calgaryherald.com", "cbc.ca/news/canada/calgary"],
    "Toronto": ["thestar.com", "cbc.ca/news/canada/toronto"],
    // ... etc
};
```

Then auto-enable local sources when team is added!

---

## What to Build First?

**Priority 1** (Tonight/Tomorrow):
1. Add team location metadata to database
2. Auto-enable city-specific news sources
3. Show "Data coming soon" message for teams without APIs

**Priority 2** (This Week):
1. ESPN team search/discovery
2. CHL API integration (covers WHL/OHL/QMJHL)
3. Web scraping for BCHL

**Priority 3** (Next Week):
1. Google News RSS feeds as fallback
2. Automatic calendar generation
3. Smart news aggregation based on location

---

**Want me to start with Priority 1 now?** I can add location metadata and auto-enable local news sources in about 15 minutes.
