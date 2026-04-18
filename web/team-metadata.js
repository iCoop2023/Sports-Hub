// Complete team metadata with locations and data sources
// This enables auto-discovery of news sources and schedule APIs

const TEAM_METADATA = {
    // NHL
    "Edmonton Oilers": {
        city: "Edmonton", region: "Alberta", country: "Canada",
        espn_id: "22", nhl_code: "EDM"
    },
    "Calgary Flames": {
        city: "Calgary", region: "Alberta", country: "Canada",
        espn_id: "20", nhl_code: "CGY"
    },
    "Toronto Maple Leafs": {
        city: "Toronto", region: "Ontario", country: "Canada",
        espn_id: "10", nhl_code: "TOR"
    },
    "Vancouver Canucks": {
        city: "Vancouver", region: "British Columbia", country: "Canada",
        espn_id: "23", nhl_code: "VAN"
    },
    "Pittsburgh Penguins": {
        city: "Pittsburgh", region: "Pennsylvania", country: "USA",
        espn_id: "5", nhl_code: "PIT"
    },
    
    // MLB
    "Toronto Blue Jays": {
        city: "Toronto", region: "Ontario", country: "Canada",
        espn_id: "14", mlb_code: "TOR"
    },
    
    // NFL
    "Kansas City Chiefs": {
        city: "Kansas City", region: "Missouri", country: "USA",
        espn_id: "12", nfl_code: "KC"
    },
    
    // NBA
    "Toronto Raptors": {
        city: "Toronto", region: "Ontario", country: "Canada",
        espn_id: "28", nba_code: "TOR"
    },
    
    // CFL
    "Edmonton Elks": {
        city: "Edmonton", region: "Alberta", country: "Canada",
        espn_id: null, cfl_code: "EDM"
    },
    "Calgary Stampeders": {
        city: "Calgary", region: "Alberta", country: "Canada",
        cfl_code: "CGY"
    },
    "BC Lions": {
        city: "Vancouver", region: "British Columbia", country: "Canada",
        cfl_code: "BC"
    },
    "Saskatchewan Roughriders": {
        city: "Regina", region: "Saskatchewan", country: "Canada",
        cfl_code: "SSK"
    },
    "Winnipeg Blue Bombers": {
        city: "Winnipeg", region: "Manitoba", country: "Canada",
        cfl_code: "WPG"
    },
    "Hamilton Tiger-Cats": {
        city: "Hamilton", region: "Ontario", country: "Canada",
        cfl_code: "HAM"
    },
    "Toronto Argonauts": {
        city: "Toronto", region: "Ontario", country: "Canada",
        cfl_code: "TOR"
    },
    "Ottawa Redblacks": {
        city: "Ottawa", region: "Ontario", country: "Canada",
        cfl_code: "OTT"
    },
    "Montreal Alouettes": {
        city: "Montreal", region: "Quebec", country: "Canada",
        cfl_code: "MTL"
    },
    
    // WHL
    "Edmonton Oil Kings": {
        city: "Edmonton", region: "Alberta", country: "Canada",
        whl_id: "20", hockeytech_league: "whl"
    },
    "Calgary Hitmen": {
        city: "Calgary", region: "Alberta", country: "Canada",
        whl_id: "2", hockeytech_league: "whl"
    },
    "Red Deer Rebels": {
        city: "Red Deer", region: "Alberta", country: "Canada",
        whl_id: "14", hockeytech_league: "whl"
    },
    "Lethbridge Hurricanes": {
        city: "Lethbridge", region: "Alberta", country: "Canada",
        whl_id: "8", hockeytech_league: "whl"
    },
    "Medicine Hat Tigers": {
        city: "Medicine Hat", region: "Alberta", country: "Canada",
        whl_id: "9", hockeytech_league: "whl"
    },
    
    // CEBL
    "Edmonton Stingers": {
        city: "Edmonton", region: "Alberta", country: "Canada",
        cebl_id: "edmonton"
    },
    "Calgary Surge": {
        city: "Calgary", region: "Alberta", country: "Canada",
        cebl_id: "calgary"
    },
    "Saskatchewan Rattlers": {
        city: "Saskatchewan", region: "Saskatchewan", country: "Canada",
        cebl_id: "saskatchewan"
    },
    "Winnipeg Sea Bears": {
        city: "Winnipeg", region: "Manitoba", country: "Canada",
        cebl_id: "winnipeg"
    },
    "Scarborough Shooting Stars": {
        city: "Toronto", region: "Ontario", country: "Canada",
        cebl_id: "scarborough"
    },
    "Brampton Honey Badgers": {
        city: "Brampton", region: "Ontario", country: "Canada",
        cebl_id: "brampton"
    },
    "Montreal Alliance": {
        city: "Montreal", region: "Quebec", country: "Canada",
        cebl_id: "montreal"
    },
    "Ottawa BlackJacks": {
        city: "Ottawa", region: "Ontario", country: "Canada",
        cebl_id: "ottawa"
    },
    "Vancouver Bandits": {
        city: "Vancouver", region: "British Columbia", country: "Canada",
        cebl_id: "vancouver"
    },
    "Niagara River Lions": {
        city: "St. Catharines", region: "Ontario", country: "Canada",
        cebl_id: "niagara"
    },
    
    // La Liga
    "Real Madrid": {
        city: "Madrid", region: "Madrid", country: "Spain",
        espn_id: "86"
    },
    "Barcelona": {
        city: "Barcelona", region: "Catalonia", country: "Spain",
        espn_id: "83"
    }
};

// Local news sources by city
const LOCAL_NEWS_SOURCES = {
    "Edmonton": [
        { name: "Edmonton Journal", domain: "edmontonjournal.com", priority: 1 },
        { name: "CBC Edmonton", domain: "cbc.ca/news/canada/edmonton", priority: 1 },
        { name: "Global Edmonton", domain: "globalnews.ca/edmonton", priority: 2 }
    ],
    "Calgary": [
        { name: "Calgary Herald", domain: "calgaryherald.com", priority: 1 },
        { name: "CBC Calgary", domain: "cbc.ca/news/canada/calgary", priority: 1 },
        { name: "Global Calgary", domain: "globalnews.ca/calgary", priority: 2 }
    ],
    "Toronto": [
        { name: "Toronto Star", domain: "thestar.com", priority: 1 },
        { name: "CBC Toronto", domain: "cbc.ca/news/canada/toronto", priority: 1 },
        { name: "Toronto Sun", domain: "torontosun.com", priority: 2 }
    ],
    "Vancouver": [
        { name: "Vancouver Sun", domain: "vancouversun.com", priority: 1 },
        { name: "CBC Vancouver", domain: "cbc.ca/news/canada/british-columbia", priority: 1 },
        { name: "Global BC", domain: "globalnews.ca/bc", priority: 2 }
    ],
    "Montreal": [
        { name: "Montreal Gazette", domain: "montrealgazette.com", priority: 1 },
        { name: "CBC Montreal", domain: "cbc.ca/news/canada/montreal", priority: 1 },
        { name: "La Presse", domain: "lapresse.ca", priority: 2 }
    ],
    "Ottawa": [
        { name: "Ottawa Citizen", domain: "ottawacitizen.com", priority: 1 },
        { name: "CBC Ottawa", domain: "cbc.ca/news/canada/ottawa", priority: 1 }
    ],
    "Winnipeg": [
        { name: "Winnipeg Free Press", domain: "winnipegfreepress.com", priority: 1 },
        { name: "CBC Manitoba", domain: "cbc.ca/news/canada/manitoba", priority: 1 }
    ],
    "Pittsburgh": [
        { name: "Pittsburgh Post-Gazette", domain: "post-gazette.com", priority: 1 },
        { name: "Tribune-Review", domain: "triblive.com", priority: 2 }
    ],
    "Kansas City": [
        { name: "Kansas City Star", domain: "kansascity.com", priority: 1 }
    ]
};

// National news sources by country
const NATIONAL_NEWS_SOURCES = {
    "Canada": [
        { name: "TSN", domain: "tsn.ca", priority: 1 },
        { name: "Sportsnet", domain: "sportsnet.ca", priority: 1 },
        { name: "CBC Sports", domain: "cbc.ca/sports", priority: 2 },
        { name: "The Hockey News", domain: "thehockeynews.com", priority: 3 }
    ],
    "USA": [
        { name: "ESPN", domain: "espn.com", priority: 1 },
        { name: "Sports Illustrated", domain: "si.com", priority: 2 },
        { name: "The Athletic", domain: "theathletic.com", priority: 2 }
    ],
    "Spain": [
        { name: "Marca", domain: "marca.com", priority: 1 },
        { name: "AS", domain: "as.com", priority: 1 },
        { name: "Mundo Deportivo", domain: "mundodeportivo.com", priority: 2 }
    ]
};

// League-specific news sources
const LEAGUE_NEWS_SOURCES = {
    "WHL": [
        { name: "WHL.ca", domain: "whl.ca", priority: 1 },
        { name: "CHL.ca", domain: "chl.ca", priority: 2 }
    ],
    "OHL": [
        { name: "OHL.ca", domain: "ohl.ca", priority: 1 },
        { name: "CHL.ca", domain: "chl.ca", priority: 2 }
    ],
    "QMJHL": [
        { name: "QMJHL.ca", domain: "qmjhl.ca", priority: 1 },
        { name: "CHL.ca", domain: "chl.ca", priority: 2 }
    ],
    "CFL": [
        { name: "CFL.ca", domain: "cfl.ca", priority: 1 },
        { name: "3DownNation", domain: "3downnation.com", priority: 1 }
    ],
    "CEBL": [
        { name: "CEBL.ca", domain: "cebl.ca", priority: 1 }
    ],
    "MLS": [
        { name: "MLS Soccer", domain: "mlssoccer.com", priority: 1 }
    ]
};

// Get all relevant news sources for a team
function getNewsSourcesForTeam(teamName) {
    const metadata = TEAM_METADATA[teamName];
    if (!metadata) return [];
    
    const sources = [];
    
    // Add local city sources
    if (metadata.city && LOCAL_NEWS_SOURCES[metadata.city]) {
        sources.push(...LOCAL_NEWS_SOURCES[metadata.city]);
    }
    
    // Add national sources
    if (metadata.country && NATIONAL_NEWS_SOURCES[metadata.country]) {
        sources.push(...NATIONAL_NEWS_SOURCES[metadata.country]);
    }
    
    // Add league-specific sources  
    // Infer league from metadata keys
    const league = Object.keys(metadata).find(key => 
        ['whl_id', 'ohl_id', 'qmjhl_id', 'cfl_code', 'cebl_id', 'mls_id'].includes(key)
    );
    
    if (league) {
        const leagueName = league.split('_')[0].toUpperCase();
        if (LEAGUE_NEWS_SOURCES[leagueName]) {
            sources.push(...LEAGUE_NEWS_SOURCES[leagueName]);
        }
    }
    
    // Remove duplicates
    const seen = new Set();
    return sources.filter(source => {
        if (seen.has(source.domain)) return false;
        seen.add(source.domain);
        return true;
    });
}

// Get team metadata
function getTeamMetadata(teamName) {
    return TEAM_METADATA[teamName] || null;
}
