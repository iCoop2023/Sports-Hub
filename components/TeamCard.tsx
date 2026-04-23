import Link from 'next/link'
import type { Team, Game } from '@/lib/types'
import { teamPath, formatGameDate, calcRecord, recordStr, leagueColor, teamColor, isLive } from '@/lib/utils'
import TeamLogo from './TeamLogo'
import LeagueBadge from './LeagueBadge'

interface Props {
  team: Team
}

function ResultBubble({ result }: { result: string }) {
  const r = (result ?? '').toUpperCase()
  const base = 'w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-black shrink-0'
  if (r === 'W') return <span className={base} style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', color: '#22c55e' }}>W</span>
  if (r === 'L') return <span className={base} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444' }}>L</span>
  if (r === 'T') return <span className={base} style={{ background: 'rgba(113,113,122,0.15)', border: '1px solid rgba(113,113,122,0.35)', color: '#a1a1aa' }}>T</span>
  return <span className={`${base} opacity-0`}>·</span>
}

function GameRow({ game, isNext }: { game: Game; isNext?: boolean }) {
  const atVs = game.is_home ? 'vs' : '@'
  const dateLabel = formatGameDate(game.date)

  if (isNext) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-2.5">
        <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
          <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </span>
        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          <span className="text-[11px] font-semibold" style={{ color: '#3b82f6' }}>{dateLabel}</span>
          <span className="text-zinc-600 text-[11px]">·</span>
          <span className="text-zinc-400 text-[12px] truncate">{atVs} {game.opponent}</span>
        </div>
        <span className="text-zinc-600 text-xs shrink-0 font-medium">TBD</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5">
      <ResultBubble result={game.result} />
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        <span className="text-zinc-500 text-[11px] shrink-0">{dateLabel}</span>
        <span className="text-zinc-600 text-[11px]">·</span>
        <span className="text-zinc-300 text-[12px] truncate">{atVs} {game.opponent}</span>
      </div>
      <span className="text-white text-[13px] font-bold tabular-nums shrink-0">
        {game.team_score}–{game.opponent_score}
      </span>
    </div>
  )
}

export default function TeamCard({ team }: Props) {
  const path = teamPath(team)
  const color = teamColor(team.abbrev, team.league, leagueColor(team.league))

  const allGames = [...(team.recent_games ?? []), ...(team.games ?? [])]
  const recentGames = team.recent_games ?? []
  const upcomingGames = team.upcoming_games ?? []

  const liveGame = allGames.find((g) => isLive(g.status))
  const lastGame = recentGames.filter((g) => ['W', 'L', 'T'].includes((g.result ?? '').toUpperCase())).at(-1) ?? null
  const nextGame = upcomingGames[0] ?? null
  const rec = calcRecord(allGames.filter((g) => ['W', 'L', 'T'].includes((g.result ?? '').toUpperCase())))
  const topNews = (team.news ?? [])[0] ?? null

  return (
    <Link href={path} className="block group focus:outline-none">
      <article
        className="rounded-2xl overflow-hidden transition-all duration-200 group-hover:shadow-2xl group-hover:-translate-y-px"
        style={{
          background: `linear-gradient(160deg, ${color}0e 0%, #1c1c1e 35%, #161618 100%)`,
          border: '1px solid rgba(255,255,255,0.08)',
          borderTop: `2px solid ${color}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <TeamLogo abbrev={team.abbrev} league={team.league} name={team.name} size={48} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-bold text-[15px] leading-tight truncate">{team.name}</span>
              {liveGame && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/25 px-1.5 py-0.5 rounded-full shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <LeagueBadge league={team.league} size="sm" />
              {rec.total > 0 && (
                <span className="text-[11px] text-zinc-500 font-medium">{recordStr(rec)}</span>
              )}
            </div>
          </div>
          <svg
            className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Live score */}
        {liveGame && (
          <div className="mx-4 mb-3 rounded-xl px-4 py-3" style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black tracking-widest text-orange-400 uppercase mb-1">In Progress</p>
                <p className="text-zinc-200 text-sm font-semibold">
                  {liveGame.is_home ? 'vs' : '@'} {liveGame.opponent}
                </p>
                <p className="text-zinc-500 text-xs mt-0.5">{liveGame.status}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-black text-3xl tabular-nums leading-none">
                  {liveGame.team_score ?? 0}
                  <span className="text-zinc-600 mx-1">–</span>
                  {liveGame.opponent_score ?? 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Games */}
        {!liveGame && (lastGame || nextGame) && (
          <div
            className="mx-4 mb-3 rounded-xl overflow-hidden divide-y"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {lastGame && <GameRow game={lastGame} />}
            {nextGame && <GameRow game={nextGame} isNext />}
          </div>
        )}

        {/* Empty schedule */}
        {!liveGame && !lastGame && !nextGame && (
          <div className="mx-4 mb-3 px-4 py-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-zinc-600 text-xs">No schedule data available</span>
          </div>
        )}

        {/* News */}
        {topNews && (
          <div
            className="mx-4 mb-4 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/[0.03] transition-colors"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(topNews.url, '_blank', 'noopener') }}
          >
            <p className="text-zinc-400 text-[12px] leading-snug line-clamp-1">{topNews.title}</p>
            <p className="text-zinc-600 text-[11px] mt-0.5">{topNews.source} · {topNews.age}</p>
          </div>
        )}
      </article>
    </Link>
  )
}
