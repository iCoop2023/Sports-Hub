# Data Source Research - Like FlashScore

## How FlashScore Works

FlashScore (owned by LiveScore) aggregates data from:
1. **Official league APIs** - NHL, NBA, MLB, NFL official feeds
2. **Sportradar API** - Major data provider for live scores
3. **SofaScore API** - Open sports data aggregator
4. **Perform Group APIs** - Opta Sports data
5. **Web scraping** - For smaller leagues
6. **Direct feeds** - From leagues/teams that provide data

## Available APIs for Our Leagues

### ✅ Already Working
- **NHL**: Official NHL API (`api-web.nhle.com`)
- **MLB/NBA/NFL**: ESPN API
- **La Liga/Premier League/Bundesliga**: ESPN + SofaScore

### 🔧 Need to Integrate

#### CHL (WHL/OHL/QMJHL)
- **HockeyTech API**: `https://lscluster.hockeytech.com/feed/`
  - All CHL teams use this
  - Free public access
  - JSON format
  - Example: `https://lscluster.hockeytech.com/feed/?feed=modulekit&view=schedule&key=41b145a848f4bd67&fmt=json&client_code=whl&team_id=20&season_id=79`
  
#### CFL
- **ESPN API**: Already covers CFL
  - `https://site.api.espn.com/apis/site/v2/sports/football/cfl/teams`
  - Need team ID mapping

#### CEBL
- **Options**:
  1. Check if they have an API: `https://cebl.ca/api/...`
  2. Use web scraping from their site
  3. Check if Sportradar covers them

#### BCHL
- **Web Scraping**: Most likely path
  - Each team has own website
  - Parse schedule tables
  - No unified API found

#### MLS
- **ESPN API**: Covered
  - `https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/teams`

### Alternative: SofaScore API

SofaScore has a public(ish) API that covers:
- 400+ leagues worldwide
- Real-time scores
- Team info, schedules
- News

**Endpoints:**
```
https://api.sofascore.com/api/v1/team/{team_id}/events/next/0
https://api.sofascore.com/api/v1/team/{team_id}/events/last/0
https://api.sofascore.com/api/v1/sport/{sport}/events/{date}
```

**Challenge**: Need to find team IDs

### Alternative: FlashScore API (Unofficial)

Community reverse-engineered endpoints:
```
https://www.flashscore.com/x/feed/...
```
But this is not officially supported.

## Best Strategy for Each League

| League | Primary Source | Backup |
|--------|---------------|---------|
| NHL | NHL API | ESPN |
| MLB | ESPN | MLB Stats API |
| NBA | ESPN | NBA Stats API |
| NFL | ESPN | NFL API |
| CFL | ESPN | CFL.ca scraping |
| MLS | ESPN | MLS API |
| WHL | HockeyTech | Team sites |
| OHL | HockeyTech | Team sites |
| QMJHL | HockeyTech | Team sites |
| BCHL | Team sites | Manual entry |
| CEBL | Web scraping | Manual entry |
| La Liga | ESPN | SofaScore |
| Premier League | ESPN | SofaScore |
| Bundesliga | ESPN | SofaScore |

## Implementation Plan

### Phase 1: Integrate Known APIs (Now)
1. **HockeyTech for CHL** - All WHL/OHL/QMJHL teams
2. **ESPN team ID mapping** - CFL, MLS coverage
3. **Team metadata database** - Locations, IDs, sources

### Phase 2: Add SofaScore (Next)
- Universal fallback for most leagues
- Search function to find team IDs
- Real-time score support

### Phase 3: Web Scraping (Later)
- BCHL individual team sites
- CEBL schedule pages
- Generic HTML table parser

## News Source Discovery

Based on location metadata:

```javascript
const NEWS_SOURCES_BY_LOCATION = {
  "Edmonton, Alberta, Canada": [
    "edmontonjournal.com",
    "cbc.ca/news/canada/edmonton",
    "globalnews.ca/edmonton",
    "tsn.ca",
    "sportsnet.ca"
  ],
  "Calgary, Alberta, Canada": [
    "calgaryherald.com",
    "cbc.ca/news/canada/calgary",
    "globalnews.ca/calgary",
    "tsn.ca",
    "sportsnet.ca"
  ],
  // ... etc
};

const NEWS_SOURCES_BY_LEAGUE = {
  "WHL": ["whl.ca", "chl.ca", "thehockeynews.com"],
  "CFL": ["cfl.ca", "3downnation.com"],
  "CEBL": ["cebl.ca"],
  // ... etc
};
```

## Next Steps

1. ✅ Build HockeyTech API integration
2. ✅ Add team location metadata
3. ✅ Create auto-discovery service
4. ⏳ Test with Edmonton Oil Kings
5. ⏳ Add SofaScore as universal fallback

---

**Starting implementation now...**
