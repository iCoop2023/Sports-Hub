/**
 * ESPN CDN logo URLs and team primary colors.
 *
 * ESPN serves team logos at predictable CDN paths keyed by their own abbreviation
 * system. Where ESPN's abbrev differs from the one we store we maintain an override
 * map. Soccer leagues use numeric ESPN team IDs instead of abbreviations.
 *
 * The TEAM_COLORS map supplies the single most-recognisable primary color for
 * each team, used to tint cards, borders and gradients throughout the UI.
 * Keys are "LEAGUE:ABBREV".
 */

// ─── ESPN CDN ─────────────────────────────────────────────────────────────────

const ESPN_LEAGUE_PATH: Record<string, string> = {
  NHL: 'nhl',
  NBA: 'nba',
  NFL: 'nfl',
  MLB: 'mlb',
  WNBA: 'wnba',
  MLS: 'soccer',
  NWSL: 'soccer',
}

// Where ESPN's abbreviation differs from our stored abbrev
const ESPN_ABBREV_OVERRIDES: Record<string, Record<string, string>> = {
  NHL: {
    LAK: 'la',
    SJS: 'sj',
    NJD: 'nj',
    TBL: 'tb',
    CBJ: 'cls',
    UTA: 'utah',
  },
  NFL: {
    LAR: 'la',
    KC: 'kc',
    GB: 'gb',
    LV: 'lv',
    NE: 'ne',
    NO: 'no',
    SF: 'sf',
    TB: 'tb',
  },
  MLB: {
    CWS: 'chw',
    SFG: 'sf',
    WSH: 'wsh',
    LAA: 'laa',
    LAD: 'lad',
  },
  NBA: {
    GSW: 'gs',
    NOP: 'no',
    SAS: 'sa',
    OKC: 'okc',
  },
}

// Soccer teams use ESPN's numeric IDs rather than abbreviations
const SOCCER_ESPN_IDS: Record<string, Record<string, number>> = {
  'Premier League': {
    Arsenal: 359, 'Aston Villa': 1, Bournemouth: 349, Brentford: 337,
    'Brighton & Hove Albion': 331, Chelsea: 363, 'Crystal Palace': 384,
    Everton: 368, Fulham: 370, 'Ipswich Town': 375, 'Leicester City': 375,
    Liverpool: 364, 'Manchester City': 382, 'Manchester United': 360,
    'Newcastle United': 361, 'Nottingham Forest': 393, Southampton: 362,
    'Tottenham Hotspur': 367, 'West Ham United': 371,
    'Wolverhampton Wanderers': 380,
  },
  'La Liga': {
    'Real Madrid': 86, Barcelona: 83, 'Atletico Madrid': 1068,
    'Sevilla FC': 243, 'Real Betis': 244, 'Villarreal CF': 102,
    'Athletic Club': 93, 'Real Sociedad': 89, Valencia: 94, Osasuna: 97,
    'Celta Vigo': 241, Getafe: 3842, Girona: 9812, Rayo: 876,
    Espanyol: 88, Mallorca: 95, Alaves: 3828, Leganes: 9015, Valladolid: 238,
    'Las Palmas': 9826,
  },
  'Serie A': {
    'Inter Milan': 110, 'AC Milan': 109, Juventus: 111,
    'AS Roma': 113, Napoli: 116, Lazio: 115, Atalanta: 108,
    Fiorentina: 112, Torino: 122, Bologna: 107, Genoa: 119,
    Hellas: 120, Lecce: 5911, Cagliari: 1106, Empoli: 5898,
    Udinese: 124, Parma: 117, Como: 5907, Venezia: 5927,
    Monza: 9816,
  },
  Bundesliga: {
    'Bayern Munich': 132, 'Borussia Dortmund': 131, 'RB Leipzig': 11420,
    'Bayer Leverkusen': 133, 'VfB Stuttgart': 143, 'Eintracht Frankfurt': 9823,
    'SC Freiburg': 135, 'FC Augsburg': 11827, 'Hoffenheim': 3842,
    Wolfsburg: 145, Werder: 134, 'Borussia Mönchengladbach': 136,
    'FC Heidenheim': 10168, 'FC St. Pauli': 9833, Mainz: 9819,
    'Holstein Kiel': 9850, 'Union Berlin': 9866, Bochum: 9826,
  },
  'Ligue 1': {
    'Paris Saint-Germain': 160, Marseille: 156, Monaco: 162,
    Lyon: 157, Lille: 155, Nice: 159, Lens: 154,
    Rennes: 161, Reims: 9812, Strasbourg: 165,
    Montpellier: 158, Brest: 9819, Lorient: 9856,
    Nantes: 159, Toulouse: 9800, Metz: 9826, Clermont: 10230,
  },
  'Liga MX': {
    'Club América': 392, 'Guadalajara': 396, 'Cruz Azul': 393,
    'Tigres UANL': 399, 'Monterrey': 400, 'Pumas UNAM': 401,
    'Toluca': 402, 'Santos Laguna': 397, 'Atlas': 391,
    'León': 9826, 'Necaxa': 9819,
  },
}

export function espnLogoUrl(
  abbrev: string,
  league: string,
  teamName?: string,
): string | null {
  const espnPath = ESPN_LEAGUE_PATH[league]
  if (espnPath && espnPath !== 'soccer') {
    const overrides = ESPN_ABBREV_OVERRIDES[league] ?? {}
    const espnAbbrev = overrides[abbrev] ?? abbrev.toLowerCase()
    return `https://a.espncdn.com/i/teamlogos/${espnPath}/500/${espnAbbrev}.png`
  }

  // Soccer: look up by team name → ESPN numeric ID
  if (teamName) {
    const leagueIds = SOCCER_ESPN_IDS[league]
    if (leagueIds) {
      const id = leagueIds[teamName]
      if (id) return `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png`
    }
  }

  return null
}

// ─── Team primary colors ───────────────────────────────────────────────────────

const TEAM_COLORS: Record<string, string> = {
  // ── NHL ──────────────────────────────────────────────────────────────────────
  'NHL:ANA': '#F47A38', // Ducks orange
  'NHL:ARI': '#8C2633', // Coyotes wine
  'NHL:BOS': '#FCB514', // Bruins gold
  'NHL:BUF': '#003087', // Sabres navy
  'NHL:CAR': '#CC0000', // Hurricanes red
  'NHL:CBJ': '#002654', // Blue Jackets navy
  'NHL:CGY': '#C8102E', // Flames red
  'NHL:CHI': '#CF0A2C', // Blackhawks red
  'NHL:COL': '#6F263D', // Avalanche burgundy
  'NHL:DAL': '#006847', // Stars green
  'NHL:DET': '#CE1126', // Red Wings red
  'NHL:EDM': '#FF4C00', // Oilers orange
  'NHL:FLA': '#C8102E', // Panthers red
  'NHL:LAK': '#111111', // Kings black
  'NHL:MIN': '#154734', // Wild green
  'NHL:MTL': '#AF1E2D', // Canadiens red
  'NHL:NJD': '#CE1126', // Devils red
  'NHL:NSH': '#FFB81C', // Predators gold
  'NHL:NYI': '#003087', // Islanders blue
  'NHL:NYR': '#0038A8', // Rangers blue
  'NHL:OTT': '#E31837', // Senators red
  'NHL:PHI': '#F74902', // Flyers orange
  'NHL:PIT': '#FCB514', // Penguins gold
  'NHL:SEA': '#001628', // Kraken deep blue
  'NHL:SJS': '#006D75', // Sharks teal
  'NHL:STL': '#002F87', // Blues blue
  'NHL:TBL': '#002868', // Lightning blue
  'NHL:TOR': '#003E7E', // Maple Leafs blue
  'NHL:UTA': '#010101', // Utah HC
  'NHL:VAN': '#00843D', // Canucks green
  'NHL:VGK': '#B4975A', // Golden Knights gold
  'NHL:WPG': '#041E42', // Jets navy
  'NHL:WSH': '#041E42', // Capitals navy

  // ── NBA ──────────────────────────────────────────────────────────────────────
  'NBA:ATL': '#E03A3E', // Hawks red
  'NBA:BKN': '#000000', // Nets black
  'NBA:BOS': '#007A33', // Celtics green
  'NBA:CHA': '#00788C', // Hornets teal
  'NBA:CHI': '#CE1141', // Bulls red
  'NBA:CLE': '#860038', // Cavaliers wine
  'NBA:DAL': '#00538C', // Mavericks blue
  'NBA:DEN': '#0E2240', // Nuggets navy
  'NBA:DET': '#C8102E', // Pistons red
  'NBA:GSW': '#FFC72C', // Warriors gold
  'NBA:HOU': '#CE1141', // Rockets red
  'NBA:IND': '#FDBB30', // Pacers gold
  'NBA:LAC': '#C8102E', // Clippers red
  'NBA:LAL': '#552583', // Lakers purple
  'NBA:MEM': '#5D76A9', // Grizzlies blue
  'NBA:MIA': '#98002E', // Heat wine
  'NBA:MIL': '#00471B', // Bucks green
  'NBA:MIN': '#236192', // Timberwolves blue
  'NBA:NOP': '#0C2340', // Pelicans navy
  'NBA:NYK': '#F58426', // Knicks orange
  'NBA:OKC': '#007AC1', // Thunder blue
  'NBA:ORL': '#0077C0', // Magic blue
  'NBA:PHI': '#006BB6', // Sixers blue
  'NBA:PHX': '#E56020', // Suns orange
  'NBA:POR': '#E03A3E', // Blazers red
  'NBA:SAC': '#5A2D81', // Kings purple
  'NBA:SAS': '#C4CED4', // Spurs silver
  'NBA:TOR': '#CE1141', // Raptors red
  'NBA:UTA': '#002B5C', // Jazz navy
  'NBA:WAS': '#002B5C', // Wizards navy

  // ── NFL ──────────────────────────────────────────────────────────────────────
  'NFL:ARI': '#97233F', // Cardinals red
  'NFL:ATL': '#A71930', // Falcons red
  'NFL:BAL': '#241773', // Ravens purple
  'NFL:BUF': '#00338D', // Bills blue
  'NFL:CAR': '#0085CA', // Panthers blue
  'NFL:CHI': '#C83803', // Bears orange
  'NFL:CIN': '#FB4F14', // Bengals orange
  'NFL:CLE': '#311D00', // Browns brown
  'NFL:DAL': '#003594', // Cowboys blue
  'NFL:DEN': '#FB4F14', // Broncos orange
  'NFL:DET': '#0076B6', // Lions blue
  'NFL:GB': '#203731',  // Packers dark green
  'NFL:HOU': '#03202F', // Texans navy
  'NFL:IND': '#002C5F', // Colts blue
  'NFL:JAX': '#006778', // Jaguars teal
  'NFL:KC': '#E31837',  // Chiefs red
  'NFL:LAC': '#0080C6', // Chargers blue
  'NFL:LAR': '#003594', // Rams blue
  'NFL:LV': '#000000',  // Raiders black
  'NFL:MIA': '#008E97', // Dolphins teal
  'NFL:MIN': '#4F2683', // Vikings purple
  'NFL:NE': '#002244',  // Patriots navy
  'NFL:NO': '#D3BC8D',  // Saints gold
  'NFL:NYG': '#0B2265', // Giants blue
  'NFL:NYJ': '#125740', // Jets green
  'NFL:PHI': '#004C54', // Eagles midnight green
  'NFL:PIT': '#FFB612', // Steelers gold
  'NFL:SEA': '#002244', // Seahawks navy
  'NFL:SF': '#AA0000',  // 49ers red
  'NFL:TB': '#D50A0A',  // Buccaneers red
  'NFL:TEN': '#0C2340', // Titans navy
  'NFL:WAS': '#5A1414', // Commanders burgundy

  // ── MLB ──────────────────────────────────────────────────────────────────────
  'MLB:ARI': '#A71930', // Diamondbacks red
  'MLB:ATL': '#CE1141', // Braves red
  'MLB:BAL': '#DF4601', // Orioles orange
  'MLB:BOS': '#BD3039', // Red Sox red
  'MLB:CHC': '#0E3386', // Cubs blue
  'MLB:CIN': '#C6011F', // Reds red
  'MLB:CLE': '#E31937', // Guardians red
  'MLB:COL': '#33006F', // Rockies purple
  'MLB:CWS': '#27251F', // White Sox black
  'MLB:DET': '#0C2340', // Tigers navy
  'MLB:HOU': '#002D62', // Astros navy
  'MLB:KC': '#004687',  // Royals blue
  'MLB:LAA': '#BA0021', // Angels red
  'MLB:LAD': '#005A9C', // Dodgers blue
  'MLB:MIA': '#00A3E0', // Marlins blue
  'MLB:MIL': '#12284B', // Brewers navy
  'MLB:MIN': '#002B5C', // Twins navy
  'MLB:NYM': '#002D72', // Mets blue
  'MLB:NYY': '#003087', // Yankees navy
  'MLB:OAK': '#003831', // Athletics green
  'MLB:PHI': '#E81828', // Phillies red
  'MLB:PIT': '#FDB827', // Pirates gold
  'MLB:SD': '#2F241D',  // Padres brown
  'MLB:SEA': '#0C2C56', // Mariners navy
  'MLB:SFG': '#FD5A1E', // Giants orange
  'MLB:STL': '#C41E3A', // Cardinals red
  'MLB:TB': '#092C5C',  // Rays navy
  'MLB:TEX': '#C0111F', // Rangers red
  'MLB:TOR': '#134A8E', // Blue Jays blue
  'MLB:WSH': '#AB0003', // Nationals red

  // ── MLS (selected) ───────────────────────────────────────────────────────────
  'MLS:ATL': '#80000A', // Atlanta United
  'MLS:ATX': '#00B140', // Austin FC green
  'MLS:CHI': '#8B2432', // Chicago Fire
  'MLS:CLT': '#1A85C8', // Charlotte
  'MLS:CIN': '#F05323', // FC Cincinnati
  'MLS:CLB': '#FECB00', // Columbus Crew
  'MLS:DAL': '#00245D', // FC Dallas
  'MLS:DC': '#EF3E42',  // D.C. United
  'MLS:HOU': '#F4911E', // Houston Dynamo
  'MLS:LAG': '#00245D', // LA Galaxy
  'MLS:LAFC': '#C39E6D',// LAFC gold
  'MLS:MIA': '#F7B5CD', // Inter Miami pink
  'MLS:MNU': '#2C2A29', // Minnesota
  'MLS:MTL': '#00AEEF', // CF Montréal
  'MLS:NE': '#C63323',  // New England
  'MLS:NSH': '#ECE83A', // Nashville SC
  'MLS:NJ': '#ED1C24',  // Red Bulls
  'MLS:NYC': '#6CACE4', // NYCFC
  'MLS:ORL': '#633492', // Orlando
  'MLS:PHI': '#B19B69', // Philadelphia
  'MLS:POR': '#00482B', // Portland
  'MLS:RSL': '#B30838', // Real Salt Lake
  'MLS:SJ': '#0067B1',  // San Jose
  'MLS:SEA': '#5D9732', // Seattle
  'MLS:SKC': '#93B5D3', // Sporting KC
  'MLS:STL': '#003DA5', // St. Louis
  'MLS:TOR': '#B81137', // Toronto
  'MLS:VAN': '#009BC8', // Vancouver
}

/**
 * Returns the primary brand color for a team.
 * Falls back to the provided fallback color (typically the league color).
 */
export function teamColor(abbrev: string, league: string, fallback: string): string {
  return TEAM_COLORS[`${league}:${abbrev}`] ?? fallback
}
