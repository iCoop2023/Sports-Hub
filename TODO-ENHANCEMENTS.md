# Immediate Enhancements - Ready to Deploy

## Status: Raptors & Chiefs Fixed ✅

**Deployed:** https://sports-hub-sepia.vercel.app now shows:
- ✅ Toronto Raptors games (3 upcoming)
- ✅ Kansas City Chiefs games (recent season)

## Next: Add Calendar + Better News

### 1. Calendar Subscribe Button (15 min)

**Add to each team card header:**
```html
<button class="calendar-btn" onclick="showCalendarMenu('Team Name')">
    📅 Subscribe
</button>
```

**Calendar links ready:**
- Edmonton Oilers: `webcal://www.nhl.com/oilers/schedule/downloadable`
- Pittsburgh Penguins: `webcal://www.nhl.com/penguins/schedule/downloadable`
- Toronto Blue Jays: `webcal://www.mlb.com/bluejays/schedule/downloadable`
- Kansas City Chiefs: `webcal://www.chiefs.com/schedule.ics`
- Toronto Raptors: `webcal://www.nba.com/raptors/schedule/downloadable`
- Real Madrid: `https://www.espn.com/soccer/team/schedule/_/id/86/real-madrid`

**Implementation:**
- Add calendar-links.js (already created)
- Include script in index.html
- Add button to team header
- Style button to match design

### 2. Enhanced News (5 per team, 30 min)

**Current:** 1-2 articles per team
**Target:** 5 articles from diverse sources

**Sources by team:**
- **Oilers:** TSN, Sportsnet, NHL.com, Edmonton Journal, The Hockey News
- **Penguins:** NHL.com, ESPN, Pittsburgh Post-Gazette, The Athletic
- **Blue Jays:** Sportsnet, TSN, MLB.com, Toronto Star, ESPN
- **Chiefs:** NFL.com, ESPN, Kansas City Star, SI.com
- **Raptors:** TSN, Sportsnet, NBA.com, ESPN, Toronto Star
- **Real Madrid:** Marca, Goal, BBC Sport, ESPN FC, AS

**Implementation:**
- Run web_search for each team x 5 sources
- Update cache with 5 articles each
- Redeploy

### 3. Settings Page (45 min)

**Route:** `/settings`

**Features:**
- News source toggles (enable/disable by domain)
- Theme selector (dark/light/auto)
- Display preferences (articles per team, games to show)

**Save to:** localStorage initially, API later

---

## Quick Command to Continue

Want me to:
**A)** Add calendar buttons now (quick win, 10 min)
**B)** Fetch better news first (30 min, more articles)
**C)** Build settings page (45 min, full control)

Or all three in sequence?
