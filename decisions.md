# Design Decisions

## Data Sources
**Decision:** Use official league APIs first, fallback to ESPN/The Sports DB.

**Rationale:**
- NHL API: Free, official, real-time
- MLB API: Official, robust
- ESPN API: Multi-sport coverage, good for CFL/CEBL/La Liga
- The Sports DB: Backup for obscure leagues

**Trade-off:** Multiple APIs = more complexity, but better data quality than web scraping.

---

## Storage Strategy
**Decision:** Local JSON cache with TTL (time-to-live) refresh.

**Rationale:**
- Avoid hammering APIs every query
- Fast local reads
- Can work offline (stale data better than nothing)

**Implementation:** 
- Cache in `data/cache/`
- Refresh every 15 minutes during active game times
- Daily refresh for schedules/standings

---

## Notification Delivery
**Decision:** WhatsApp as primary delivery channel.

**Rationale:**
- Already set up and working
- More reliable than email for time-sensitive alerts
- Easy to query on-demand

**Features:**
- Morning summary (8 AM): upcoming games today
- Live alerts: goals, final scores (opt-in)
- On-demand: "How did the Oilers do?" or "When's the next Chiefs game?"

---

## Tech Stack
**Decision:** Python + requests + OpenClaw skill wrapper.

**Rationale:**
- Python: Best API libraries, easy JSON handling
- requests: Simple, reliable HTTP client
- OpenClaw skill: Lets me invoke from chat naturally

**Alternative considered:** Node.js (rejected: Python has better sports API libraries)

---

## MVP Scope
**Decision:** Start with NHL Oilers scores only, expand after proof of concept.

**Why:**
1. Oilers are your #1 team
2. NHL API is well-documented
3. Validates architecture before adding 7 more teams

**Next:** Add Penguins → Blue Jays → Chiefs → others.
