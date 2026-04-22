import type { Team, TeamSummary, DashboardResponse } from './types'

function apiBase(): string {
  if (typeof window === 'undefined') {
    // Server-side: use env var or default empty (same-origin on Vercel)
    return process.env.NEXT_PUBLIC_API_URL ?? ''
  }
  return process.env.NEXT_PUBLIC_API_URL ?? ''
}

export async function getDashboard(): Promise<Team[]> {
  const res = await fetch(`${apiBase()}/api/dashboard`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) return []
  const data: DashboardResponse = await res.json()
  return data.teams ?? []
}

export async function getAllTeams(): Promise<TeamSummary[]> {
  const res = await fetch(`${apiBase()}/api/teams`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const data = await res.json()
  // API returns array directly
  if (Array.isArray(data)) return data
  // Or might be wrapped
  return data.teams ?? data
}

export async function getTeam(name: string): Promise<Team | null> {
  const res = await fetch(`${apiBase()}/api/team/${encodeURIComponent(name)}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) return null
  return res.json()
}

export async function getSettings(): Promise<TeamSummary[]> {
  const res = await fetch(`${apiBase()}/api/settings`, {
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.teams ?? []
}

export async function addTeam(team: TeamSummary): Promise<boolean> {
  const settings = await getSettings()
  const already = settings.some((t) => t.name === team.name)
  if (already) return true

  const updated = [...settings, team]
  const res = await fetch(`${apiBase()}/api/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teams: updated }),
  })
  return res.ok
}

export async function removeTeam(teamName: string): Promise<boolean> {
  const settings = await getSettings()
  const updated = settings.filter((t) => t.name !== teamName)
  const res = await fetch(`${apiBase()}/api/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teams: updated }),
  })
  return res.ok
}
