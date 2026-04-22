export interface Game {
  id: string
  date: string
  opponent: string
  team_score: number
  opponent_score: number
  status: string
  is_home: boolean
  result: string // "W" | "L" | "T" | "SCHEDULED" | "LIVE"
  league: string
}

export interface NewsArticle {
  title: string
  url: string
  age: string
  source: string
}

export interface Team {
  name: string
  league: string
  abbrev: string
  games: Game[]
  news: NewsArticle[]
  recent_games: Game[]
  upcoming_games: Game[]
}

export interface TeamSummary {
  name: string
  league: string
  abbrev: string
}

export interface DashboardResponse {
  teams: Team[]
  fetched_at: string
  timestamp: string
}

export interface TeamRecord {
  wins: number
  losses: number
  ties: number
  total: number
}
