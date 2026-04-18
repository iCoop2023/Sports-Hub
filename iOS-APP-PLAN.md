# Sports Hub iOS App Plan

## Current Status
We have a working Python backend that:
- Fetches game data from NHL API and ESPN APIs
- Retrieves team news via web search
- Generates polished iOS-style graphics
- Caches data for performance

## iOS App Architecture

### Tech Stack Options

**Option 1: SwiftUI Native** (Recommended)
- Pure Swift/SwiftUI for native performance
- Use URLSession for API calls
- CoreData for local caching
- Push notifications via APNs
- Best user experience, App Store ready

**Option 2: React Native**
- Cross-platform (iOS + Android)
- Reuse web development skills
- Slightly less native feel
- Expo for rapid development

**Option 3: Flutter**
- Cross-platform with excellent performance
- Modern UI framework
- Growing ecosystem

### App Features (MVP)

#### Home Screen
- Card-based layout (like current graphic)
- Pull-to-refresh for live updates
- Team selection/reordering
- Dark mode by default (matches current design)

#### Team Detail View
- Full schedule view
- Live scores during games
- Team news feed
- Tap headlines to open articles in-app browser

#### Settings
- Select favorite teams
- Push notification preferences
- Refresh intervals
- Theme customization

### Backend API Needs

#### Endpoints to Build
```
GET /api/teams
  → Returns list of all configured teams

GET /api/team/{team_id}/schedule
  → Games (past 5, next 5)

GET /api/team/{team_id}/news
  → Latest 3-5 headlines

GET /api/dashboard
  → All teams + games + news (current graphic data as JSON)
```

#### Hosting Options
- **Self-hosted**: Run FastAPI/Flask on your current server
- **Vercel/Railway**: Easy deployment for Python backend
- **AWS Lambda**: Serverless with API Gateway
- **Cloudflare Workers**: Edge computing, fast globally

### Development Roadmap

**Phase 1: API Backend** (1-2 days)
- Convert Python scripts to FastAPI endpoints
- Add JSON responses
- Deploy to Vercel or Railway
- Test with Postman

**Phase 2: iOS App MVP** (3-5 days)
- SwiftUI app scaffold
- API client implementation
- Home screen with team cards
- Basic navigation

**Phase 3: Polish** (2-3 days)
- Animations and transitions
- Pull-to-refresh
- Error handling
- Loading states

**Phase 4: Advanced Features** (ongoing)
- Push notifications for game starts
- Live score updates during games
- Widgets (iOS 14+)
- Apple Watch complications

### File Structure (SwiftUI)
```
SportsHub/
├── SportsHubApp.swift          # App entry point
├── Models/
│   ├── Team.swift
│   ├── Game.swift
│   └── NewsArticle.swift
├── Views/
│   ├── DashboardView.swift     # Main screen
│   ├── TeamCard.swift          # Reusable card component
│   ├── TeamDetailView.swift
│   └── NewsRow.swift
├── ViewModels/
│   └── DashboardViewModel.swift
├── Services/
│   ├── APIService.swift        # API client
│   └── CacheManager.swift
└── Resources/
    ├── Assets.xcassets
    └── Info.plist
```

### Data Models

```swift
struct Team: Codable, Identifiable {
    let id: String
    let name: String
    let league: String
    let abbrev: String
    var games: [Game]
    var news: [NewsArticle]
}

struct Game: Codable, Identifiable {
    let id: String
    let date: Date
    let opponent: String
    let teamScore: Int
    let opponentScore: Int
    let status: String
    let isHome: Bool
    let result: String // "W", "L", "SCHEDULED"
}

struct NewsArticle: Codable, Identifiable {
    let id: String
    let title: String
    let url: String
    let age: String
    let source: String
}
```

## Next Steps

1. **Choose tech stack** (SwiftUI recommended for your use case)
2. **Build FastAPI backend** (convert existing Python code)
3. **Deploy backend** (Vercel/Railway for ease)
4. **Start iOS app** (Xcode project with SwiftUI)
5. **Iterate on design** (match current graphic aesthetics)

## Resources

- SwiftUI Tutorial: https://developer.apple.com/tutorials/swiftui
- FastAPI Docs: https://fastapi.tiangolo.com/
- Deploy Python API: https://vercel.com/guides/python
- iOS Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/

## Cost Estimates

- **Developer Account**: $99/year (required for App Store)
- **Backend Hosting**: $0-10/month (Vercel/Railway free tier works)
- **API Calls**: Already handled (NHL/ESPN are free)
- **News API**: Currently using Brave Search (free tier should be fine)

---

**Ready to start?** We can begin with the FastAPI backend conversion, or jump straight into SwiftUI if you want to prototype the UI first with mock data.
