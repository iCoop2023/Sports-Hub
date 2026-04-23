'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { Team, Game, NewsArticle } from '@/lib/types'
import {
  formatGameDate,
  calcRecord,
  recordStr,
  leagueColor,
  teamColor,
  isLive,
  isCompleted,
} from '@/lib/utils'
import TeamLogo from '@/components/TeamLogo'
import LeagueBadge from '@/components/LeagueBadge'
import ResultBadge from '@/components/ResultBadge'

function slugToTeamName(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function TeamPage() {
  const params = useParams<{ league: string; slug: string }>()
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const teamName = slugToTeamName(params.slug)

  useEffect(() => {
    fetch(`/api/team/${encodeURIComponent(teamName)}`, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('not found')
        return r.json()
      })
      .then(setTeam)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [teamName])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#09090b' }}>
        <PageHeader name={teamName} />
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !team) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#09090b' }}>
        <PageHeader name={teamName} />
        <div className="text-center py-24">
          <p className="text-zinc-400 text-sm">Could not load team data.</p>
          <Link href="/" className="mt-4 inline-block text-blue-400 text-sm">← Back to dashboard</Link>
        </div>
      </div>
    )
  }

  const allGames = [
    ...(team.recent_games ?? []),
    ...(team.upcoming_games ?? []),
    ...(team.games ?? []),
  ]
  const uniqueGames = Array.from(new Map(allGames.map((g) => [g.id ?? g.date + g.opponent, g])).values())
  const sortedGames = uniqueGames.sort((a, b) => a.date.localeCompare(b.date))

  const rec = calcRecord([...team.recent_games ?? [], ...team.games ?? []])
  const color = teamColor(team.abbrev, team.league, leagueColor(team.league))
  const liveGame = uniqueGames.find((g) => isLive(g.status))

  return (
    <div className="min-h-screen" style={{ background: '#09090b' }}>
      <PageHeader name={team.name} />

      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${color}18 0%, transparent 100%)` }}
      >
        <div className="max-w-4xl mx-auto px-4 pt-6 pb-8">
          <div className="flex items-start gap-4">
            <TeamLogo abbrev={team.abbrev} league={team.league} name={team.name} size={72} />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white">{team.name}</h1>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <LeagueBadge league={team.league} />
                {liveGame && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-500/15 border border-orange-500/25 px-1.5 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse inline-block" />
                    LIVE NOW
                  </span>
                )}
              </div>
              {rec.total > 0 && (
                <div className="mt-3 flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-xl font-black text-white tabular-nums">{recordStr(rec)}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Recent Record</div>
                  </div>
                  {rec.total > 0 && (
                    <div className="text-center">
                      <div className="text-xl font-black tabular-nums" style={{ color }}>
                        {Math.round((rec.wins / rec.total) * 100)}%
                      </div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Win Rate</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Live game banner */}
          {liveGame && (
            <div
              className="mt-5 rounded-2xl px-4 py-3 border border-orange-500/30"
              style={{ background: 'rgba(249,115,22,0.1)' }}
            >
              <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">In Progress</div>
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">
                  {liveGame.is_home ? 'vs' : '@'} {liveGame.opponent}
                </span>
                <span className="text-white font-black text-2xl tabular-nums">
                  {liveGame.team_score ?? 0} – {liveGame.opponent_score ?? 0}
                </span>
              </div>
              <div className="text-orange-400 text-xs mt-1">{liveGame.status}</div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-12 space-y-8">
        {/* Schedule */}
        <section>
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Schedule</h2>
          {sortedGames.length === 0 ? (
            <p className="text-zinc-600 text-sm">No schedule data available</p>
          ) : (
            <div
              className="rounded-2xl overflow-hidden divide-y"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.07)' }}
            >
              {sortedGames.map((game, i) => (
                <GameRow key={game.id ?? i} game={game} />
              ))}
            </div>
          )}
        </section>

        {/* News */}
        {(team.news ?? []).length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">News</h2>
            <div className="flex flex-col gap-2">
              {team.news.slice(0, 10).map((article, i) => (
                <NewsRow key={i} article={article} color={color} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function PageHeader({ name }: { name: string }) {
  return (
    <header className="sticky top-0 z-40 border-b" style={{ background: 'rgba(9,9,11,0.92)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.07)' }}>
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
        <Link href="/" className="text-zinc-400 hover:text-white transition-colors shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="text-white font-bold text-base truncate">{name}</span>
      </div>
    </header>
  )
}

function GameRow({ game }: { game: Game }) {
  const live = isLive(game.status)
  const done = isCompleted(game.status)
  const isUpcoming = !live && !done

  return (
    <div className="flex items-center px-4 py-3 gap-3">
      <div className="w-8 flex justify-center shrink-0">
        {live ? (
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse mt-1" />
        ) : done ? (
          <ResultBadge result={game.result} status={game.status} />
        ) : (
          <span className="text-zinc-600 text-xs">–</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-zinc-500 text-xs">{game.is_home ? 'vs' : '@'}</span>
          <span className="text-white font-medium truncate">{game.opponent}</span>
        </div>
        <div className="text-zinc-600 text-xs mt-0.5">{formatGameDate(game.date)}</div>
      </div>

      <div className="text-right shrink-0">
        {live && (
          <span className="text-orange-400 font-black tabular-nums">
            {game.team_score ?? 0}–{game.opponent_score ?? 0}
          </span>
        )}
        {done && (
          <span className="text-white font-bold tabular-nums text-sm">
            {game.team_score}–{game.opponent_score}
          </span>
        )}
        {isUpcoming && (
          <span className="text-zinc-600 text-xs">{game.status || 'Scheduled'}</span>
        )}
      </div>
    </div>
  )
}

function NewsRow({ article, color }: { article: NewsArticle; color: string }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-white/[0.04] transition-colors group"
      style={{ border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div
        className="w-1 self-stretch rounded-full shrink-0 mt-0.5"
        style={{ background: color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-zinc-200 text-sm leading-snug group-hover:text-white transition-colors line-clamp-2">
          {article.title}
        </p>
        <p className="text-zinc-600 text-xs mt-1.5">
          {article.source} · {article.age}
        </p>
      </div>
      <svg className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}
