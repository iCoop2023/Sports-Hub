# Next Steps: Deploy the API Backend

## What We Built

✅ **FastAPI Backend** (`api/main.py`)
- Complete REST API with all endpoints needed for iOS app
- JSON responses with proper data models
- CORS enabled for cross-origin requests
- Dashboard image endpoint
- Team detail views with stats

✅ **Modern Dashboard Design**
- iOS-style dark theme
- Card-based layout
- Color-coded results (green W, red L)
- News integration
- Ready for app development

## Immediate Next Steps

### 1. Install FastAPI Dependencies

You need to install the API server dependencies. Choose one method:

**Option A: System packages** (if available on Linux Mint)
```bash
sudo apt install python3-fastapi python3-uvicorn python3-pydantic
```

**Option B: User install** (might conflict with system)
```bash
pip3 install --user fastapi uvicorn pydantic
```

**Option C: Virtual environment** (cleanest, requires python3-venv)
```bash
sudo apt install python3.12-venv
cd /home/ja/.openclaw/workspace/projects/sports-hub
python3 -m venv venv
source venv/bin/activate
pip install -r api/requirements.txt
```

### 2. Test the API Locally

```bash
# Start server
cd /home/ja/.openclaw/workspace/projects/sports-hub
python3 api/main.py

# In another terminal, test:
curl http://localhost:8000/
curl http://localhost:8000/api/teams
curl http://localhost:8000/api/dashboard | python3 -m json.tool
```

Visit http://localhost:8000/docs for interactive API documentation.

### 3. Deploy to Production

Once the API works locally, deploy it so the iOS app can access it from anywhere.

**Recommended: Vercel** (easiest)
```bash
npm install -g vercel
cd /home/ja/.openclaw/workspace/projects/sports-hub
vercel
# Follow prompts, select "Python" runtime
# Your API will be live at https://sports-hub-xxx.vercel.app
```

**Alternative: Railway**
```bash
npm install -g @railway/cli
cd /home/ja/.openclaw/workspace/projects/sports-hub
railway init
railway up
```

**Or: Run on your existing server**
```bash
# Install nginx
sudo apt install nginx

# Setup systemd service for FastAPI
sudo nano /etc/systemd/system/sports-hub-api.service

# Add:
[Unit]
Description=Sports Hub API
After=network.target

[Service]
User=ja
WorkingDirectory=/home/ja/.openclaw/workspace/projects/sports-hub
ExecStart=/usr/bin/python3 api/main.py
Restart=always

[Install]
WantedBy=multi-user.target

# Enable and start
sudo systemctl enable sports-hub-api
sudo systemctl start sports-hub-api

# Configure nginx reverse proxy on port 80/443
```

### 4. Build the iOS App

Once the API is deployed and you have a URL (e.g., `https://sports-hub.vercel.app`):

**Option A: Start with Xcode**
1. Open Xcode
2. Create new SwiftUI App project
3. Name it "Sports Hub"
4. Follow the structure in `iOS-APP-PLAN.md`
5. Point API calls to your deployed backend

**Option B: I can generate the SwiftUI code**
- I can create the complete SwiftUI project structure
- Models, Views, ViewModels, API Service
- You'd just need to open it in Xcode and build

### 5. Data Refresh Automation

Set up a cron job to keep data fresh:

```bash
crontab -e

# Add: Refresh every 2 hours
0 */2 * * * cd /home/ja/.openclaw/workspace/projects/sports-hub/scripts && python3 all_sports.py
```

Or use OpenClaw cron:
```python
# Ask me to: "Create a cron job to refresh sports data every 2 hours"
```

## Quick Wins

Before tackling iOS development, you can:

1. **Test the API** - Make sure all endpoints work
2. **Deploy to Vercel** - Get a public URL in 5 minutes
3. **Add more teams** - Edit `config/teams.json`
4. **Improve news** - Better web scraping for headlines
5. **Add live scores** - Poll APIs during active games

## Questions to Answer

1. **Where do you want to deploy?**
   - Cloud (Vercel/Railway) - easiest
   - Self-hosted - more control, requires server config

2. **iOS development experience?**
   - Never done it - I'll generate complete project
   - Some Swift - I'll provide guidance + code snippets
   - Experienced - Just need the API, you've got the rest

3. **Timeline?**
   - Weekend project - Focus on Vercel + basic SwiftUI
   - 1-2 weeks - Full featured app with polish
   - Long-term - Add widgets, Watch app, notifications

---

**Ready to continue?** Let me know:
- If you want help installing FastAPI
- If you want to deploy to Vercel now
- If you want me to generate the SwiftUI project
