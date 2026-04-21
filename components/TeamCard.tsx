import Link from 'next/link'
import type { Team } from '@/lib/types'
import { teamPath, formatGameDate, calcRecord, recordStr, leagueColor, isLive } from '@/lib/utils'
import TeamLogo from './TeamLogo'
import LeagueBadge from './LeagueBadge'
import ResultBadge from './ResultBadge'

interface Props {
  team: Team
}

export default function TeamCard({ team }: Props) {
  const path = teamPath(team)
  const color = leagueColor(team.league)

  const allGames = [...(team.recent_games ?? []), ...(team.games ?? [])]
  const recentGames = team.recent_games ?? []
  const upcomingGames = team.upcoming_games ?? []

  const liveGame = allGames.find((g) => isLive(g.status))
  const lastGame = recentGames.find((g) => ['W', 'L', 'T'].includes((g.result ?? '').toUpperCase()))
  const nextGame = upcomingGames[0] ?? null

  const rec = calcRecord(recentGames)

  const topNews = (team.news ?? [])[0] ?? null

  return (
    <Link href={path} className="block group focus:outline-none">
      <div
        className="rounded-2xl overflow-hidden transition-all duration-200 group-hover:scale-[1.01] group-hover:shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, #1a1a1a 0%, #111111 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderLeft: `3px solid ${color}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <TeamLogo abbrev={team.abbrev} league={team.league} size={44} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-base leading-tight">{team.name}</span>
                {liveGame && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-500/15 border border-orange-500/25 px-1.5 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse inline-block" />
                    LIVE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <LeagueBadge league={team.league} size="sm" />
                {rec.total > 0 && (
                  <span className="text-xs text-zinc-400">{recordStr(rec)} this run</span>
                )}
              </div>
            </div>
          </div>
          <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Live game score */}
        {liveGame && (
          <div className="mx-4 mb-3 rounded-xl px-3 py-2.5 bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-orange-400 tracking-wider uppercase">Live Now</span>
                <div className="text-white font-semibold text-sm mt-0.5">
                  {liveGame.is_home ? 'vs' : '@'} {liveGame.opponent}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-black text-xl tabular-nums">
                  {liveGame.team_score ?? 0}–{liveGame.opponent_score ?? 0}
                </div>
                <div className="text-orange-400 text-xs font-medium">{liveGame.status}</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent / Next games */}
        {!liveGame && (lastGame || nextGame) && (
          <div className="mx-4 mb-3 rounded-xl overflow-hidden divide-y divide-white/5" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {lastGame && (
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <ResultBadge result={lastGame.result} status={lastGame.status} />
                  <span className="text-zinc-400 text-xs">{formatGameDate(lastGame.date)}</span>
                  <span className="text-zinc-300 text-xs">{lastGame.is_home ? 'vs' : '@'} {lastGame.opponent}</span>
                </div>
                <span className="text-white text-xs font-bold tabular-nums">
                  {lastGame.team_score}–{lastGame.opponent_score}
                </span>
              </div>
            )}
            {nextGame && (
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-zinc-500 w-4 text-center">→</span>
                  <span className="text-zinc-400 text-xs">{formatGameDate(nextGame.date)}</span>
                  <span className="text-zinc-300 text-xs">{nextGame.is_home ? 'vs' : '@'} {nextGame.opponent}</span>
                </div>
                <span className="text-zinc-500 text-xs">TBD</span>
              </div>
            )}
          </div>
        )}

        {/* No games state */}
        {!liveGame && !lastGame && !nextGame && (
          <div className="mx-4 mb-3 px-3 py-2 rounded-xl text-zinc-500 text-xs text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
            No recent schedule data
          </div>
        )}

        {/* Top news */}
        {topNews && (
          <div
            className="mx-4 mb-4 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(topNews.url, '_blank', 'noopener') }}
          >
            <p className="text-zinc-300 text-xs leading-snug line-clamp-2">{topNews.title}</p>
            <p className="text-zinc-600 text-[10px] mt-1">{topNews.source} · {topNews.age}</p>
          </div>
        )}
      </div>
    </Link>
  )
}
