'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const errorCode = params.get('error')
    const errorDescription = params.get('error_description')

    if (errorCode) {
      setErrorMsg(errorDescription ?? errorCode)
      setStatus('error')
      return
    }

    if (!accessToken || !refreshToken) {
      setErrorMsg('Missing tokens in the magic link. Try signing in again.')
      setStatus('error')
      return
    }

    fetch('/api/auth/callback', {
      method: 'POST',
      headers: {
        'access-token': accessToken,
        'refresh-token': refreshToken,
      },
    })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => Promise.reject(d.detail ?? 'Auth failed'))
        router.replace('/')
      })
      .catch((err) => {
        setErrorMsg(typeof err === 'string' ? err : 'Sign-in failed. Please try again.')
        setStatus('error')
      })
  }, [router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#09090b' }}>
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-400 text-sm">Signing you in…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#09090b' }}>
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
      >
        <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <h2 className="text-white font-bold text-xl mb-2">Sign-in failed</h2>
      <p className="text-zinc-400 text-sm text-center max-w-xs mb-6">{errorMsg}</p>
      <a
        href="/login"
        className="text-sm font-bold text-white px-6 py-3 rounded-full transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
      >
        Try again
      </a>
    </div>
  )
}
