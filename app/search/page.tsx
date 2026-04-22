'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import type { TeamSummary } from '@/lib/types'
import { teamPath, leagueColor } from '@/lib/utils'
import LeagueBadge from '@/components/LeagueBadge'
import TeamLogo from '@/components/TeamLogo'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [allTeams, setAllTeams] = useState<TeamSummary[]>([])
  const [myTeams, setMyTeams] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/teams').then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
    ])
      .then(([teams, settings]) => {
        const list: TeamSummary[] = Array.isArray(teams) ? teams : teams.teams ?? []
        const saved: TeamSummary[] = settings.teams ?? settings ?? []
        setAllTeams(list)
        setMyTeams(new Set(saved.map((t: TeamSummary) => t.name)))
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    // Auto-focus search
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const results = useMemo(() => {
    if (!query.trim()) return allTeams
    const q = query.toLowerCase()
    return allTeams
      .filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.league.toLowerCase().includes(q) ||
          t.abbrev?.toLowerCase().includes(q)
      )
      .slice(0, 40)
  }, [query, allTeams])

  async function addTeam(team: TeamSummary) {
    if (myTeams.has(team.name)) {
      // Remove
      const settings = await fetch('/api/settings').then((r) => r.json())
      const current: TeamSummary[] = settings.teams ?? []
      const updated = current.filter((t) => t.name !== team.name)
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teams: updated }),
      })
      setMyTeams((prev) => {
        const next = new Set(prev)
        next.delete(team.name)
        return next
      })
      return
    }

    setAdding((prev) => new Set(prev).add(team.name))
    try {
      const settings = await fetch('/api/settings').then((r) => r.json())
      const current: TeamSummary[] = settings.teams ?? []
      const updated = [...current, team]
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teams: updated }),
      })
      if (res.ok) {
        setMyTeams((prev) => new Set(prev).add(team.name))
        // Also trigger a background fetch for this new team
        fetch(`/api/team/fetch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ team_name: team.name, league: team.league }),
        }).catch(() => {})
      }
    } finally {
      setAdding((prev) => {
        const next = new Set(prev)
        next.delete(team.name)
        return next
      })
    }
  }

  // Group by league for display
  const grouped = useMemo(() => {
    if (query.trim()) return null
    const map = new Map<string, TeamSummary[]>()
    for (const t of results) {
      if (!map.has(t.league)) map.set(t.league, [])
      map.get(t.league)!.push(t)
    }
    return map
  }, [query, results])

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any team or league..."
              className="w-full bg-white/[0.08] text-white placeholder-zinc-500 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/60 border border-white/[0.06]"
            />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && allTeams.length === 0 && (
          <p className="text-zinc-500 text-center py-16 text-sm">Could not load teams. Try again later.</p>
        )}

        {/* Search results */}
        {!loading && query.trim() && (
          <div>
            <p className="text-zinc-500 text-xs mb-3">
              {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
            </p>
            <div className="flex flex-col gap-2">
              {results.map((team) => (
                <TeamRow
                  key={team.name}
                  team={team}
                  added={myTeams.has(team.name)}
                  adding={adding.has(team.name)}
                  onToggle={() => addTeam(team)}
                />
              ))}
              {results.length === 0 && (
                <p className="text-zinc-500 text-sm text-center py-10">No teams found</p>
              )}
            </div>
          </div>
        )}

        {/* Browse by league */}
        {!loading && !query.trim() && grouped && (
          <div className="space-y-6">
            <p className="text-zinc-500 text-xs">Browse all {allTeams.length} teams across {grouped.size} leagues</p>
            {Array.from(grouped.entries()).map(([league, teams]) => (
              <div key={league}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-xs font-bold"
                    style={{ color: leagueColor(league) }}
                  >
                    {league}
                  </span>
                  <span className="text-zinc-700 text-xs">({teams.length})</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {teams.map((team) => (
                    <TeamRow
                      key={team.name}
                      team={team}
                      added={myTeams.has(team.name)}
                      adding={adding.has(team.name)}
                      onToggle={() => addTeam(team)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function TeamRow({
  team,
  added,
  adding,
  onToggle,
}: {
  team: TeamSummary
  added: boolean
  adding: boolean
  onToggle: () => void
}) {
  return (
    <div
      className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <Link href={teamPath(team)} className="flex items-center gap-3 flex-1 min-w-0 group">
        <TeamLogo abbrev={team.abbrev} league={team.league} size={36} />
        <div className="min-w-0">
          <div className="text-white text-sm font-semibold truncate group-hover:text-blue-400 transition-colors">
            {team.name}
          </div>
          <div className="mt-0.5">
            <LeagueBadge league={team.league} size="sm" />
          </div>
        </div>
      </Link>
      <button
        onClick={(e) => { e.preventDefault(); onToggle() }}
        disabled={adding}
        className={`ml-3 shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
          added
            ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
            : 'bg-blue-600 text-white hover:bg-blue-500'
        } ${adding ? 'opacity-50 cursor-wait' : ''}`}
      >
        {adding ? '...' : added ? '✓ Added' : '+ Add'}
      </button>
    </div>
  )
}
