'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Mode = 'login' | 'register' | 'forgot'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (mode === 'forgot') {
      if (!email.trim()) return
      setLoading(true)
      try {
        await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        })
        setResetSent(true)
      } catch {
        setError('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
      return
    }

    if (!email.trim() || !password) return
    if (mode === 'register' && password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      if (res.ok) {
        router.replace('/')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.detail ?? 'Something went wrong. Try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function switchMode(m: Mode) {
    setMode(m)
    setError('')
    setResetSent(false)
    setPassword('')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#09090b' }}>
      <Link href="/" className="text-zinc-600 hover:text-zinc-400 text-sm mb-10 transition-colors">
        ← Back to Sports Hub
      </Link>

      <div className="w-full max-w-sm">
        {mode === 'forgot' ? (
          /* ── Forgot password view ── */
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-white mb-1">Reset password</h1>
              <p className="text-zinc-500 text-sm">We&apos;ll email you a reset link.</p>
            </div>

            {resetSent ? (
              <div className="text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}
                >
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-zinc-300 text-sm mb-1">Check your inbox</p>
                <p className="text-zinc-600 text-xs">If that email is registered you&apos;ll receive a link shortly.</p>
                <button
                  onClick={() => switchMode('login')}
                  className="mt-6 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                  autoFocus
                  className="w-full text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                {error && <p className="text-red-400 text-sm px-1">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full text-white font-bold py-3 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="w-full text-zinc-500 hover:text-zinc-300 text-sm py-2 transition-colors"
                >
                  ← Back to Sign In
                </button>
              </form>
            )}
          </>
        ) : (
          /* ── Sign In / Register view ── */
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-white mb-1">
                {mode === 'login' ? 'Sign in to Sports Hub' : 'Create your account'}
              </h1>
              <p className="text-zinc-500 text-sm">Save your teams. Follow every game.</p>
            </div>

            {/* Tab switcher */}
            <div
              className="flex rounded-xl p-1 mb-6"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
                  style={mode === m
                    ? { background: 'rgba(255,255,255,0.1)', color: '#fff' }
                    : { color: '#71717a' }}
                >
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                autoFocus
                className="w-full text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Create a password (8+ chars)' : 'Password'}
                required
                className="w-full text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />

              {error && <p className="text-red-400 text-sm px-1">{error}</p>}

              <button
                type="submit"
                disabled={loading || !email.trim() || !password}
                className="w-full text-white font-bold py-3 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
              >
                {loading ? '…' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {mode === 'login' && (
              <div className="text-center mt-4">
                <button
                  onClick={() => switchMode('forgot')}
                  className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
