// Team and League Logo URLs Database

const TEAM_LOGO_URLS = {
    // NHL Teams
    "Edmonton Oilers": "https://assets.nhle.com/logos/nhl/svg/EDM_dark.svg",
    "Pittsburgh Penguins": "https://assets.nhle.com/logos/nhl/svg/PIT_dark.svg",
    "Calgary Flames": "https://assets.nhle.com/logos/nhl/svg/CGY_dark.svg",
    "Vancouver Canucks": "https://assets.nhle.com/logos/nhl/svg/VAN_dark.svg",
    "Toronto Maple Leafs": "https://assets.nhle.com/logos/nhl/svg/TOR_dark.svg",
    "Montreal Canadiens": "https://assets.nhle.com/logos/nhl/svg/MTL_dark.svg",
    "Ottawa Senators": "https://assets.nhle.com/logos/nhl/svg/OTT_dark.svg",
    "Winnipeg Jets": "https://assets.nhle.com/logos/nhl/svg/WPG_dark.svg",
    
    // MLB Teams (ESPN)
    "Toronto Blue Jays": "https://a.espncdn.com/i/teamlogos/mlb/500/tor.png",
    "New York Yankees": "https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png",
    "Boston Red Sox": "https://a.espncdn.com/i/teamlogos/mlb/500/bos.png",
    "Los Angeles Dodgers": "https://a.espncdn.com/i/teamlogos/mlb/500/lad.png",
    
    // NBA Teams (ESPN)
    "Toronto Raptors": "https://a.espncdn.com/i/teamlogos/nba/500/tor.png",
    "Los Angeles Lakers": "https://a.espncdn.com/i/teamlogos/nba/500/lal.png",
    "Golden State Warriors": "https://a.espncdn.com/i/teamlogos/nba/500/gs.png",
    "Boston Celtics": "https://a.espncdn.com/i/teamlogos/nba/500/bos.png",
    
    // NFL Teams (ESPN)
    "Kansas City Chiefs": "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png",
    "Buffalo Bills": "https://a.espncdn.com/i/teamlogos/nfl/500/buf.png",
    "San Francisco 49ers": "https://a.espncdn.com/i/teamlogos/nfl/500/sf.png",
    "Dallas Cowboys": "https://a.espncdn.com/i/teamlogos/nfl/500/dal.png",
    
    // Soccer Teams (ESPN)
    "Real Madrid": "https://a.espncdn.com/i/teamlogos/soccer/500/86.png",
    "Barcelona": "https://a.espncdn.com/i/teamlogos/soccer/500/83.png",
    "Manchester United": "https://a.espncdn.com/i/teamlogos/soccer/500/360.png",
    "Liverpool": "https://a.espncdn.com/i/teamlogos/soccer/500/364.png",
    
    // CFL Teams
    "Edmonton Elks": "https://www.cfl.ca/wp-content/uploads/2021/06/EDM_2021.png",
    "Calgary Stampeders": "https://www.cfl.ca/wp-content/uploads/2021/06/CGY_2021.png",
    "Saskatchewan Roughriders": "https://www.cfl.ca/wp-content/uploads/2021/06/SSK_2021.png",
    "Winnipeg Blue Bombers": "https://www.cfl.ca/wp-content/uploads/2021/06/WPG_2021.png",
    
    // WHL Teams - Use team colors as fallback
    "Edmonton Oil Kings": null,
    "Calgary Hitmen": null,
    "Red Deer Rebels": null
};

const LEAGUE_LOGOS = {
    "NHL": "🏒",
    "MLB": "⚾",
    "NBA": "🏀",
    "NFL": "🏈",
    "La Liga": "⚽",
    "Premier League": "⚽",
    "Bundesliga": "⚽",
    "Serie A": "⚽",
    "Ligue 1": "⚽",
    "MLS": "⚽",
    "CFL": "🏈",
    "CEBL": "🏀",
    "WHL": "🏒",
    "OHL": "🏒",
    "QMJHL": "🏒"
};

// Fallback colors for teams without logos
const TEAM_COLORS = {
    "Edmonton Oil Kings": "#003087",
    "Calgary Hitmen": "#C8102E",
    "Red Deer Rebels": "#CE1126"
};

function getTeamLogo(teamName) {
    return TEAM_LOGO_URLS[teamName] || null;
}

function getLeagueLogo(leagueName) {
    return LEAGUE_LOGOS[leagueName] || "🏟️";
}

function getTeamColor(teamName) {
    return TEAM_COLORS[teamName] || "#0a84ff";
}
