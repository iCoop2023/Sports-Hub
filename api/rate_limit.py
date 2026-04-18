"""Shared rate limiter for the API.

Uses slowapi's in-memory store. On Vercel (serverless) each function
instance has its own memory, so the limit is per-instance — an attacker
who hits a freshly-cold-started instance could get one extra window.
That's fine as a first line of defense; a full fix would back this with
Redis/Upstash.
"""

from fastapi import Request
from slowapi import Limiter


def _client_ip(request: Request) -> str:
    """Resolve the real client IP, preferring X-Forwarded-For from Vercel's edge.

    Vercel puts the original client at the left of X-Forwarded-For. Falling
    back to request.client.host covers local dev (where there's no proxy).
    """
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


limiter = Limiter(key_func=_client_ip)
