import type { Game, TeamRecord } from './types'

export function teamSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function leagueSlug(league: string): string {
  return league.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function teamPath(team: { name: string; league: string }): string {
  return `/team/${leagueSlug(team.league)}/${teamSlug(team.name)}`
}

export function slugToName(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatGameDate(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`)
  const todayStr = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().slice(0, 10)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  if (dateStr === todayStr) return 'Today'
  if (dateStr === tomorrowStr) return 'Tomorrow'
  if (dateStr === yesterdayStr) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function calcRecord(games: Game[]): TeamRecord {
  const completed = games.filter((g) =>
    ['W', 'L', 'T'].includes((g.result ?? '').toUpperCase())
  )
  return {
    wins: completed.filter((g) => g.result.toUpperCase() === 'W').length,
    losses: completed.filter((g) => g.result.toUpperCase() === 'L').length,
    ties: completed.filter((g) => g.result.toUpperCase() === 'T').length,
    total: completed.length,
  }
}

export function recordStr(rec: TeamRecord): string {
  if (rec.total === 0) return '—'
  if (rec.ties > 0) return `${rec.wins}-${rec.losses}-${rec.ties}`
  return `${rec.wins}-${rec.losses}`
}

export function isLive(status: string): boolean {
  const s = status.toLowerCase()
  return ['live', 'in progress', 'halftime', 'end of period', 'crit'].includes(s)
}

export function isCompleted(status: string): boolean {
  const s = status.toLowerCase()
  return ['off', 'final', 'full time', 'f', 'final/ot', 'final/so'].includes(s)
}

export function leagueColor(league: string): string {
  const colors: Record<string, string> = {
    NHL: '#0a84ff',
    MLB: '#c41e3a',
    NBA: '#f97316',
    NFL: '#013369',
    MLS: '#00aadd',
    WNBA: '#fd5a1e',
    NWSL: '#6366f1',
    CFL: '#e67e22',
    WHL: '#f59e0b',
    CEBL: '#fbbf24',
    CPL: '#e63946',
    PWHL: '#a78bfa',
    'NHL (AHL)': '#5b9bd5',
    'Premier League': '#6c1d8e',
    'La Liga': '#ef4444',
    'Serie A': '#007bc2',
    Bundesliga: '#e00000',
    'Ligue 1': '#1d4ed8',
    'Champions League': '#003b8e',
    'Liga MX': '#16a34a',
  }
  return colors[league] ?? '#71717a'
}

export function leagueShort(league: string): string {
  const shorts: Record<string, string> = {
    'Premier League': 'EPL',
    'La Liga': 'ESP',
    'Serie A': 'ITA',
    Bundesliga: 'GER',
    'Ligue 1': 'FRA',
    'Champions League': 'UCL',
    'Liga MX': 'MEX',
  }
  return shorts[league] ?? league
}
