# Deployment Instructions

## Deploy to Vercel (5 minutes)

### Step 1: Login to Vercel
```bash
cd /home/ja/.openclaw/workspace/projects/sports-hub
vercel login
```

This will:
1. Open your browser
2. Ask you to sign in with GitHub/GitLab/Email
3. Verify your identity

### Step 2: Deploy
```bash
vercel
```

Answer the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your username
- **Link to existing project?** → No
- **Project name?** → sports-hub (or whatever you want)
- **Directory?** → . (current directory)
- **Override settings?** → No

Vercel will:
1. Upload your code
2. Build the API
3. Give you a live URL like: `https://sports-hub-abc123.vercel.app`

### Step 3: Test It
Once deployed, test from your phone's browser:

```
https://your-url.vercel.app/
https://your-url.vercel.app/api/teams
https://your-url.vercel.app/api/dashboard
https://your-url.vercel.app/api/dashboard/image
```

### Troubleshooting

**If Vercel build fails:**
The issue might be missing the cache file on first deploy. You have two options:

**Option A: Include cache in repo**
```bash
git add data/cache/all_teams.json
git commit -m "Add cache data"
vercel
```

**Option B: Add environment variable**
Edit the Vercel project settings and add a build command that generates the cache.

---

## Ready?

Run this command now:
```bash
cd /home/ja/.openclaw/workspace/projects/sports-hub
vercel login
```

Then after login:
```bash
vercel
```

The URL you get will work on your phone immediately! 📱
