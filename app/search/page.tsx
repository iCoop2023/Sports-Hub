'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import type { TeamSummary } from '@/lib/types'
import { teamPath, leagueColor } from '@/lib/utils'
import LeagueBadge from '@/components/LeagueBadge'
import TeamLogo from '@/components/TeamLogo'

export default function ManagePage() {
  const [query, setQuery] = useState('')
  const [allTeams, setAllTeams] = useState<TeamSummary[]>([])
  const [myTeams, setMyTeams] = useState<TeamSummary[]>([])
  const [adding, setAdding] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [expandedLeagues, setExpandedLeagues] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/teams').then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
    ])
      .then(([teams, settings]) => {
        const list: TeamSummary[] = Array.isArray(teams) ? teams : teams.teams ?? []
        const saved: TeamSummary[] = settings.teams ?? []
        setAllTeams(list)
        setMyTeams(saved)
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const myTeamNames = useMemo(() => new Set(myTeams.map((t) => t.name)), [myTeams])

  const searchResults = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return allTeams
      .filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.league.toLowerCase().includes(q) ||
          t.abbrev?.toLowerCase().includes(q)
      )
      .slice(0, 50)
  }, [query, allTeams])

  // All teams grouped by league — show added ones as "✓ Added" so the action is confirmed in place
  const browseGroups = useMemo(() => {
    if (query.trim()) return null
    const map = new Map<string, TeamSummary[]>()
    for (const t of allTeams) {
      if (!map.has(t.league)) map.set(t.league, [])
      map.get(t.league)!.push(t)
    }
    return map
  }, [query, allTeams])

  async function saveTeams(updated: TeamSummary[]) {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teams: updated }),
    })
  }

  async function addTeam(team: TeamSummary) {
    if (myTeamNames.has(team.name)) return
    setAdding((prev) => new Set(prev).add(team.name))
    try {
      const updated = [...myTeams, team]
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teams: updated }),
      })
      if (res.ok) {
        setMyTeams(updated)
        fetch('/api/team/fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ team_name: team.name, league: team.league }),
        }).catch(() => {})
      }
    } finally {
      setAdding((prev) => { const n = new Set(prev); n.delete(team.name); return n })
    }
  }

  async function removeTeam(team: TeamSummary) {
    const updated = myTeams.filter((t) => t.name !== team.name)
    setMyTeams(updated)
    await saveTeams(updated)
  }

  function toggleLeague(league: string) {
    setExpandedLeagues((prev) => {
      const next = new Set(prev)
      if (next.has(league)) next.delete(league)
      else next.add(league)
      return next
    })
  }

  return (
    <div className="min-h-screen" style={{ background: '#09090b' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ background: 'rgba(9,9,11,0.88)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-zinc-500 hover:text-white transition-colors shrink-0 p-1 -ml-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: '#52525b' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any team or league..."
              className="w-full text-white placeholder-zinc-600 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-8">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ── Search results ── */}
        {!loading && query.trim() && (
          <section>
            <p className="text-zinc-600 text-xs mb-3">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
            </p>
            <div className="flex flex-col gap-2">
              {searchResults.map((team) => (
                <TeamRow
                  key={team.name}
                  team={team}
                  added={myTeamNames.has(team.name)}
                  adding={adding.has(team.name)}
                  onAdd={() => addTeam(team)}
                  onRemove={() => removeTeam(team)}
                />
              ))}
              {searchResults.length === 0 && (
                <p className="text-zinc-600 text-sm text-center py-10">No teams found</p>
              )}
            </div>
          </section>
        )}

        {/* ── My Teams ── */}
        {!loading && !query.trim() && myTeams.length > 0 && (
          <section>
            <SectionHeader label="My Teams" count={myTeams.length} />
            <div className="flex flex-col gap-1.5">
              {myTeams.map((team) => (
                <TeamRow
                  key={team.name}
                  team={team}
                  added
                  adding={false}
                  onAdd={() => {}}
                  onRemove={() => removeTeam(team)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Browse to Add ── */}
        {!loading && !query.trim() && browseGroups && browseGroups.size > 0 && (
          <section>
            <SectionHeader
              label="Add Teams"
              count={Array.from(browseGroups.values()).reduce((s, a) => s + a.length, 0)}
            />
            <div className="flex flex-col gap-1.5">
              {Array.from(browseGroups.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([league, teams]) => {
                  const isOpen = expandedLeagues.has(league)
                  const color = leagueColor(league)
                  return (
                    <div
                      key={league}
                      className="rounded-xl overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <button
                        onClick={() => toggleLeague(league)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                          <span className="text-white text-sm font-semibold">{league}</span>
                          <span className="text-zinc-600 text-xs">{teams.length}</span>
                        </div>
                        <svg
                          className={`w-4 h-4 text-zinc-600 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="border-t border-white/[0.05] flex flex-col gap-1 p-2">
                          {teams.map((team) => (
                            <TeamRow
                              key={team.name}
                              team={team}
                              added={myTeamNames.has(team.name)}
                              adding={adding.has(team.name)}
                              onAdd={() => addTeam(team)}
                              onRemove={() => removeTeam(team)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </section>
        )}

        {/* Empty cache edge case */}
        {!loading && !query.trim() && allTeams.length === 0 && (
          <p className="text-center text-zinc-600 text-sm py-4">Could not load teams. Try again later.</p>
        )}
      </main>
    </div>
  )
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h2 className="text-white font-bold text-sm">{label}</h2>
      <span
        className="text-[11px] font-bold px-1.5 py-0.5 rounded-md"
        style={{ background: 'rgba(255,255,255,0.08)', color: '#71717a' }}
      >
        {count}
      </span>
    </div>
  )
}

function TeamRow({
  team,
  added,
  adding,
  onAdd,
  onRemove,
}: {
  team: TeamSummary
  added: boolean
  adding: boolean
  onAdd: () => void
  onRemove: () => void
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <Link href={teamPath(team)} className="flex items-center gap-3 flex-1 min-w-0 group">
        <TeamLogo abbrev={team.abbrev} league={team.league} size={36} />
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold truncate group-hover:text-blue-400 transition-colors">
            {team.name}
          </p>
          <LeagueBadge league={team.league} size="sm" />
        </div>
      </Link>

      {added ? (
        <button
          onClick={(e) => { e.preventDefault(); onRemove() }}
          className="ml-2 shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
          style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}
          title="Remove team"
        >
          ✓ Added
        </button>
      ) : (
        <button
          onClick={(e) => { e.preventDefault(); onAdd() }}
          disabled={adding}
          className={`ml-2 shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-all text-white ${adding ? 'opacity-50 cursor-wait' : 'hover:opacity-90'}`}
          style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
        >
          {adding ? '…' : '+ Add'}
        </button>
      )}
    </div>
  )
}
