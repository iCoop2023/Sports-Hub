'use client'

import { useState } from 'react'
import { leagueColor } from '@/lib/utils'
import { espnLogoUrl, teamColor } from '@/lib/logos'

interface Props {
  abbrev: string
  league: string
  name?: string   // used to resolve soccer team IDs
  size?: number
}

export default function TeamLogo({ abbrev, league, name, size = 48 }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const fallbackColor = leagueColor(league)
  const color = teamColor(abbrev, league, fallbackColor)
  const letters = (abbrev ?? '?').slice(0, 3).toUpperCase()
  const logoUrl = espnLogoUrl(abbrev, league, name)

  if (logoUrl && !imgFailed) {
    return (
      <div
        className="flex items-center justify-center rounded-xl shrink-0 overflow-hidden"
        style={{
          width: size,
          height: size,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: Math.round(size * 0.08),
        }}
      >
        <img
          src={logoUrl}
          alt={abbrev}
          width={size}
          height={size}
          onError={() => setImgFailed(true)}
          style={{ objectFit: 'contain', width: '100%', height: '100%' }}
        />
      </div>
    )
  }

  // Text fallback — shown when no ESPN URL exists or the image 404'd
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
