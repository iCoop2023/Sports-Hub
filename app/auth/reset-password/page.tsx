'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Phase = 'loading' | 'form' | 'success' | 'error'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('loading')
  const [initError, setInitError] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Step 1: exchange the recovery tokens from the URL fragment for session cookies
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const errorCode = params.get('error')
    const errorDescription = params.get('error_description')

    if (errorCode) {
      setInitError(errorDescription ?? errorCode)
      setPhase('error')
      return
    }

    if (!accessToken || !refreshToken) {
      setInitError('Invalid reset link. Please request a new one.')
      setPhase('error')
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
        if (!res.ok) return res.json().then((d) => Promise.reject(d.detail ?? 'Session error'))
        setPhase('form')
      })
      .catch((err) => {
        setInitError(typeof err === 'string' ? err : 'Reset link is invalid or expired.')
        setPhase('error')
      })
  }, [])

  // Step 2: submit the new password
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setFormError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setFormError('Passwords do not match.'); return }
    setSubmitting(true)
    setFormError('')
    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setPhase('success')
        setTimeout(() => router.replace('/'), 2000)
      } else {
        const d = await res.json().catch(() => ({}))
        setFormError(d.detail ?? 'Failed to update password. Try again.')
      }
    } catch {
      setFormError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#09090b' }}>
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-400 text-sm">Verifying reset link…</p>
      </div>
    )
  }

  if (phase === 'error') {
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
        <h2 className="text-white font-bold text-xl mb-2">Link expired</h2>
        <p className="text-zinc-400 text-sm text-center max-w-xs mb-6">{initError}</p>
        <Link
          href="/login"
          className="text-sm font-bold text-white px-6 py-3 rounded-full transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
        >
          Back to Sign In
        </Link>
      </div>
    )
  }

  if (phase === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#09090b' }}>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}
        >
          <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-white font-bold text-xl mb-2">Password updated</h2>
        <p className="text-zinc-400 text-sm">Redirecting you to your dashboard…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#09090b' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white mb-1">Set new password</h1>
          <p className="text-zinc-500 text-sm">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (8+ characters)"
            required
            autoFocus
            className="w-full text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            required
            className="w-full text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />

          {formError && <p className="text-red-400 text-sm px-1">{formError}</p>}

          <button
            type="submit"
            disabled={submitting || !password || !confirm}
            className="w-full text-white font-bold py-3 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
          >
            {submitting ? 'Updating…' : 'Update Password'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/login" className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
