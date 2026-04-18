#!/usr/bin/env python3
"""
Fetch team news using real data sources (local/national outlets, league feeds, ESPN).
Falls back to minimal placeholders only when nothing else is available.
"""

import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import quote_plus

import feedparser
import requests

BASE_DIR = Path(__file__).parent.parent
TEAM_METADATA_FILE = BASE_DIR / "data" / "team_metadata.json"

_metadata_bundle: Dict[str, Dict] = {
    "TEAM_METADATA": {},
    "LOCAL_NEWS_SOURCES": {},
    "NATIONAL_NEWS_SOURCES": {},
    "LEAGUE_NEWS_SOURCES": {}
}
if TEAM_METADATA_FILE.exists():
    try:
        with open(TEAM_METADATA_FILE) as f:
            _metadata_bundle = json.load(f)
    except Exception as exc:
        print(f"Warning: failed to load team metadata: {exc}")

TEAM_METADATA: Dict[str, Dict] = _metadata_bundle.get("TEAM_METADATA", {})
LOCAL_NEWS_SOURCES: Dict[str, List[Dict]] = _metadata_bundle.get("LOCAL_NEWS_SOURCES", {})
NATIONAL_NEWS_SOURCES: Dict[str, List[Dict]] = _metadata_bundle.get("NATIONAL_NEWS_SOURCES", {})
LEAGUE_NEWS_SOURCES: Dict[str, List[Dict]] = _metadata_bundle.get("LEAGUE_NEWS_SOURCES", {})

GLOBAL_NEWS_SOURCES = [
    {"name": "TSN", "domain": "tsn.ca", "priority": 3},
    {"name": "Sportsnet", "domain": "sportsnet.ca", "priority": 3},
    {"name": "CBC Sports", "domain": "cbc.ca/sports", "priority": 3},
    {"name": "ESPN", "domain": "espn.com", "priority": 4},
    {"name": "Sports Illustrated", "domain": "si.com", "priority": 4},
    {"name": "The Athletic", "domain": "theathletic.com", "priority": 4}
]

# ---------------------------------------------------------------------------
# ESPN league feeds and team ids
# ---------------------------------------------------------------------------
ESPN_FEEDS = {
    "NHL": "https://site.web.api.espn.com/apis/site/v2/sports/hockey/nhl/news?limit=75",
    "MLB": "https://site.web.api.espn.com/apis/site/v2/sports/baseball/mlb/news?limit=75",
    "NBA": "https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/news?limit=75",
    "NFL": "https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/news?limit=75",
    "La Liga": "https://site.web.api.espn.com/apis/site/v2/sports/soccer/esp.1/news?limit=75"
}

ESPN_TEAM_IDS = {
    "Edmonton Oilers": 6,
    "Pittsburgh Penguins": 16,
    "Toronto Blue Jays": 14,
    "Kansas City Chiefs": 12,
    "Toronto Raptors": 28,
    "Real Madrid": 86
}

# ---------------------------------------------------------------------------
# RSS feeds for leagues not covered by ESPN
# ---------------------------------------------------------------------------
RSS_FEEDS = {
    "Edmonton Oil Kings": "https://chl.ca/whl-oilkings/feed/",
    "Calgary Hitmen": "https://chl.ca/whl-hitmen/feed/",
    "Red Deer Rebels": "https://chl.ca/whl-rebels/feed/",
    "Lethbridge Hurricanes": "https://chl.ca/whl-hurricanes/feed/",
    "Medicine Hat Tigers": "https://chl.ca/whl-tigers/feed/"
}

ESPN_CACHE_TTL = 300  # seconds
ESPN_CACHE: Dict[str, Dict] = {}


def humanize_age(published_iso: Optional[str]) -> str:
    if not published_iso:
        return "Just now"
    try:
        if published_iso.endswith("Z"):
            published_iso = published_iso[:-1] + "+00:00"
        published = datetime.fromisoformat(published_iso)
        if not published.tzinfo:
            published = published.replace(tzinfo=timezone.utc)
    except Exception:
        return "Just now"
    delta = datetime.now(timezone.utc) - published
    minutes = int(delta.total_seconds() // 60)
    if minutes < 1:
        return "Just now"
    if minutes < 60:
        return f"{minutes}m ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}h ago"
    days = hours // 24
    return f"{days}d ago"


def fetch_espn_feed(league: str) -> List[Dict]:
    feed_url = ESPN_FEEDS.get(league)
    if not feed_url:
        return []
    cache_entry = ESPN_CACHE.get(league)
    now = time.time()
    if cache_entry and (now - cache_entry["timestamp"]) < ESPN_CACHE_TTL:
        return cache_entry["articles"]
    try:
        resp = requests.get(feed_url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        articles = data.get("articles", [])
        ESPN_CACHE[league] = {"timestamp": now, "articles": articles}
        return articles
    except Exception as exc:
        print(f"ESPN feed fetch failed for {league}: {exc}")
        return []


def fetch_espn_team_news(team_name: str, league: str) -> List[Dict]:
    team_id = ESPN_TEAM_IDS.get(team_name)
    if not team_id:
        return []
    league_articles = fetch_espn_feed(league)
    team_articles: List[Dict] = []
    for article in league_articles:
        categories = article.get("categories", [])
        team_ids = {cat.get("teamId") for cat in categories if cat.get("type") == "team"}
        if team_id not in team_ids:
            continue
        link = (article.get("links", {}).get("web", {}) or {}).get("href", "")
        team_articles.append({
            "title": article.get("headline", ""),
            "url": link,
            "source": "ESPN",
            "age": humanize_age(article.get("lastModified") or article.get("published"))
        })
        if len(team_articles) == 5:
            break
    return team_articles


def fetch_rss_news(feed_url: str) -> List[Dict]:
    try:
        parsed = feedparser.parse(feed_url)
        articles: List[Dict] = []
        for entry in parsed.entries[:5]:
            published = entry.get("published") or entry.get("updated")
            articles.append({
                "title": entry.get("title", ""),
                "url": entry.get("link", ""),
                "source": parsed.feed.get("title", "RSS"),
                "age": humanize_age(entry.get("published")) if published else "Recently"
            })
        return articles
    except Exception as exc:
        print(f"RSS fetch failed for {feed_url}: {exc}")
        return []


def generate_placeholder_news(team_name: str, league: str) -> List[Dict]:
    """Build a small set of deterministic placeholder articles."""
    league_sources = {
        "NHL": "https://www.nhl.com",
        "MLB": "https://www.mlb.com",
        "NBA": "https://www.nba.com",
        "NFL": "https://www.nfl.com",
        "La Liga": "https://www.laliga.com",
        "WHL": "https://whl.ca",
        "CFL": "https://www.cfl.ca",
        "CEBL": "https://www.cebl.ca"
    }

    base_url = league_sources.get(league, f"https://www.google.com/search?q={quote_plus(team_name + ' news')}")
    schedule_url = f"https://www.google.com/search?q={quote_plus(team_name + ' schedule')}"
    roster_url = f"https://www.google.com/search?q={quote_plus(team_name + ' roster')}"

    placeholders = [
        {
            "title": f"Latest official {team_name} coverage",
            "url": base_url,
            "source": league or "Official",
            "age": "Updating"
        },
        {
            "title": f"{team_name} schedule, standings, and results",
            "url": schedule_url,
            "source": "Scoreboard",
            "age": "Updating"
        },
        {
            "title": f"{team_name} roster moves and player updates",
            "url": roster_url,
            "source": "Team Reports",
            "age": "Updating"
        },
        {
            "title": f"{team_name} community and local coverage",
            "url": base_url,
            "source": "Local",
            "age": "Updating"
        },
        {
            "title": f"Follow {team_name} for breaking news",
            "url": base_url,
            "source": "Newswire",
            "age": "Updating"
        }
    ]
    return placeholders


def ensure_min_articles(team_name: str, league: str, articles: List[Dict], minimum: int = 5) -> List[Dict]:
    """Pad article list with placeholders so UI always has content."""
    if len(articles) >= minimum:
        return articles
    placeholders = generate_placeholder_news(team_name, league)
    idx = 0
    while len(articles) < minimum:
        placeholder = placeholders[idx % len(placeholders)]
        # copy to avoid shared references
        articles.append({
            "title": placeholder["title"],
            "url": placeholder["url"],
            "source": placeholder["source"],
            "age": placeholder["age"]
        })
        idx += 1
    return articles


def get_team_metadata(team_name: str) -> Dict:
    return TEAM_METADATA.get(team_name, {})


def split_domain_path(domain: str) -> Tuple[str, str]:
    if not domain:
        return "", ""
    cleaned = domain.strip()
    if cleaned.startswith("http"):
        cleaned = cleaned.split("://", 1)[1]
    cleaned = cleaned.strip('/')
    if '/' in cleaned:
        base, path = cleaned.split('/', 1)
        return base, path.replace('/', ' ')
    return cleaned, ""


def get_google_locale(country: Optional[str]) -> Tuple[str, str, str]:
    mapping = {
        "Canada": ("en-CA", "CA"),
        "USA": ("en-US", "US"),
        "Spain": ("es-ES", "ES")
    }
    hl, gl = mapping.get(country or "", ("en-US", "US"))
    lang = hl.split('-')[0]
    return hl, gl, f"{gl}:{lang}"


def build_google_rss_url(team_name: str, domain: str, metadata: Dict) -> Optional[str]:
    base_domain, extra = split_domain_path(domain)
    if not base_domain:
        return None
    parts = [f'"{team_name}"', f"site:{base_domain}"]
    if extra:
        parts.append(extra)
    city = metadata.get("city")
    if city:
        parts.append(city)
    query = " ".join(part for part in parts if part)
    hl, gl, ceid = get_google_locale(metadata.get("country"))
    return (
        "https://news.google.com/rss/search?q="
        f"{quote_plus(query)}&hl={hl}&gl={gl}&ceid={ceid}"
    )


def fetch_google_news_for_source(
    team_name: str,
    source: Dict,
    metadata: Dict,
    max_articles: int = 2
) -> List[Dict]:
    url = build_google_rss_url(team_name, source.get("domain", ""), metadata)
    if not url:
        return []
    try:
        parsed = feedparser.parse(url, request_headers={"User-Agent": "Mozilla/5.0"})
    except Exception as exc:
        print(f"Google News fetch failed for {source.get('domain')}: {exc}")
        return []
    articles: List[Dict] = []
    entries = parsed.entries[:max_articles]
    for entry in entries:
        title = (entry.get("title") or "").strip()
        link = entry.get("link", "").strip()
        if not title or not link:
            continue
        published = entry.get("published") or entry.get("updated")
        articles.append({
            "title": title,
            "url": link,
            "source": source.get("name") or source.get("domain"),
            "age": humanize_age(published)
        })
    return articles


def derive_league_from_metadata(league: str, metadata: Dict) -> str:
    if league:
        return league
    if metadata.get("hockeytech_league") == "whl":
        return "WHL"
    if metadata.get("cebl_id"):
        return "CEBL"
    if metadata.get("cfl_code"):
        return "CFL"
    return league


def get_candidate_sources(team_name: str, league: str) -> Tuple[List[Dict], Dict]:
    metadata = get_team_metadata(team_name)
    resolved_league = derive_league_from_metadata(league, metadata)
    sources: List[Dict] = []
    seen_domains = set()

    def extend(items: Optional[List[Dict]]):
        if not items:
            return
        for src in sorted(items, key=lambda s: s.get("priority", 99)):
            domain = src.get("domain")
            if not domain or domain in seen_domains:
                continue
            seen_domains.add(domain)
            sources.append(src)

    city = metadata.get("city")
    if city:
        extend(LOCAL_NEWS_SOURCES.get(city))

    country = metadata.get("country")
    if country:
        extend(NATIONAL_NEWS_SOURCES.get(country))

    if resolved_league and LEAGUE_NEWS_SOURCES.get(resolved_league):
        extend(LEAGUE_NEWS_SOURCES.get(resolved_league))

    extend(GLOBAL_NEWS_SOURCES)
    return sources, metadata


def collect_curated_news(team_name: str, league: str) -> List[Dict]:
    sources, metadata = get_candidate_sources(team_name, league)
    articles: List[Dict] = []
    seen_urls = set()
    seen_titles = set()

    for source in sources:
        priority = source.get("priority", 99)
        per_source_limit = 2 if priority <= 1 else 1
        fetched = fetch_google_news_for_source(team_name, source, metadata, per_source_limit)
        for article in fetched:
            url = article.get("url")
            title = article.get("title")
            if not url or not title or url in seen_urls or title in seen_titles:
                continue
            articles.append(article)
            seen_urls.add(url)
            seen_titles.add(title)
            if len(articles) >= 5:
                return articles
    return articles


def search_team_news(team_name: str, league: str = "") -> List[Dict]:
    # 1. Team-specific RSS feeds (WHL, etc.)
    rss_url = RSS_FEEDS.get(team_name)
    if rss_url:
        rss_articles = fetch_rss_news(rss_url)
        if rss_articles:
            return ensure_min_articles(team_name, league, rss_articles)

    # 2. Curated local/national/league sources via Google News
    curated = collect_curated_news(team_name, league)
    if curated:
        return ensure_min_articles(team_name, league, curated)

    # 3. ESPN feeds for major leagues (fallback)
    espn_articles = fetch_espn_team_news(team_name, league)
    if espn_articles:
        return ensure_min_articles(team_name, league, espn_articles)

    # 4. Placeholder (rare)
    print(f"Falling back to placeholder news for {team_name}")
    return ensure_min_articles(team_name, league, [])


def fetch_news_for_teams(teams: List[Dict]) -> Dict[str, List[Dict]]:
    news_by_team: Dict[str, List[Dict]] = {}
    for team in teams:
        team_name = team.get("name", "")
        league = team.get("league", "")
        print(f"Fetching news for {team_name}...")
        news_by_team[team_name] = search_team_news(team_name, league)
    return news_by_team


if __name__ == "__main__":
    sample_teams = [
        {"name": "Edmonton Oilers", "league": "NHL"},
        {"name": "Toronto Blue Jays", "league": "MLB"},
        {"name": "Kansas City Chiefs", "league": "NFL"},
        {"name": "Toronto Raptors", "league": "NBA"},
        {"name": "Real Madrid", "league": "La Liga"},
        {"name": "Edmonton Oil Kings", "league": "WHL"}
    ]
    news = fetch_news_for_teams(sample_teams)
    for team, articles in news.items():
        print(f"\n{team}:")
        for article in articles:
            print(f" - {article['title']} ({article['source']})")
