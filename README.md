# Sports Hub

Personal sports dashboard for tracking favorite teams across multiple leagues.

## Features

- 🏒 NHL: Edmonton Oilers, Pittsburgh Penguins
- ⚾ MLB: Toronto Blue Jays
- 🏈 NFL: Kansas City Chiefs
- 🏀 NBA: Toronto Raptors
- ⚽ La Liga: Real Madrid

## Components

### Backend API (`/api`)
FastAPI server that provides JSON endpoints for the iOS app.

**Endpoints:**
- `GET /api/dashboard` - All teams, games, and news
- `GET /api/teams` - List of teams
- `GET /api/team/{name}` - Detailed team info
- `GET /api/dashboard/image` - Dashboard PNG

**Start server:**
```bash
cd api
pip install -r requirements.txt  # or use system python3-fastapi
python3 main.py
```

Server runs on http://localhost:8000
API docs: http://localhost:8000/docs

### Data Scripts (`/scripts`)
- `all_sports.py` - Fetch game data from NHL/ESPN APIs
- `fetch_news.py` - Get latest team news

### Cache (`/data/cache`)
- `all_teams.json` - Cached game and news data

## Development

### Update Data
```bash
cd scripts
python3 all_sports.py
```

### Generate Dashboard Image
```bash
python3 << 'EOF'
# See sports_dashboard.png generation script in git history
EOF
```

### Test API
```bash
# Start server
cd api && python3 main.py

# Test endpoints
curl http://localhost:8000/api/teams
curl http://localhost:8000/api/dashboard
curl http://localhost:8000/api/team/Edmonton%20Oilers
```

## iOS App (Coming Soon)

See `iOS-APP-PLAN.md` for the mobile app roadmap.

## Deployment

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd sports-hub
vercel
```

### Option 2: Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway init
railway up
```

### Option 3: Self-hosted
Run the FastAPI server on your existing infrastructure with systemd or Docker.

## Configuration

Edit `config/teams.json` to add/remove teams:
```json
{
  "nhl": [
    {"name": "Edmonton Oilers", "abbrev": "EDM"}
  ],
  "mlb": [
    {"name": "Toronto Blue Jays", "abbrev": "TOR"}
  ]
}
```

## Tech Stack

- **Backend**: Python 3.12, FastAPI
- **Data Sources**: NHL API, ESPN API, Brave Search (news)
- **Image Generation**: Pillow (PIL)
- **Future iOS App**: SwiftUI

---

Built with OpenClaw 🐾
