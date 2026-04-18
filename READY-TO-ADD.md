# Ready to Add - Next Session

## ✅ What's Done

1. **Backend API** - Live at https://sports-hub-sepia.vercel.app/api
2. **Web App** - Mobile-friendly at https://sports-hub-sepia.vercel.app  
3. **All Teams Working** - Including Raptors (82 games) and Chiefs (17 games)
4. **Modern Design** - iOS-style cards, color-coded W/L, smooth animations

## 🎯 Ready to Implement (Next 60-90 min)

### A. Calendar Buttons (10-15 min)
**File:** `web/calendar-links.js` (already created)

**Add to index.html:**
1. Include calendar script before closing `</body>`:
   ```html
   <script src="calendar-links.js"></script>
   ```

2. Add button to team header in `renderTeamCard()`:
   ```javascript
   <button class="calendar-btn" onclick="showCalendarMenu('${team.name}', event)">
       📅
   </button>
   ```

3. Add CSS for button:
   ```css
   .calendar-btn {
       position: absolute;
       top: 25px;
       right: 20px;
       background: rgba(10, 132, 255, 0.2);
       border: 1px solid #0a84ff;
       color: #0a84ff;
       padding: 8px 12px;
       border-radius: 8px;
       font-size: 1.2rem;
       cursor: pointer;
   }
   ```

**Result:** Tap📅 → Choose iCal/Google/Official schedule

---

### B. Better News (30-40 min)

**Run these web searches and update cache:**

```python
# For each team, fetch 5 articles:
teams_queries = {
    "Edmonton Oilers": "Edmonton Oilers news site:tsn.ca OR site:sportsnet.ca OR site:nhl.com",
    "Pittsburgh Penguins": "Pittsburgh Penguins news site:nhl.com OR site:espn.com",
    "Toronto Blue Jays": "Toronto Blue Jays news site:sportsnet.ca OR site:tsn.ca OR site:mlb.com",
    "Kansas City Chiefs": "Kansas City Chiefs news site:nfl.com OR site:espn.com",
    "Toronto Raptors": "Toronto Raptors news site:tsn.ca OR site:sportsnet.ca OR site:nba.com",
    "Real Madrid": "Real Madrid news site:marca.com OR site:goal.com OR site:bbc.com/sport"
}

# Use web_search for each, extract 5 articles
# Update data/cache/all_teams.json
# Redeploy
```

**Agent command:**
"Fetch 5 news articles for each of my sports teams using the queries in READY-TO-ADD.md, update the cache, and redeploy"

---

### C. Settings Page (45-60 min)

**Create:** `web/settings.html`

**Features:**
- Toggle news sources (TSN, ESPN, Sportsnet, etc.)
- Add/remove teams
- Display preferences
- Save to localStorage

**Navigation:**
Add settings button to header:
```html
<a href="/settings.html" class="settings-btn">⚙️</a>
```

---

## Commands for You

**If I continue tonight:**
1. "Add the calendar subscribe buttons now"
2. "Fetch better news for all teams (5 articles each)"
3. "Build the settings page"

**If continuing tomorrow:**
Just say "Continue with the sports hub enhancements" and I'll pick up where we left off.

---

## Current State

**Live URL:** https://sports-hub-sepia.vercel.app

**Working perfectly:**
- All 6 teams display
- Games show correctly (recent + upcoming)
- Raptors and Chiefs now have full data
- Mobile-responsive
- Can add to home screen

**Ready to add:**
- Calendar subscribe (10 min)
- 5 news per team (30 min)
- Settings page (45 min)

**Total remaining:** ~90 minutes of work

---

Let me know if you want me to keep going or if you want to test what's there and continue tomorrow!
