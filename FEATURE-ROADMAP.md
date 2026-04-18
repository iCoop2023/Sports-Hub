# Feature Roadmap - Sports Hub

## Requested Features

### ✅ Phase 1: Core Infrastructure (DONE)
- [x] API backend with FastAPI
- [x] Mobile-responsive web app
- [x] Basic team cards with games
- [x] Deployed to Vercel

### 🔨 Phase 2: Enhanced News (IN PROGRESS)
- [ ] 5 news stories per team (currently 1-2)
- [ ] Multi-source news aggregation
- [ ] Canadian news source priority (TSN, Sportsnet, CBC)
- [ ] News source filtering/preferences
- [ ] Link to full articles

**Implementation:**
1. Create settings API endpoints (`GET/POST /api/settings`)
2. Build news aggregation script with source diversity
3. Add settings UI page to web app
4. Update team cards to show 5 news items

### 📅 Phase 3: Calendar Integration
- [ ] Generate iCal feeds per team
- [ ] Subscribe links for calendar apps
- [ ] Google Calendar integration option
- [ ] Sync with official league calendars

**Implementation:**
1. Create iCal generator (`/api/calendar/{team}`)
2. Find official calendar URLs (NHL, MLB, NBA, NFL)
3. Add "Subscribe to Calendar" button on each team card
4. Test with iOS Calendar, Google Calendar, Outlook

### ⚙️ Phase 4: Team Management
- [ ] Add/remove teams UI
- [ ] Team search/autocomplete
- [ ] Drag-to-reorder teams
- [ ] Save preferences per user

**Implementation:**
1. Settings page with team selector
2. Persist settings to localStorage (web) or user account
3. Update API to filter teams based on user settings
4. Add team logos/icons

### 🎨 Phase 5: Settings Panel
- [ ] News source toggles
- [ ] Theme selection (dark/light/auto)
- [ ] Notification preferences
- [ ] Display density options

**Implementation:**
1. Create `/settings` page in web app
2. Toggle switches for each news source
3. Save to API or localStorage
4. Apply filters in real-time

## Priority Order

**This Week:**
1. ✅ Settings data structure + API
2. News aggregation (5 per team, multi-source)
3. Settings UI page
4. Calendar feed generation

**Next Week:**
1. Team add/remove UI
2. Polish settings page
3. Add team logos
4. Improve news display (expandable, links)

**Future:**
1. Push notifications
2. Live score updates
3. iOS native app
4. User accounts
5. Social features

## Technical Notes

### News Sources Priority
**Canadian Teams** (Oilers, Blue Jays, Raptors):
- TSN.ca (primary)
- Sportsnet.ca (primary)
- CBC Sports
- The Hockey News
- ESPN (secondary)
- League sites (NHL.com, MLB.com)

**US Teams** (Penguins, Chiefs):
- ESPN (primary)
- League sites
- The Athletic
- SI.com
- Local beat reporters

**International** (Real Madrid):
- Marca.com (primary)
- Goal.com
- BBC Sport
- ESPN FC

### Calendar Sources
- **NHL**: https://www.nhl.com/oilers/schedule (has iCal export)
- **MLB**: https://www.mlb.com/bluejays/schedule (has iCal)
- **NBA**: https://www.nba.com/raptors/schedule (has iCal)
- **NFL**: https://www.nfl.com/teams/kansas-city-chiefs/schedule (has iCal)
- **La Liga**: ESPN or official site

### Settings Storage
**Option A**: localStorage (current)
- ✅ Simple, no backend needed
- ❌ Per-device only
- ❌ Lost if user clears browser

**Option B**: API + database
- ✅ Sync across devices
- ✅ Persistent
- ❌ Requires user accounts
- ❌ More complex

**Decision**: Start with localStorage, add sync later

---

## Next Steps

**Immediate (Tonight):**
1. Finish news aggregation with 5 sources
2. Update cache with better news
3. Redeploy
4. Test on phone

**Tomorrow:**
1. Build settings UI
2. Add calendar endpoints
3. Test calendar subscriptions

Let me know which feature you want to tackle first!
