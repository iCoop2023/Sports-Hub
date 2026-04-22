interface Props {
  result: string
  status?: string
}

export default function ResultBadge({ result, status }: Props) {
  const r = (result ?? '').toUpperCase()
  const isLive = status && ['live', 'in progress', 'halftime', 'end of period', 'crit'].includes(status.toLowerCase())

  if (isLive) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
        LIVE
      </span>
    )
  }

  if (r === 'W') return <span className="text-[13px] font-black text-green-400 w-4 text-center">W</span>
  if (r === 'L') return <span className="text-[13px] font-black text-red-400 w-4 text-center">L</span>
  if (r === 'T') return <span className="text-[13px] font-black text-zinc-400 w-4 text-center">T</span>

  return null
}
