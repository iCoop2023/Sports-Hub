// Complete team database for all major leagues

const TEAM_DATABASE = {
    "NHL": [
        "Anaheim Ducks", "Arizona Coyotes", "Boston Bruins", "Buffalo Sabres",
        "Calgary Flames", "Carolina Hurricanes", "Chicago Blackhawks", 
        "Colorado Avalanche", "Columbus Blue Jackets", "Dallas Stars",
        "Detroit Red Wings", "Edmonton Oilers", "Florida Panthers",
        "Los Angeles Kings", "Minnesota Wild", "Montreal Canadiens",
        "Nashville Predators", "New Jersey Devils", "New York Islanders",
        "New York Rangers", "Ottawa Senators", "Philadelphia Flyers",
        "Pittsburgh Penguins", "San Jose Sharks", "Seattle Kraken",
        "St. Louis Blues", "Tampa Bay Lightning", "Toronto Maple Leafs",
        "Vancouver Canucks", "Vegas Golden Knights", "Washington Capitals",
        "Winnipeg Jets"
    ],
    "MLB": [
        "Arizona Diamondbacks", "Atlanta Braves", "Baltimore Orioles",
        "Boston Red Sox", "Chicago Cubs", "Chicago White Sox",
        "Cincinnati Reds", "Cleveland Guardians", "Colorado Rockies",
        "Detroit Tigers", "Houston Astros", "Kansas City Royals",
        "Los Angeles Angels", "Los Angeles Dodgers", "Miami Marlins",
        "Milwaukee Brewers", "Minnesota Twins", "New York Mets",
        "New York Yankees", "Oakland Athletics", "Philadelphia Phillies",
        "Pittsburgh Pirates", "San Diego Padres", "San Francisco Giants",
        "Seattle Mariners", "St. Louis Cardinals", "Tampa Bay Rays",
        "Texas Rangers", "Toronto Blue Jays", "Washington Nationals"
    ],
    "NFL": [
        "Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens",
        "Buffalo Bills", "Carolina Panthers", "Chicago Bears",
        "Cincinnati Bengals", "Cleveland Browns", "Dallas Cowboys",
        "Denver Broncos", "Detroit Lions", "Green Bay Packers",
        "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars",
        "Kansas City Chiefs", "Las Vegas Raiders", "Los Angeles Chargers",
        "Los Angeles Rams", "Miami Dolphins", "Minnesota Vikings",
        "New England Patriots", "New Orleans Saints", "New York Giants",
        "New York Jets", "Philadelphia Eagles", "Pittsburgh Steelers",
        "San Francisco 49ers", "Seattle Seahawks", "Tampa Bay Buccaneers",
        "Tennessee Titans", "Washington Commanders"
    ],
    "NBA": [
        "Atlanta Hawks", "Boston Celtics", "Brooklyn Nets",
        "Charlotte Hornets", "Chicago Bulls", "Cleveland Cavaliers",
        "Dallas Mavericks", "Denver Nuggets", "Detroit Pistons",
        "Golden State Warriors", "Houston Rockets", "Indiana Pacers",
        "Los Angeles Clippers", "Los Angeles Lakers", "Memphis Grizzlies",
        "Miami Heat", "Milwaukee Bucks", "Minnesota Timberwolves",
        "New Orleans Pelicans", "New York Knicks", "Oklahoma City Thunder",
        "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns",
        "Portland Trail Blazers", "Sacramento Kings", "San Antonio Spurs",
        "Toronto Raptors", "Utah Jazz", "Washington Wizards"
    ],
    "La Liga": [
        "Real Madrid", "Barcelona", "Atletico Madrid", "Sevilla",
        "Real Betis", "Real Sociedad", "Villarreal", "Valencia",
        "Athletic Bilbao", "Girona", "Osasuna", "Celta Vigo",
        "Rayo Vallecano", "Mallorca", "Las Palmas", "Getafe",
        "Cadiz", "Alaves", "Granada", "Almeria"
    ],
    "Premier League": [
        "Arsenal", "Aston Villa", "Bournemouth", "Brentford",
        "Brighton", "Chelsea", "Crystal Palace", "Everton",
        "Fulham", "Liverpool", "Luton Town", "Manchester City",
        "Manchester United", "Newcastle United", "Nottingham Forest",
        "Sheffield United", "Tottenham Hotspur", "West Ham United",
        "Wolverhampton Wanderers", "Burnley"
    ],
    "Bundesliga": [
        "Bayern Munich", "Borussia Dortmund", "RB Leipzig", "Union Berlin",
        "Freiburg", "Bayer Leverkusen", "Eintracht Frankfurt", "Wolfsburg",
        "Mainz", "Borussia Monchengladbach", "FC Koln", "Hoffenheim",
        "Werder Bremen", "VfL Bochum", "Augsburg", "Stuttgart",
        "Heidenheim", "Darmstadt"
    ],
    "CFL": [
        "BC Lions", "Calgary Stampeders", "Edmonton Elks",
        "Saskatchewan Roughriders", "Winnipeg Blue Bombers",
        "Hamilton Tiger-Cats", "Toronto Argonauts",
        "Ottawa Redblacks", "Montreal Alouettes"
    ],
    "CEBL": [
        "Edmonton Stingers", "Calgary Surge", "Saskatchewan Rattlers",
        "Winnipeg Sea Bears", "Niagara River Lions",
        "Scarborough Shooting Stars", "Brampton Honey Badgers",
        "Montreal Alliance", "Ottawa BlackJacks", "Vancouver Bandits"
    ],
    "MLS": [
        "Atlanta United", "Austin FC", "Charlotte FC", "Chicago Fire",
        "Colorado Rapids", "Columbus Crew", "DC United", "FC Cincinnati",
        "Houston Dynamo", "Inter Miami", "LA Galaxy", "LAFC",
        "Minnesota United", "Montreal Impact", "Nashville SC",
        "New England Revolution", "New York City FC", "New York Red Bulls",
        "Orlando City", "Philadelphia Union", "Portland Timbers",
        "Real Salt Lake", "San Jose Earthquakes", "Seattle Sounders",
        "Sporting Kansas City", "St. Louis City", "Toronto FC",
        "Vancouver Whitecaps", "FC Dallas"
    ],
    "WHL": [
        "Brandon Wheat Kings", "Calgary Hitmen", "Edmonton Oil Kings",
        "Kamloops Blazers", "Kelowna Rockets", "Lethbridge Hurricanes",
        "Medicine Hat Tigers", "Moose Jaw Warriors", "Portland Winterhawks",
        "Prince Albert Raiders", "Prince George Cougars", "Red Deer Rebels",
        "Regina Pats", "Saskatoon Blades", "Seattle Thunderbirds",
        "Spokane Chiefs", "Swift Current Broncos", "Tri-City Americans",
        "Vancouver Giants", "Victoria Royals", "Wenatchee Wild", "Everett Silvertips"
    ],
    "OHL": [
        "Barrie Colts", "Brampton Steelheads", "Erie Otters", "Flint Firebirds",
        "Guelph Storm", "Hamilton Bulldogs", "Kingston Frontenacs",
        "Kitchener Rangers", "London Knights", "Mississauga Steelheads",
        "Niagara IceDogs", "North Bay Battalion", "Oshawa Generals",
        "Ottawa 67s", "Owen Sound Attack", "Peterborough Petes",
        "Saginaw Spirit", "Sarnia Sting", "Sault Ste. Marie Greyhounds",
        "Sudbury Wolves", "Windsor Spitfires"
    ],
    "QMJHL": [
        "Acadie-Bathurst Titan", "Baie-Comeau Drakkar", "Blainville-Boisbriand Armada",
        "Cape Breton Eagles", "Charlottetown Islanders", "Chicoutimi Sagueneens",
        "Drummondville Voltigeurs", "Gatineau Olympiques", "Halifax Mooseheads",
        "Moncton Wildcats", "Quebec Remparts", "Rimouski Oceanic",
        "Rouyn-Noranda Huskies", "Saint John Sea Dogs", "Shawinigan Cataractes",
        "Sherbrooke Phoenix", "Val-d'Or Foreurs", "Victoriaville Tigres"
    ],
    "BCHL": [
        "Cranbrook Bucks", "Cowichan Valley Capitals", "Nanaimo Clippers",
        "Powell River Kings", "Prince George Spruce Kings", "Surrey Eagles",
        "Trail Smoke Eaters", "Vernon Vipers", "Victoria Grizzlies",
        "West Kelowna Warriors", "Wenatchee Wild", "Penticton Vees",
        "Salmon Arm Silverbacks", "Merritt Centennials", "Chilliwack Chiefs",
        "Langley Rivermen", "Alberni Valley Bulldogs", "Coquitlam Express"
    ]
};

function getAllTeams() {
    const allTeams = [];
    for (const [league, teams] of Object.entries(TEAM_DATABASE)) {
        teams.forEach(team => {
            allTeams.push({ name: team, league: league });
        });
    }
    return allTeams;
}

function searchTeams(query) {
    const allTeams = getAllTeams();
    const lowerQuery = query.toLowerCase();
    return allTeams.filter(team => 
        team.name.toLowerCase().includes(lowerQuery) ||
        team.league.toLowerCase().includes(lowerQuery)
    ).slice(0, 20); // Limit to 20 results
}

function getTeamsByLeague(league) {
    return TEAM_DATABASE[league] || [];
}
