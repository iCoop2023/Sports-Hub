# Final TODOs for Tonight

## Issue 1: News sources don't show in settings list ✅ FIXED
**Solution**: Added `quick-fix-news.js` that dynamically renders auto-discovered sources in settings

## Issue 2: Teams without schedules should still show 5 news stories
**Current**: Teams with no API data show "No games available"
**Needed**: Even without games, fetch and show 5 news articles

**Implementation**:
1. When team card renders and `games.length === 0`
2. Still call news fetching for that team
3. Use web_search with team name + enabled news sources
4. Show 5 articles even if no schedule exists

**Quick Fix** (For custom teams like Oil Kings, Elks, Stingers):
```python
# In api/main.py
@app.get("/api/team-news/{team_name}")
async def get_team_news(team_name: str):
    # Use team metadata to get news sources
    # Search enabled sources for articles
    # Return 5 articles
    
    # Placeholder for now:
    return {
        "team": team_name,
        "news": [
            {"title": f"{team_name} latest news", "source": "local", "age": "1h ago"},
            {"title": f"{team_name} upcoming games", "source": "league", "age": "2h ago"},
            # ... etc
        ]
    }
```

Then in frontend:
```javascript
// If team has no games but is custom
if (team.custom && team.games.length === 0) {
    // Fetch news separately
    const newsResp = await fetch(`${API_BASE}/api/team-news/${team.name}`);
    const newsData = await newsResp.json();
    team.news = newsData.news;
}
```

## Current Status

### ✅ Working:
- Visual league picker
- Auto-discovery of news sources
- Sources auto-enabled when team added
- Teams appear on dashboard
- Drag-to-reorder
- Calendar buttons
- Settings page

### ⏳ Needs 10 more minutes:
1. **Add quick-fix-news.js to Vercel routes**
2. **Create placeholder news for teams without schedules**
3. **Test end-to-end**

## Deploy Command
```bash
cd /home/ja/.openclaw/workspace/projects/sports-hub
vercel --prod
```

Then test:
1. Add Edmonton Oil Kings
2. Check settings - see auto-enabled sources
3. Go to dashboard - see Oil Kings card with news (even without schedule)

---

**Want me to finish these last 2 items now? (~10 min)**
