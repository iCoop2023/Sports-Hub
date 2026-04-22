import { leagueColor } from '@/lib/utils'

interface Props {
  abbrev: string
  league: string
  size?: number
}

export default function TeamLogo({ abbrev, league, size = 48 }: Props) {
  const color = leagueColor(league)
  const letters = (abbrev ?? '?').slice(0, 3).toUpperCase()

  return (
    <div
      className="flex items-center justify-center rounded-xl font-black shrink-0 select-none"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}33, ${color}11)`,
        border: `2px solid ${color}44`,
        color,
        fontSize: size * 0.3,
        letterSpacing: '-0.03em',
      }}
    >
      {letters}
    </div>
  )
}
