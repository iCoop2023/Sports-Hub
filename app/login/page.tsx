'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (res.ok) {
        setSent(true)
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#09090b' }}>
      <Link href="/" className="text-zinc-600 hover:text-zinc-400 text-sm mb-10 transition-colors">
        ← Back to Sports Hub
      </Link>

      {sent ? (
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Check your inbox</h2>
          <p className="text-zinc-400 text-sm mb-1">Magic link sent to</p>
          <p className="text-white font-semibold text-sm">{email}</p>
          <p className="text-zinc-600 text-xs mt-4">Click the link in the email to sign in. It expires in 1 hour.</p>
          <button
            onClick={() => { setSent(false); setEmail('') }}
            className="mt-6 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white mb-1">Sign in to Sports Hub</h1>
            <p className="text-zinc-500 text-sm">Save your teams. No password needed.</p>
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
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />

            {error && (
              <p className="text-red-400 text-sm px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full text-white font-bold py-3 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
            >
              {loading ? 'Sending…' : 'Send Magic Link'}
            </button>
          </form>

          <p className="text-zinc-700 text-xs text-center mt-5 leading-relaxed">
            We&apos;ll email you a sign-in link. No password, no spam.
          </p>
        </div>
      )}
    </div>
  )
}
