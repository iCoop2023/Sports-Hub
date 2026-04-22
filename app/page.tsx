'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { Team, TeamSummary } from '@/lib/types'
import { isLive } from '@/lib/utils'
import TeamCard from '@/components/TeamCard'

function hasLiveGames(picked: TeamSummary[], map: Record<string, Team>): boolean {
  return picked.some((s) => {
    const d = map[s.name]
    if (!d) return false
    return [...(d.recent_games ?? []), ...(d.games ?? [])].some((g) => isLive(g.status))
  })
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl h-40 animate-pulse"
      style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.06)' }}
    />
  )
}

export default function Dashboard() {
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
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ background: 'rgba(9,9,11,0.88)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-black tracking-tight text-white">Sports Hub</span>
            {live && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                LIVE
              </span>
            )}
          </div>
          <Link
            href="/search"
            className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            + Manage
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
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
              Add teams from any league — NHL, NBA, NFL, MLB, soccer, and more — to track their scores and news here.
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
          <div className="flex flex-col gap-4">
            {myTeams.map((summary) => {
              const data = teamData[summary.name]
              if (!data) {
                // Placeholder while data loads
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

            <Link
              href="/search"
              className="flex items-center justify-center gap-2 rounded-2xl py-4 text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
              style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Manage teams
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
