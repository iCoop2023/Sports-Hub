import { leagueColor, leagueShort } from '@/lib/utils'

interface Props {
  league: string
  size?: 'sm' | 'md'
}

export default function LeagueBadge({ league, size = 'md' }: Props) {
  const color = leagueColor(league)
  const label = leagueShort(league)
  const cls =
    size === 'sm'
      ? 'text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wider'
      : 'text-xs px-2 py-1 rounded-md font-bold tracking-wider'

  return (
    <span
      className={cls}
      style={{ backgroundColor: color + '22', color, border: `1px solid ${color}44` }}
    >
      {label}
    </span>
  )
}
