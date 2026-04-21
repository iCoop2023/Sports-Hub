import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // In development, proxy /api/* to the Python FastAPI backend.
  // In production on Vercel, vercel.json routes /api/* directly to api/main.py.
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) return []
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
