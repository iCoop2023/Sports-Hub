/**
 * ESPN CDN logo URLs and team primary colors.
 *
 * ESPN serves team logos at predictable CDN paths. For North American leagues
 * the key is a string abbreviation; for soccer leagues the database already
 * stores ESPN's own numeric team ID as the abbrev field, so we use it directly.
 *
 * teamColor() tries the stored abbrev as-is, then uppercased, then lowercased,
 * so it works whether the league stores "tor", "TOR", or anything in between.
 * Keys in TEAM_COLORS use the casing that each league's source provides.
 *
 * Keys are "LEAGUE:ABBREV" (ABBREV matches the value from the database).
 */

// ─── ESPN CDN paths by league name ────────────────────────────────────────────

const ESPN_LEAGUE_PATH: Record<string, string> = {
  // North American pro
  NHL: 'nhl',
  NBA: 'nba',
  NFL: 'nfl',
  MLB: 'mlb',
  WNBA: 'wnba',
  CFL: 'cfl',
  // Soccer — abbrev in our DB is ESPN's numeric team ID
  MLS: 'soccer',
  NWSL: 'soccer',
  'Premier League': 'soccer',
  'La Liga': 'soccer',
  'Serie A': 'soccer',
  Bundesliga: 'soccer',
  'Ligue 1': 'soccer',
  'Liga MX': 'soccer',
}

// Where ESPN's abbreviation key differs from what we store.
// Keys are UPPERCASE — the lookup normalises before comparing.
const ESPN_ABBREV_OVERRIDES: Record<string, Record<string, string>> = {
  NHL: {
    LAK: 'la',   // Kings
    SJS: 'sj',   // Sharks
    NJD: 'nj',   // Devils
    TBL: 'tb',   // Lightning
    CBJ: 'cls',  // Blue Jackets
    UTA: 'utah', // Utah HC
  },
  NFL: {
    LAR: 'la',   // Rams (ESPN still uses 'la')
  },
}

// Build the ESPN logo URL for a given team.
export function espnLogoUrl(
  abbrev: string,
  league: string,
): string | null {
  const espnPath = ESPN_LEAGUE_PATH[league]
  if (!espnPath) return null

  // Soccer leagues: the stored abbrev IS ESPN's numeric team ID
  if (espnPath === 'soccer') {
    const id = parseInt(abbrev, 10)
    if (!isNaN(id)) return `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png`
    return null
  }

  // Non-soccer: look up overrides (check uppercase so both 'lar' and 'LAR' match)
  const overrides = ESPN_ABBREV_OVERRIDES[league] ?? {}
  const espnAbbrev =
    overrides[abbrev] ??
    overrides[abbrev.toUpperCase()] ??
    abbrev.toLowerCase()

  return `https://a.espncdn.com/i/teamlogos/${espnPath}/500/${espnAbbrev}.png`
}

// ─── Team primary colors ───────────────────────────────────────────────────────
//
// Keys use the exact abbreviation casing stored in the database:
//   NHL  → uppercase  (ANA, BOS, EDM …)
//   MLB  → lowercase  (tor, bos, kc …)
//   NBA  → lowercase  (bos, gs, no, sa, utah …)
//   NFL  → lowercase  (kc, gb, lar, ne …)
//   WNBA → lowercase  (chi, lv, sea …)
//   CFL  → uppercase  (CGY, EDM, BC …)

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
  'NHL:UTA': '#2B2D2E', // Utah HC dark
  'NHL:VAN': '#00843D', // Canucks green
  'NHL:VGK': '#B4975A', // Golden Knights gold
  'NHL:WPG': '#041E42', // Jets navy
  'NHL:WSH': '#C8102E', // Capitals red

  // ── NBA (lowercase abbrevs) ───────────────────────────────────────────────────
  'NBA:atl': '#E03A3E', // Hawks red
  'NBA:bkn': '#000000', // Nets black
  'NBA:bos': '#007A33', // Celtics green
  'NBA:cha': '#00788C', // Hornets teal
  'NBA:chi': '#CE1141', // Bulls red
  'NBA:cle': '#860038', // Cavaliers wine
  'NBA:dal': '#00538C', // Mavericks blue
  'NBA:den': '#0E2240', // Nuggets navy
  'NBA:det': '#C8102E', // Pistons red
  'NBA:gs':  '#FFC72C', // Warriors gold  (stored as 'gs' not 'gsw')
  'NBA:hou': '#CE1141', // Rockets red
  'NBA:ind': '#FDBB30', // Pacers gold
  'NBA:lac': '#C8102E', // Clippers red
  'NBA:lal': '#552583', // Lakers purple
  'NBA:mem': '#5D76A9', // Grizzlies blue
  'NBA:mia': '#98002E', // Heat wine
  'NBA:mil': '#00471B', // Bucks green
  'NBA:min': '#236192', // Timberwolves blue
  'NBA:no':  '#0C2340', // Pelicans navy  (stored as 'no')
  'NBA:ny':  '#F58426', // Knicks orange  (stored as 'ny')
  'NBA:okc': '#007AC1', // Thunder blue
  'NBA:orl': '#0077C0', // Magic blue
  'NBA:phi': '#006BB6', // Sixers blue
  'NBA:phx': '#E56020', // Suns orange
  'NBA:por': '#E03A3E', // Blazers red
  'NBA:sac': '#5A2D81', // Kings purple
  'NBA:sa':  '#C4CED4', // Spurs silver  (stored as 'sa')
  'NBA:tor': '#CE1141', // Raptors red
  'NBA:utah':'#002B5C', // Jazz navy     (stored as 'utah')
  'NBA:wsh': '#002B5C', // Wizards navy

  // ── NFL (lowercase abbrevs) ───────────────────────────────────────────────────
  'NFL:ari': '#97233F', // Cardinals red
  'NFL:atl': '#A71930', // Falcons red
  'NFL:bal': '#241773', // Ravens purple
  'NFL:buf': '#00338D', // Bills blue
  'NFL:car': '#0085CA', // Panthers blue
  'NFL:chi': '#C83803', // Bears orange
  'NFL:cin': '#FB4F14', // Bengals orange
  'NFL:cle': '#311D00', // Browns brown
  'NFL:dal': '#003594', // Cowboys blue
  'NFL:den': '#FB4F14', // Broncos orange
  'NFL:det': '#0076B6', // Lions blue
  'NFL:gb':  '#203731', // Packers dark green
  'NFL:hou': '#03202F', // Texans navy
  'NFL:ind': '#002C5F', // Colts blue
  'NFL:jax': '#006778', // Jaguars teal
  'NFL:kc':  '#E31837', // Chiefs red
  'NFL:lac': '#0080C6', // Chargers blue
  'NFL:lar': '#003594', // Rams blue
  'NFL:lv':  '#000000', // Raiders black
  'NFL:mia': '#008E97', // Dolphins teal
  'NFL:min': '#4F2683', // Vikings purple
  'NFL:ne':  '#002244', // Patriots navy
  'NFL:no':  '#D3BC8D', // Saints gold
  'NFL:nyg': '#0B2265', // Giants blue
  'NFL:nyj': '#125740', // Jets green
  'NFL:phi': '#004C54', // Eagles midnight green
  'NFL:pit': '#FFB612', // Steelers gold
  'NFL:sea': '#002244', // Seahawks navy
  'NFL:sf':  '#AA0000', // 49ers red
  'NFL:tb':  '#D50A0A', // Buccaneers red
  'NFL:ten': '#0C2340', // Titans navy
  'NFL:wsh': '#5A1414', // Commanders burgundy

  // ── MLB (lowercase abbrevs) ───────────────────────────────────────────────────
  'MLB:ari': '#A71930', // Diamondbacks red
  'MLB:atl': '#CE1141', // Braves red
  'MLB:bal': '#DF4601', // Orioles orange
  'MLB:bos': '#BD3039', // Red Sox red
  'MLB:chc': '#0E3386', // Cubs blue
  'MLB:chw': '#27251F', // White Sox black  (stored as 'chw')
  'MLB:cin': '#C6011F', // Reds red
  'MLB:cle': '#E31937', // Guardians red
  'MLB:col': '#33006F', // Rockies purple
  'MLB:det': '#0C2340', // Tigers navy
  'MLB:hou': '#002D62', // Astros navy
  'MLB:kc':  '#004687', // Royals blue
  'MLB:laa': '#BA0021', // Angels red
  'MLB:lad': '#005A9C', // Dodgers blue
  'MLB:mia': '#00A3E0', // Marlins blue
  'MLB:mil': '#12284B', // Brewers navy
  'MLB:min': '#002B5C', // Twins navy
  'MLB:nym': '#002D72', // Mets blue
  'MLB:nyy': '#003087', // Yankees navy
  'MLB:oak': '#003831', // Athletics green
  'MLB:phi': '#E81828', // Phillies red
  'MLB:pit': '#FDB827', // Pirates gold
  'MLB:sd':  '#2F241D', // Padres brown
  'MLB:sea': '#0C2C56', // Mariners navy
  'MLB:sf':  '#FD5A1E', // Giants orange   (stored as 'sf')
  'MLB:stl': '#C41E3A', // Cardinals red
  'MLB:tb':  '#092C5C', // Rays navy
  'MLB:tex': '#C0111F', // Rangers red
  'MLB:tor': '#134A8E', // Blue Jays blue
  'MLB:wsh': '#AB0003', // Nationals red

  // ── CFL (uppercase abbrevs) ───────────────────────────────────────────────────
  'CFL:BC':  '#F15A22', // BC Lions orange
  'CFL:CGY': '#C8102E', // Calgary Stampeders red
  'CFL:EDM': '#2E7D32', // Edmonton Elks green
  'CFL:SSK': '#006400', // Saskatchewan Roughriders green
  'CFL:WPG': '#003087', // Winnipeg Blue Bombers navy
  'CFL:HAM': '#F5A800', // Hamilton Tiger-Cats gold
  'CFL:MTL': '#003DA5', // Montreal Alouettes blue
  'CFL:OTT': '#000000', // Ottawa Redblacks black
  'CFL:TOR': '#5C0E2C', // Toronto Argonauts burgundy

  // ── WNBA (lowercase abbrevs) ──────────────────────────────────────────────────
  'WNBA:atl':  '#C8102E', // Atlanta Dream
  'WNBA:chi':  '#418FDE', // Chicago Sky
  'WNBA:conn': '#E03A3E', // Connecticut Sun
  'WNBA:dal':  '#C4D600', // Dallas Wings
  'WNBA:gs':   '#1D428A', // Golden State Valkyries
  'WNBA:ind':  '#E03A3E', // Indiana Fever
  'WNBA:lv':   '#010101', // Las Vegas Aces
  'WNBA:la':   '#552583', // LA Sparks
  'WNBA:min':  '#266092', // Minnesota Lynx
  'WNBA:ny':   '#86CEBC', // New York Liberty
  'WNBA:phx':  '#201747', // Phoenix Mercury
  'WNBA:sea':  '#2C5234', // Seattle Storm
  'WNBA:wsh':  '#C8102E', // Washington Mystics

  // ── PWHL (uppercase abbrevs) ──────────────────────────────────────────────────
  'PWHL:BOS': '#007749', // Boston Fleet green
  'PWHL:MIN': '#6ECEB2', // Minnesota Frost teal
  'PWHL:MTL': '#862633', // Montreal Victoire red
  'PWHL:NY':  '#0057A8', // New York Sirens blue
  'PWHL:OTT': '#C8102E', // Ottawa Charge red
  'PWHL:TOR': '#4B4F54', // Toronto Sceptres grey

  // ── MLS (numeric abbrevs — color by team ID for reference only) ───────────────
  // MLS logos come from ESPN numeric IDs; card tints use league fallback
}

/**
 * Returns the primary brand color for a team.
 * Tries the abbreviation as-is, then uppercased, then lowercased so that
 * case differences between leagues never cause a miss.
 */
export function teamColor(abbrev: string, league: string, fallback: string): string {
  return (
    TEAM_COLORS[`${league}:${abbrev}`] ??
    TEAM_COLORS[`${league}:${abbrev.toUpperCase()}`] ??
    TEAM_COLORS[`${league}:${abbrev.toLowerCase()}`] ??
    fallback
  )
}
