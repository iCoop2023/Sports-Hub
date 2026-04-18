# Quick Wins - Immediate Improvements

## 1. Calendar Subscriptions (Can add TODAY)

### Official Team Calendar URLs

**Edmonton Oilers:**
- iCal: `https://www.nhl.com/oilers/schedule?season=20252026`
- Google Calendar: Search "Edmonton Oilers" in Google Calendar

**Pittsburgh Penguins:**
- iCal: `https://www.nhl.com/penguins/schedule?season=20252026`

**Toronto Blue Jays:**
- iCal: `https://www.mlb.com/bluejays/schedule/downloadable`
- Google: Search "Toronto Blue Jays" in Google Calendar

**Kansas City Chiefs:**
- iCal: `https://www.chiefs.com/team/schedule`
- Google: Search "Kansas City Chiefs"

**Toronto Raptors:**
- iCal: `https://www.nba.com/raptors/schedule`
- Google: Search "Toronto Raptors"

**Real Madrid:**
- ESPN: `https://www.espn.com/soccer/team/calendar/_/id/86/real-madrid`
- Google: Search "Real Madrid"

### Implementation
Add a "📅 Subscribe" button to each team card that opens a menu:
- Subscribe via Google Calendar (deep link)
- Download iCal file
- Copy calendar URL

##2. Better News (5 per team)

Run this command to fetch fresh news:
```bash
# I'll create a single script that does all 6 teams
python3 scripts/update_all_news.py
```

This will:
- Search 5 sources per team
- Prioritize Canadian sources for Canadian teams
- Update cache with 5 articles each
- Takes ~2 minutes to run

## 3. Settings Page (Tomorrow)

Create `/settings` route with:
- Team selector (add/remove)
- News source toggles
- Display preferences
- Save to localStorage

---

**Let's start with calendars - want me to add the subscribe buttons now?**
