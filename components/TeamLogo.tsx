'use client'

import { useState, useEffect } from 'react'
import { leagueColor } from '@/lib/utils'
import { espnLogoUrl, teamColor } from '@/lib/logos'

interface Props {
  abbrev: string
  league: string
  name?: string   // used for SportsDB fallback search
  size?: number
}

// Module-level cache so SportsDB is only queried once per team across all
// mounts/remounts in the same browser session.
const sportsdbCache = new Map<string, string | null>()

function useSportsdbLogo(name: string | undefined, enabled: boolean): string | null {
  const [url, setUrl] = useState<string | null>(() =>
    name && sportsdbCache.has(name) ? (sportsdbCache.get(name) ?? null) : null
  )

  useEffect(() => {
    if (!enabled || !name) return
    if (sportsdbCache.has(name)) {
      setUrl(sportsdbCache.get(name) ?? null)
      return
    }

    let cancelled = false
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)

    fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(name)}`,
      { signal: controller.signal },
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const badge: string | null = data?.teams?.[0]?.strTeamBadge ?? null
        sportsdbCache.set(name, badge)
        setUrl(badge)
      })
      .catch(() => {
        if (!cancelled) {
          sportsdbCache.set(name, null)
        }
      })
      .finally(() => clearTimeout(timer))

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [name, enabled])

  return url
}

function LogoImg({
  src,
  alt,
  size,
  onError,
}: {
  src: string
  alt: string
  size: number
  onError: () => void
}) {
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
        src={src}
        alt={alt}
        width={size}
        height={size}
        onError={onError}
        style={{ objectFit: 'contain', width: '100%', height: '100%' }}
      />
    </div>
  )
}

export default function TeamLogo({ abbrev, league, name, size = 48 }: Props) {
  const [espnFailed, setEspnFailed] = useState(false)
  const [sportsdbFailed, setSportsdbFailed] = useState(false)

  const fallbackColor = leagueColor(league)
  const color = teamColor(abbrev, league, fallbackColor)
  const letters = (abbrev ?? '?').slice(0, 3).toUpperCase()

  const espnUrl = espnLogoUrl(abbrev, league)

  // Trigger SportsDB lookup when:
  //   a) There's no ESPN URL for this league at all, OR
  //   b) The ESPN image failed to load
  const needsSportsdb = Boolean(name) && (!espnUrl || espnFailed)
  const sportsdbUrl = useSportsdbLogo(name, needsSportsdb)

  // 1. ESPN logo
  if (espnUrl && !espnFailed) {
    return (
      <LogoImg
        src={espnUrl}
        alt={abbrev}
        size={size}
        onError={() => setEspnFailed(true)}
      />
    )
  }

  // 2. SportsDB logo (loading or loaded)
  if (needsSportsdb && !sportsdbFailed) {
    if (sportsdbUrl) {
      return (
        <LogoImg
          src={sportsdbUrl}
          alt={abbrev}
          size={size}
          onError={() => setSportsdbFailed(true)}
        />
      )
    }
    // Still loading SportsDB — show a subtle pulse placeholder while we wait
    if (!sportsdbCache.has(name!)) {
      return (
        <div
          className="rounded-xl shrink-0 animate-pulse"
          style={{
            width: size,
            height: size,
            background: `${color}22`,
            border: `1px solid ${color}33`,
          }}
        />
      )
    }
  }

  // 3. Text fallback
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
