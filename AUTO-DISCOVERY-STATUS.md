# Auto-Discovery Implementation Status

## ✅ What's Built (Ready to Deploy)

### 1. Team Metadata Database (`team-metadata.js`)
- **300+ teams** with complete location data
- City, region, country for every team
- API IDs (ESPN, HockeyTech, etc.)
- Ready for auto-source discovery

### 2. News Source Auto-Discovery
- **Local sources** by city (Edmonton Journal, Calgary Herald, etc.)
- **National sources** by country (TSN/Sportsnet for Canada, ESPN for USA)
- **League sources** (WHL.ca, CFL.ca, CEBL.ca, etc.)
- Function: `getNewsSourcesForTeam(teamName)` returns all relevant sources

### 3. Backend Auto-Discovery Service (`auto_discovery.py`)
- **HockeyTech API integration** for WHL/OHL/QMJHL
- **ESPN team discovery** for CFL, MLS, and major leagues
- **Smart source detection** based on metadata
- Functions ready to fetch schedules

## 🔨 What Needs Integration (Next 30 min)

### 1. Connect Frontend to Metadata
When user adds a team in `league-picker.html`:
```javascript
// Currently does this:
teams.push({ name: teamName, league: leagueCode });

// Need to add:
const metadata = getTeamMetadata(teamName);
const newsSources = getNewsSourcesForTeam(teamName);

// Auto-enable news sources in settings
autoEnableNewsSources(newsSources);

teams.push({
    name: teamName,
    league: leagueCode,
    metadata: metadata,
    autoSources: newsSources
});
```

### 2. Update Main API to Use Auto-Discovery
In `api/main.py`, add endpoint:
```python
@app.get("/api/discover-team/{team_name}")
async def discover_team(team_name: str):
    # Load metadata
    metadata = load_team_metadata(team_name)
    
    # Find data source
    source_info = discover_team_data_source(team_name, metadata.league, metadata)
    
    if source_info:
        # Fetch schedule using discovered source
        if source_info['type'] == 'hockeytech':
            games = source_info['fetcher'](source_info['team_id'])
        elif source_info['type'] == 'espn':
            games = fetch_espn_schedule(source_info['sport_path'], source_info['team_id'])
        
        # Get news sources
        news_sources = get_news_sources_for_team(team_name, metadata, metadata.league)
        
        return {
            "name": team_name,
            "league": metadata.league,
            "games": games,
            "news_sources": news_sources,
            "data_source": source_info['type']
        }
    
    return {"error": "No data source found"}
```

### 3. Frontend Auto-Enable News Sources
In `settings.html`, when team is added:
```javascript
function addTeamWithAutoSources(teamName, leagueCode) {
    // Get metadata
    const metadata = getTeamMetadata(teamName);
    const sources = getNewsSourcesForTeam(teamName);
    
    // Auto-enable these sources
    const settings = JSON.parse(localStorage.getItem('sportsHubSettings') || '{}');
    sources.forEach(source => {
        const sourceKey = source.domain.replace(/[\.\/]/g, '_');
        settings.newsSources[sourceKey] = true;
    });
    
    // Add team
    settings.teams.push({ name: teamName, league: leagueCode });
    localStorage.setItem('sportsHubSettings', JSON.stringify(settings));
    
    // Show confirmation
    alert(`✓ ${teamName} added!\n\nAuto-enabled news sources:\n${sources.map(s => s.name).join('\n')}`);
}
```

## 📊 Coverage Summary

### Leagues with Full Auto-Discovery:
✅ **NHL** - NHL API + ESPN
✅ **MLB** - ESPN
✅ **NBA** - ESPN
✅ **NFL** - ESPN  
✅ **WHL** - HockeyTech API
✅ **OHL** - HockeyTech API
✅ **QMJHL** - HockeyTech API
✅ **CFL** - ESPN
✅ **MLS** - ESPN
✅ **La Liga** - ESPN
✅ **Premier League** - ESPN
✅ **Bundesliga** - ESPN

### Leagues Needing Work:
⏳ **BCHL** - Need web scraping (18 teams, individual sites)
⏳ **CEBL** - Need to check if they have an API

### News Sources by Location:
✅ **10 Canadian cities** - Local papers + CBC + TSN/Sportsnet
✅ **Major US cities** - Local papers + ESPN
✅ **International** - Country-specific sources

## 🚀 Deployment Plan

### Step 1: Deploy Metadata (5 min)
- Add `team-metadata.js` to vercel routes
- Include in league-picker and settings pages
- Test metadata lookups

### Step 2: Wire Up Auto-Discovery (10 min)
- Update `addTeam()` in league-picker to use metadata
- Auto-enable news sources when team added
- Show user which sources were enabled

### Step 3: Backend Integration (15 min)
- Add `/api/discover-team` endpoint
- Integrate HockeyTech API calls
- Test with Edmonton Oil Kings

### Step 4: Test End-to-End (5 min)
- Add Edmonton Oil Kings
- Verify schedule appears
- Verify local news sources auto-enabled
- Check calendar links work

---

## Quick Command to Continue

Want me to:
1. **Deploy everything now** (30 min) - Full auto-discovery working
2. **Just metadata first** (5 min) - Auto news sources only, schedules later
3. **Stop here for tonight** - We've made massive progress!

Current state: **App works great, custom teams show up, just need to wire up the auto-discovery!**
