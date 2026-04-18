# Sports Hub - Part 2 Fixes

## Requirements

1. **Auto-update news when adding teams**
2. **Remove default teams** - Show sign-in or "add temporary teams" when not logged in
3. **Use proper league and team logos**

## Implementation Plan

### 1. Auto-fetch News When Adding Teams

**Current flow:**
- User adds team → team appears on dashboard
- News isn't fetched until next manual refresh

**New flow:**
- User adds team → API call to `/api/team/fetch` → fetches schedule + news → updates cache → team appears with data

**Files to modify:**
- `web/league-picker.html` - Update `addTeam()` function
- `api/main.py` - Ensure `/api/team/fetch` endpoint fetches news

**Implementation:**

```javascript
// In league-picker.html
async function addTeam(teamName, leagueCode) {
    const settings = JSON.parse(localStorage.getItem('sportsHubSettings') || '{}');
    const teams = settings.teams || [];
    
    if (teams.some(t => t.name === teamName)) {
        showMessage(teamName + ' is already in your list!');
        return;
    }
    
    // Show loading state
    showMessage('Adding ' + teamName + ' and fetching latest data...');
    
    try {
        // Fetch team data from API
        const response = await fetch(`${API_BASE}/api/team/fetch?team_name=${encodeURIComponent(teamName)}`);
        const result = await response.json();
        
        if (result.status === 'success') {
            // Add team to settings
            teams.push({ name: teamName, league: leagueCode });
            settings.teams = teams;
            localStorage.setItem('sportsHubSettings', JSON.stringify(settings));
            
            // Save to server if logged in
            if (auth.currentUser) {
                await saveSettings(settings);
            }
            
            showMessage(`✓ ${teamName} added with ${result.games_found} games and ${result.news_found} articles`);
            
            // Redirect to dashboard after 1 second
            setTimeout(() => window.location.href = '/', 1000);
        } else {
            showMessage('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Failed to fetch team data:', error);
        showMessage('Error adding team. Please try again.');
    }
}
```

### 2. Remove Default Teams (Empty State)

**Current:**
- App shows 6 default teams even when not logged in

**New:**
- Not logged in → Show sign-in button + "Add Temporary Teams" option
- Logged in with no teams → Show "Add Your First Team" prompt

**Files to modify:**
- `web/index.html` - Update dashboard loading logic
- `api/main.py` - Don't return default teams

**Implementation:**

```javascript
// In index.html
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE}/api/settings`, {
            headers: auth.currentUser ? {
                'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
            } : {}
        });
        
        const settings = await response.json();
        
        if (!settings.teams || settings.teams.length === 0) {
            showEmptyState();
            return;
        }
        
        // Load teams...
    } catch (error) {
        console.error('Failed to load settings:', error);
        showEmptyState();
    }
}

function showEmptyState() {
    const container = document.getElementById('teams-container');
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">🏟️</div>
            <h2>No Teams Yet</h2>
            <p>Get started by adding your favorite teams</p>
            
            ${auth.currentUser ? `
                <a href="/league-picker.html" class="add-team-btn">
                    ➕ Add Your First Team
                </a>
            ` : `
                <button onclick="signInWithGoogle()" class="sign-in-btn">
                    📧 Sign In to Save Teams
                </button>
                <p class="or-divider">— or —</p>
                <a href="/league-picker.html" class="add-temp-btn">
                    Add Temporary Teams (Not Saved)
                </a>
            `}
        </div>
    `;
}
```

**Backend change:**
```python
# In api/main.py - update get_settings
def load_user_settings() -> dict:
    if SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE) as f:
                return json.load(f)
        except Exception:
            pass
    # Return empty settings instead of defaults
    return {
        "teams": [],
        "newsSources": {},
        "newsCount": 5
    }
```

### 3. Proper League and Team Logos

**Requirements:**
- League badges for each team card
- Team logos in team headers
- League logos in league picker

**Sources:**
- **NHL:** `https://assets.nhle.com/logos/nhl/svg/{TEAM_ABBREV}_dark.svg`
- **MLB:** ESPN API provides logos
- **NBA:** ESPN API provides logos  
- **NFL:** ESPN API provides logos
- **Soccer:** Use ESPN or official league APIs

**Implementation:**

**Add logo URLs to team metadata:**
```javascript
// In team-metadata.js
const TEAM_LOGO_URLS = {
    // NHL
    "Edmonton Oilers": "https://assets.nhle.com/logos/nhl/svg/EDM_dark.svg",
    "Pittsburgh Penguins": "https://assets.nhle.com/logos/nhl/svg/PIT_dark.svg",
    
    // MLB (ESPN)
    "Toronto Blue Jays": "https://a.espncdn.com/i/teamlogos/mlb/500/tor.png",
    
    // NBA (ESPN)
    "Toronto Raptors": "https://a.espncdn.com/i/teamlogos/nba/500/tor.png",
    
    // NFL (ESPN)
    "Kansas City Chiefs": "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png",
    
    // Soccer (ESPN)
    "Real Madrid": "https://a.espncdn.com/i/teamlogos/soccer/500/86.png"
};

const LEAGUE_LOGOS = {
    "NHL": "🏒",  // Or actual logo URL
    "MLB": "⚾",
    "NBA": "🏀",
    "NFL": "🏈",
    "La Liga": "⚽",
    "Premier League": "⚽",
    "WHL": "🏒"
};
```

**Update team cards to show logos:**
```javascript
// In index.html renderTeamCard()
function renderTeamCard(team) {
    const logoUrl = TEAM_LOGO_URLS[team.name] || '';
    const leagueLogo = LEAGUE_LOGOS[team.league] || '🏟️';
    
    return `
        <div class="team-card">
            <div class="team-header">
                ${logoUrl ? `<img src="${logoUrl}" class="team-logo" alt="${team.name}">` : ''}
                <div class="team-info">
                    <h2>${team.name}</h2>
                    <span class="league-badge">${leagueLogo} ${team.league}</span>
                </div>
                <button class="calendar-btn" onclick="showCalendarMenu('${team.name}', event)">
                    📅
                </button>
            </div>
            <!-- rest of card -->
        </div>
    `;
}
```

**CSS for logos:**
```css
.team-logo {
    width: 60px;
    height: 60px;
    object-fit: contain;
    margin-right: 15px;
}

.team-header {
    display: flex;
    align-items: center;
    padding: 25px;
    border-bottom: 1px solid #38383a;
}

.team-info {
    flex: 1;
}
```

---

## Next Steps

1. **Test auto-fetch:** Add a new team and verify news/schedule loads immediately
2. **Test empty state:** Sign out and verify proper empty state
3. **Add team logos:** Build comprehensive logo database
4. **Deploy:** Push changes to Vercel

## Files to Create/Modify

- [x] `FIXES-PART-2.md` (this file)
- [ ] `web/league-picker.html` - Auto-fetch logic
- [ ] `web/index.html` - Empty state + logos
- [ ] `api/main.py` - Remove default teams
- [ ] `web/team-logos.js` - Logo URL database
- [ ] `web/index.html` - CSS for logos

---

**Ready to implement?** Let me know which part to start with.
