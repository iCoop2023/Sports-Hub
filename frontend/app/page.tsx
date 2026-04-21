'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { Team } from '@/lib/types'
import { isLive } from '@/lib/utils'
import TeamCard from '@/components/TeamCard'

function hasLiveGame(teams: Team[]): boolean {
  return teams.some((t) =>
    [...(t.recent_games ?? []), ...(t.games ?? [])].some((g) => isLive(g.status))
  )
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl h-44 animate-pulse"
      style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.05)' }}
    />
  )
}

export default function Dashboard() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [live, setLive] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        const fetched: Team[] = data.teams ?? []
        setTeams(fetched)
        setLive(hasLiveGame(fetched))
        setLastUpdated(new Date())
      }
    } catch {
      // keep showing last data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Poll every 30s when live, 5min otherwise
  useEffect(() => {
    const interval = setInterval(load, live ? 30_000 : 300_000)
    return () => clearInterval(interval)
  }, [live, load])

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

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
            Add Team
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Date + refresh */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-black text-white">Your Teams</h1>
            <p className="text-zinc-500 text-sm mt-0.5">{today}</p>
          </div>
          {lastUpdated && (
            <button
              onClick={load}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1 p-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          )}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && teams.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-white font-bold text-xl mb-2">No teams yet</h2>
            <p className="text-zinc-500 text-sm mb-6 max-w-xs mx-auto">
              Search for any team from any league to start tracking their scores, news, and stats
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-full transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              Find Your Teams
            </Link>
          </div>
        )}

        {/* Team cards */}
        {!loading && teams.length > 0 && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {teams.map((team) => (
              <TeamCard key={team.name} team={team} />
            ))}

            <Link
              href="/search"
              className="flex items-center justify-center gap-2 rounded-2xl py-4 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              style={{ border: '1px dashed rgba(255,255,255,0.12)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add another team
            </Link>
          </div>
        )}
      </main>

      <div className="h-8" />
    </div>
  )
}
