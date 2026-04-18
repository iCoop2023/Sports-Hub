// Calendar subscription links for each team

const CALENDAR_LINKS = {
    "Edmonton Oilers": {
        ical: "webcal://www.nhl.com/oilers/schedule/downloadable",
        google: "https://calendar.google.com/calendar/u/0/r?cid=edmonton+oilers",
        official: "https://www.nhl.com/oilers/schedule"
    },
    "Pittsburgh Penguins": {
        ical: "webcal://www.nhl.com/penguins/schedule/downloadable",
        google: "https://calendar.google.com/calendar/u/0/r?cid=pittsburgh+penguins",
        official: "https://www.nhl.com/penguins/schedule"
    },
    "Toronto Blue Jays": {
        ical: "webcal://www.mlb.com/bluejays/schedule/downloadable",
        google: "https://calendar.google.com/calendar/u/0/r?cid=toronto+blue+jays",
        official: "https://www.mlb.com/bluejays/schedule"
    },
    "Kansas City Chiefs": {
        ical: "webcal://www.chiefs.com/schedule.ics",
        google: "https://calendar.google.com/calendar/u/0/r?cid=kansas+city+chiefs",
        official: "https://www.chiefs.com/team/schedule"
    },
    "Toronto Raptors": {
        ical: "webcal://www.nba.com/raptors/schedule/downloadable",
        google: "https://calendar.google.com/calendar/u/0/r?cid=toronto+raptors",
        official: "https://www.nba.com/raptors/schedule"
    },
    "Real Madrid": {
        ical: null,  // Use ESPN or custom feed
        google: "https://calendar.google.com/calendar/u/0/r?cid=real+madrid",
        official: "https://www.espn.com/soccer/team/schedule/_/id/86/real-madrid"
    }
};

function getCalendarLink(teamName, type = 'ical') {
    const links = CALENDAR_LINKS[teamName];
    if (!links) return null;
    
    return links[type] || links.official;
}

function showCalendarMenu(teamName, event) {
    event.stopPropagation();
    
    const links = CALENDAR_LINKS[teamName];
    if (!links) {
        alert('Calendar not available for this team');
        return;
    }
    
    // For iOS, show action sheet-style menu
    const actions = [];
    
    if (links.ical) {
        actions.push(`📅 Subscribe (iCal)`);
    }
    actions.push(`📱 Add to Google Calendar`);
    actions.push(`🌐 View Official Schedule`);
    actions.push(`❌ Cancel`);
    
    const choice = prompt(
        `${teamName} Calendar:\n\n` +
        actions.map((a, i) => `${i + 1}. ${a}`).join('\n') +
        `\n\nSelect option (1-${actions.length}):`
    );
    
    const idx = parseInt(choice) - 1;
    if (isNaN(idx) || idx < 0 || idx >= actions.length) return;
    
    if (actions[idx].includes('iCal') && links.ical) {
        window.location.href = links.ical;
    } else if (actions[idx].includes('Google')) {
        window.open(links.google, '_blank');
    } else if (actions[idx].includes('Official')) {
        window.open(links.official, '_blank');
    }
}
