# Sports Hub – Dev Journal (Bliz)

_This is my living log for the project. Keep it updated as the app evolves so future sessions pick up instantly._

## Snapshot (2026-04-07)
- **Backend**: FastAPI deployed on Vercel at `https://sports-hub-sepia.vercel.app`
- **Frontend**: Mobile-first web dashboard + settings + league picker
- **Data**: Cached schedules + 5 news articles per team (Brave Search, WHL HockeyTech)
- **Auth**: Magic-link email login (Supabase). Anonymous users see empty-state CTA.

### Core Features Delivered
1. **Full API** – `/api/dashboard`, `/api/team/{name}`, `/api/team/fetch`, `/api/settings`, etc.
2. **Auto-refresh pipeline** – `scripts/all_sports.py` + cache writer
3. **News system** – 5 articles per team, Canadian bias for CA teams, Brave fallback
4. **Calendar integration** – 📅 button with iCal + Google + official schedule
5. **Settings UI** – Manage teams, reorder, auto-discovery stubs
6. **Add Team flow (2026-04-07)** – Auto-fetch schedule + news, cache locally, instant display
7. **Empty-state UX (2026-04-07)** – No more default teams; sign-in + temp teams path
8. **Logos (2026-04-07)** – Team/league logos across cards

### Pending / Next Focus
- Settings panel enhancements (news source toggles, reorder UI polish)
- Auto-discovery backend integration (HockeyTech + ESPN IDs wired through API)
- WHL logos (need source) + full league logo set
- Background cron to refresh news/schedules every 2h
- Native iOS app per `iOS-APP-PLAN.md`

### Tonight’s In-Progress Work (April 7)
- ✅ ESPN + RSS news layer shipping (live) — per-team API calls now refresh via ESPN + Oil Kings RSS.
- 🔄 Adding Canadian sources (TSN/Sportsnet/CBC): RSS endpoints are deprecated, so building HTML/JSON parsers instead. To do first thing: finish parser helpers, plug into `fetch_news.py`, redeploy, verify priority order (Canadian → league → ESPN).
- 🔄 Map additional team feeds (Marca/Goal for Real Madrid, 3DownNation/CFL for Elks once Canadian layer lands).
- Next check-in: resume parser implementation, integrate, then ping J with results.

### Key Files
- `api/main.py` – FastAPI app
- `data/cache/all_teams.json` – Master cache
- `scripts/fetch_news.py`, `scripts/fetch_whl_data.py`
- `web/index.html`, `web/settings.html`, `web/league-picker.html`
- `web/team-logos.js` – new logo DB
- Docs: `COMPLETED-UPDATES.md`, `FIXES-APPLIED.md`, `FIXES-PART-2.md`, `PART-2-COMPLETE.md`

### Maintenance Commands
```bash
# Refresh all sports + cache
cd projects/sports-hub && python3 scripts/run_refresh.py

# Update news for current teams
python3 - <<'PY'
import json
from scripts.fetch_news import fetch_news_for_teams
with open('data/cache/all_teams.json') as f:
    data = json.load(f)
teams = [{'name': n, 'league': t['league']} for n, t in data['teams'].items()]
news = fetch_news_for_teams(teams)
for name, articles in news.items():
    data['teams'][name]['news'] = articles
with open('data/cache/all_teams.json', 'w') as f:
    json.dump(data, f, indent=2)
PY

# Deploy
vercel --prod
```

### Reminders for Future Me
- Keep this journal current after each major change.
- When adding new leagues/teams, update `team-logos.js` + `team-metadata.js` together.
- Record unresolved issues / ideas here so nothing gets lost.
- If Brave API key expires, news falls back to placeholders — monitor logs.
- WHL API uses HockeyTech `team_id` (209 for Oil Kings); scripts expect IDs as strings.

_Updated: 2026-04-07 by Bliz_