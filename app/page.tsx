'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { Team, TeamSummary } from '@/lib/types'
import { isLive, leagueColor } from '@/lib/utils'
import TeamCard from '@/components/TeamCard'

type AuthState = 'loading' | 'guest' | 'user'

function hasLiveGames(picked: TeamSummary[], map: Record<string, Team>): boolean {
  return picked.some((s) => {
    const d = map[s.name]
    if (!d) return false
    return [...(d.recent_games ?? []), ...(d.games ?? [])].some((g) => isLive(g.status))
  })
}

// ─── Shared header ────────────────────────────────────────────────────────────

function SiteHeader({ live, isGuest }: { live?: boolean; isGuest?: boolean }) {
  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{ background: 'rgba(9,9,11,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-base font-black tracking-tight text-white">Sports Hub</span>
          {live && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        {isGuest ? (
          <Link
            href="/login"
            className="text-sm font-semibold text-white px-4 py-1.5 rounded-full transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
          >
            Sign In
          </Link>
        ) : (
          <Link
            href="/search"
            className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            + Manage
          </Link>
        )}
      </div>
    </header>
  )
}

// ─── Guest welcome page ───────────────────────────────────────────────────────

const FEATURED_LEAGUES = [
  { name: 'NHL', emoji: '🏒' },
  { name: 'NBA', emoji: '🏀' },
  { name: 'NFL', emoji: '🏈' },
  { name: 'MLB', emoji: '⚾' },
  { name: 'MLS', emoji: '⚽' },
  { name: 'Premier League', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'La Liga', emoji: '🇪🇸' },
  { name: 'Serie A', emoji: '🇮🇹' },
  { name: 'Bundesliga', emoji: '🇩🇪' },
  { name: 'Ligue 1', emoji: '🇫🇷' },
  { name: 'CFL', emoji: '🏈' },
  { name: 'WNBA', emoji: '🏀' },
  { name: 'NWSL', emoji: '⚽' },
  { name: 'WHL', emoji: '🏒' },
  { name: 'PWHL', emoji: '🏒' },
  { name: 'CPL', emoji: '⚽' },
  { name: 'Liga MX', emoji: '🇲🇽' },
  { name: 'CEBL', emoji: '🏀' },
  { name: 'NHL (AHL)', emoji: '🏒' },
]

function GuestWelcome({ leagueCounts }: { leagueCounts: Record<string, number> }) {
  return (
    <div className="min-h-screen" style={{ background: '#09090b' }}>
      <SiteHeader isGuest />

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <p className="text-blue-400 text-sm font-bold tracking-widest uppercase mb-4">Your personal sports dashboard</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-5">
          Follow every team.<br />
          <span style={{ color: '#3b82f6' }}>Never miss a game.</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Track live scores, schedules, and news for{' '}
          <span className="text-white font-semibold">381 teams across 19 leagues</span>{' '}
          — all in one place, personalised to you.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-white px-7 py-3.5 rounded-full transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
          >
            Get Started — It&apos;s Free
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white px-7 py-3.5 rounded-full transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Browse Teams
          </Link>
        </div>
      </div>

      {/* League tiles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <p className="text-zinc-600 text-xs font-bold tracking-widest uppercase mb-5">All leagues</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {FEATURED_LEAGUES.map(({ name, emoji }) => {
            const color = leagueColor(name)
            const count = leagueCounts[name] ?? 0
            return (
              <Link
                key={name}
                href={`/search?league=${encodeURIComponent(name)}`}
                className="group rounded-2xl px-4 py-4 flex flex-col gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${color}12 0%, rgba(255,255,255,0.03) 100%)`,
                  border: `1px solid ${color}30`,
                }}
              >
                <span className="text-2xl">{emoji}</span>
                <div>
                  <p className="text-white text-sm font-bold leading-tight">{name}</p>
                  {count > 0 && (
                    <p className="text-zinc-600 text-xs mt-0.5">{count} teams</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="border-t"
        style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-white font-bold text-xl mb-2">Ready to follow your teams?</p>
          <p className="text-zinc-500 text-sm mb-6">Sign in to save your picks and get a personalised dashboard.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-full transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
          >
            Sign In with Email
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Authenticated dashboard ──────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl h-44 animate-pulse" style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.06)' }} />
  )
}

function Dashboard() {
  const [myTeams, setMyTeams] = useState<TeamSummary[]>([])
  const [teamData, setTeamData] = useState<Record<string, Team>>({})
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)

  const load = useCallback(async () => {
    try {
      const [settingsRes, dashRes] = await Promise.all([
        fetch('/api/settings', { cache: 'no-store' }),
        fetch('/api/dashboard', { cache: 'no-store' }),
      ])
      const settings = settingsRes.ok ? await settingsRes.json() : {}
      const dash = dashRes.ok ? await dashRes.json() : {}

      const picked: TeamSummary[] = settings.teams ?? []
      const allData: Team[] = dash.teams ?? []

      const map: Record<string, Team> = {}
      for (const t of allData) map[t.name] = t

      setMyTeams(picked)
      setTeamData(map)
      setLive(hasLiveGames(picked, map))
    } catch {
      // retain stale state
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const interval = setInterval(load, live ? 30_000 : 300_000)
    return () => clearInterval(interval)
  }, [live, load])

  return (
    <div className="min-h-screen" style={{ background: '#09090b' }}>
      <SiteHeader live={live} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && myTeams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-white font-bold text-xl mb-2">Your dashboard is empty</h2>
            <p className="text-zinc-500 text-sm mb-8 max-w-xs leading-relaxed">
              Add teams from any league to track their scores, schedules, and news here.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-full transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Your Teams
            </Link>
          </div>
        )}

        {!loading && myTeams.length > 0 && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-white">Your Teams</h1>
              <Link href="/search" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                Manage →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {myTeams.map((summary) => {
                const data = teamData[summary.name]
                if (!data) {
                  return (
                    <div
                      key={summary.name}
                      className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
                      style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="w-12 h-12 rounded-xl shrink-0 animate-pulse" style={{ background: 'rgba(255,255,255,0.07)' }} />
                      <div className="flex-1">
                        <div className="h-3.5 rounded w-36 mb-2 animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
                        <div className="h-2.5 rounded w-20 animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                      </div>
                    </div>
                  )
                }
                return <TeamCard key={data.name} team={data} />
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Root page ────────────────────────────────────────────────────────────────

export default function RootPage() {
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [leagueCounts, setLeagueCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    // Check auth and load team index in parallel
    Promise.all([
      fetch('/api/auth/status').then((r) => r.ok ? r.json() : { authenticated: false }),
      fetch('/api/teams').then((r) => r.ok ? r.json() : { teams: [] }),
    ]).then(([auth, teamsData]) => {
      // Build per-league counts for the guest tiles
      const teams: TeamSummary[] = Array.isArray(teamsData) ? teamsData : teamsData.teams ?? []
      const counts: Record<string, number> = {}
      for (const t of teams) counts[t.league] = (counts[t.league] ?? 0) + 1
      setLeagueCounts(counts)
      setAuthState(auth.authenticated ? 'user' : 'guest')
    }).catch(() => {
      setAuthState('guest')
    })
  }, [])

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090b' }}>
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (authState === 'guest') {
    return <GuestWelcome leagueCounts={leagueCounts} />
  }

  return <Dashboard />
}
