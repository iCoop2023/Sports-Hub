// Universal team adding - works for ANY league
// Override the addTeam function to accept any team from any league

function addTeamUniversal() {
    const teamName = prompt(
        'Enter team name:\\n\\n' +
        'Examples:\\n' +
        '- Edmonton Elks\\n' +
        '- Edmonton Stingers\\n' +
        '- Vancouver Whitecaps\\n' +
        '- Any team from any league!'
    );
    
    if (!teamName || teamName.trim() === '') return;

    const league = prompt(
        'Enter league:\\n\\n' +
        'Examples:\\n' +
        '- CFL\\n' +
        '- CEBL\\n' +
        '- MLS\\n' +
        '- PWHL\\n' +
        '- Or any league!'
    );
    
    if (!league || league.trim() === '') return;

    const settings = JSON.parse(localStorage.getItem('sportsHubSettings') || '{}');
    const teams = settings.teams || [
        { name: "Edmonton Oilers", league: "NHL" },
        { name: "Pittsburgh Penguins", league: "NHL" },
        { name: "Toronto Blue Jays", league: "MLB" },
        { name: "Kansas City Chiefs", league: "NFL" },
        { name: "Toronto Raptors", league: "NBA" },
        { name: "Real Madrid", league: "La Liga" }
    ];
    
    // Check if team already exists
    if (teams.some(t => t.name.toLowerCase() === teamName.toLowerCase())) {
        alert(teamName + ' is already in your list!');
        return;
    }
    
    // Add the new team
    teams.push({
        name: teamName.trim(),
        league: league.trim(),
        custom: true  // Mark as custom so backend knows to search for it
    });
    
    settings.teams = teams;
    localStorage.setItem('sportsHubSettings', JSON.stringify(settings));
    
    // Reload the team list
    if (typeof renderTeams === 'function') {
        renderTeams(teams);
    }
    
    // Fetch data for the new team in background
    fetchTeamData(teamName.trim());
    
    // Silently return - no alert popup
}

// Fetch team data from backend and store locally
async function fetchTeamData(teamName) {
    const API_BASE = window.API_BASE || 'https://sports-hub-sepia.vercel.app';
    
    try {
        const response = await fetch(`${API_BASE}/api/team/fetch?team_name=${encodeURIComponent(teamName)}`, {
            method: 'POST'
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✓ Fetched ${data.games_found} games and ${data.news_found} articles for ${teamName}`);
            
            // Store team data in localStorage temporarily
            const teamCache = JSON.parse(localStorage.getItem('teamCache') || '{}');
            teamCache[teamName] = {
                league: data.league,
                games: data.games || [],
                news: data.news || [],
                fetched_at: new Date().toISOString()
            };
            localStorage.setItem('teamCache', JSON.stringify(teamCache));
            console.log(`✓ Cached ${teamName} with ${(data.news || []).length} news articles`);
            
            // Force dashboard reload if on dashboard page
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                if (typeof loadDashboard === 'function') {
                    setTimeout(() => loadDashboard(), 500);
                }
            }
        } else {
            console.warn(`Could not fetch data for ${teamName}`);
        }
    } catch (error) {
        console.error('Team fetch error:', error);
    }
}

// Replace the existing addTeam function if it exists
if (typeof window !== 'undefined') {
    window.addTeam = addTeamUniversal;
    window.fetchTeamData = fetchTeamData;
}
