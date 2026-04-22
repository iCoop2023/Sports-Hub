'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { Team, Game } from '@/lib/types'
import { isLive, leagueColor, calcRecord, recordStr, teamPath, formatGameDate } from '@/lib/utils'
import TeamLogo from '@/components/TeamLogo'

function hasLiveGame(teams: Team[]): boolean {
  return teams.some((t) =>
    [...(t.recent_games ?? []), ...(t.games ?? [])].some((g) => isLive(g.status))
  )
}

function getBestGame(team: Team): { game: Game; label: string } | null {
  const all = [...(team.recent_games ?? []), ...(team.games ?? [])]
  const live = all.find((g) => isLive(g.status))
  if (live) return { game: live, label: 'LIVE' }
  const upcoming = team.upcoming_games?.[0]
  if (upcoming) return { game: upcoming, label: formatGameDate(upcoming.date) }
  const completed = all.filter((g) => ['W', 'L', 'T'].includes((g.result ?? '').toUpperCase()))
  const last = completed[completed.length - 1]
  if (last) return { game: last, label: formatGameDate(last.date) }
  return null
}

function SkeletonLeague() {
  return (
    <div
      className="h-12 rounded-2xl animate-pulse"
      style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
    />
  )
}

export default function Dashboard() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        const fetched: Team[] = data.teams ?? []
        setTeams(fetched)
        setLive(hasLiveGame(fetched))
      }
    } catch {
      // keep showing last data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const interval = setInterval(load, live ? 30_000 : 300_000)
    return () => clearInterval(interval)
  }, [live, load])

  // Group teams by league, preserving cache order within each league
  const leagueGroups: Record<string, Team[]> = {}
  for (const team of teams) {
    const league = team.league || 'Other'
    if (!leagueGroups[league]) leagueGroups[league] = []
    leagueGroups[league].push(team)
  }
  const leagues = Object.keys(leagueGroups).sort((a, b) => a.localeCompare(b))

  function toggleLeague(league: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(league)) next.delete(league)
      else next.add(league)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-black tracking-tight">⚡ Sports Hub</span>
            {live && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-500/15 border border-orange-500/25 px-1.5 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse inline-block" />
                LIVE
              </span>
            )}
          </div>
          <Link
            href="/search"
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors bg-white/[0.06] hover:bg-white/[0.1] px-3 py-1.5 rounded-full"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            Manage
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Loading skeletons */}
        {loading && (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => <SkeletonLeague key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && teams.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-white font-bold text-xl mb-2">Welcome to Sports Hub</h2>
            <p className="text-zinc-500 text-sm mb-6 max-w-xs mx-auto">
              Track scores, schedules, and news for any team across 19+ leagues
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-full transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              Add Your Teams
            </Link>
          </div>
        )}

        {/* League accordion */}
        {!loading && teams.length > 0 && (
          <div className="flex flex-col gap-6">
            {/* Summary */}
            <div>
              <h1 className="text-2xl font-black text-white">Your Hub</h1>
              <p className="text-zinc-500 text-sm mt-0.5">
                {teams.length} teams · {leagues.length} leagues
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {leagues.map((league) => {
                const leagueTeams = leagueGroups[league]
                const isExpanded = expanded.has(league)
                const color = leagueColor(league)

                return (
                  <div
                    key={league}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    {/* League header row */}
                    <button
                      onClick={() => toggleLeague(league)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: color }}
                        />
                        <span className="text-white font-semibold text-sm">{league}</span>
                        <span className="text-zinc-600 text-xs">{leagueTeams.length}</span>
                      </div>
                      <svg
                        className={`w-4 h-4 text-zinc-600 transition-transform duration-150 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expanded team list */}
                    {isExpanded && (
                      <div className="border-t border-white/[0.05] divide-y divide-white/[0.04]">
                        {leagueTeams.map((team) => {
                          const allGames = [...(team.recent_games ?? []), ...(team.games ?? [])]
                          const rec = calcRecord(allGames)
                          const best = getBestGame(team)
                          return (
                            <Link
                              key={team.name}
                              href={teamPath(team)}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors"
                            >
                              <TeamLogo abbrev={team.abbrev} league={team.league} size={32} />
                              <div className="flex-1 min-w-0">
                                <div className="text-white text-sm font-medium truncate">{team.name}</div>
                                {best ? (
                                  <div className="text-zinc-500 text-xs truncate">
                                    {best.label === 'LIVE' ? (
                                      <span className="text-orange-400 font-bold">
                                        LIVE · {best.game.team_score}–{best.game.opponent_score} vs {best.game.opponent}
                                      </span>
                                    ) : (
                                      <span>{best.label} vs {best.game.opponent}</span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-zinc-700 text-xs">No schedule data</div>
                                )}
                              </div>
                              <span className="text-zinc-600 text-xs shrink-0 font-mono">{recordStr(rec)}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <Link
              href="/search"
              className="flex items-center justify-center gap-2 rounded-2xl py-4 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              style={{ border: '1px dashed rgba(255,255,255,0.12)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Manage teams
            </Link>
          </div>
        )}
      </main>

      <div className="h-8" />
    </div>
  )
}
