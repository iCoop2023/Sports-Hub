# Universal Team Support - Implementation Plan

## Current Issue
The app only has a database of major leagues (NHL, MLB, NBA, NFL, Premier League, etc.), but you want to add teams from ANY league like:
- CFL (Edmonton Elks)
- CEBL (Edmonton Stingers)  
- MLS, PWHL, USL, etc.

## Solution: Universal Team Add

### Phase 1: Update Settings UI (Now)
Make the "Add Team" function accept ANY team name + league:

```javascript
function addTeam() {
    const teamName = prompt('Enter team name:\n\nExamples:\n- Edmonton Elks (CFL)\n- Edmonton Stingers (CEBL)\n- Any team from any league!');
    if (!teamName) return;

    const league = prompt('Enter league:\n\nExamples:\n- CFL\n- CEBL\n- MLS\n- PWHL\n- Anything!');
    if (!league) return;

    // Add to settings
    const settings = JSON.parse(localStorage.getItem('sportsHubSettings') || '{}');
    const teams = settings.teams || DEFAULT_TEAMS;
    teams.push({ name: teamName, league: league, custom: true });
    settings.teams = teams;
    localStorage.setItem('sportsHubSettings', JSON.stringify(settings));
    renderTeams(teams);
}
```

### Phase 2: Backend Auto-Discovery (Next)
When a custom team is added, the backend should:

1. **Try ESPN API first** - They cover CFL, MLS, many leagues
   - `https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/teams`
   
2. **Try official league APIs**
   - CFL: `https://www.cfl.ca/api/` (if available)
   - CEBL: Check their website for API
   - MLS: ESPN has this
   
3. **Fallback to web scraping** league sites for schedule

4. **Manual mapping table** for common requests:
   ```json
   {
     "Edmonton Elks": { "espn_id": "...", "sport": "football", "league": "cfl" },
     "Edmonton Stingers": { "cebl_id": "...", "league": "cebl" }
   }
   ```

### Phase 3: Smart Search
When you type "Edmonton Elks", the app should:
1. Search ESPN for "Edmonton Elks"
2. Find CFL team automatically
3. Add with correct ESPN IDs

## Quick Fix for Tonight

Update the `addTeam()` function in settings.html to accept ANY input:
- Remove validation
- Let user type anything
- Mark as "custom" team
- Backend will try to find data later

Then you can add:
- Edmonton Elks (CFL)
- Edmonton Stingers (CEBL)
- Vancouver Whitecaps (MLS)
- Whatever you want!

The app will show the team card, and we'll work on data fetching next.

---

**Want me to:**
1. Deploy the quick fix now (universal team adding)?
2. Or build the ESPN auto-discovery system first?
