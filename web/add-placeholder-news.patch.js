// Patch: Add to index.html after teamDetails.forEach

// After converting team to formattedTeam, ensure it has news:
if (!formattedTeam.news || formattedTeam.news.length === 0) {
    formattedTeam.news = [
        { title: formattedTeam.name + " latest updates", source: formattedTeam.league, age: "Updating..." },
        { title: "Season schedule and standings", source: "League", age: "Check back soon" },
        { title: "Recent team news", source: "Local", age: "Coming soon" }
    ];
}
