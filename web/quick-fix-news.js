// Quick fix: Show all enabled news sources dynamically in settings

function renderDynamicNewsSources() {
    const settings = JSON.parse(localStorage.getItem('sportsHubSettings') || '{}');
    const enabledSources = settings.newsSources || {};
    
    console.log('Rendering dynamic news sources:', enabledSources);
    
    // Find the news sources section
    const newsSection = document.getElementById('newsSources');
    if (!newsSection) {
        console.log('News section not found');
        return;
    }
    
    // Remove any existing custom section
    const existing = document.getElementById('customSourcesSection');
    if (existing) existing.remove();
    
    // If no custom sources, show message
    if (Object.keys(enabledSources).length === 0) {
        const emptySection = document.createElement('div');
        emptySection.id = 'customSourcesSection';
        emptySection.innerHTML = `
            <div class="setting-row" style="background: rgba(10, 132, 255, 0.1); margin-top: 10px;">
                <div class="setting-label">
                    <div class="setting-name">🔧 Auto-Discovered Sources</div>
                    <div class="setting-desc">Add teams to auto-enable local news sources</div>
                </div>
            </div>
        `;
        newsSection.appendChild(emptySection);
        return;
    }
    
    // Add a "Custom Sources" section at the end
    const customSection = document.createElement('div');
    customSection.id = 'customSourcesSection';
    customSection.innerHTML = `
        <div class="setting-row" style="background: rgba(10, 132, 255, 0.1); margin-top: 10px;">
            <div class="setting-label">
                <div class="setting-name">🔧 Auto-Discovered Sources (${Object.keys(enabledSources).length})</div>
                <div class="setting-desc">Automatically enabled based on your teams</div>
            </div>
        </div>
    `;
    
    // Add toggle for each enabled source
    Object.keys(enabledSources).forEach(sourceKey => {
        if (enabledSources[sourceKey]) {
            const sourceName = sourceKey.replace(/_/g, '.').replace(/ca\/news\/canada\//g, 'CBC ');
            const row = document.createElement('div');
            row.className = 'setting-row';
            row.innerHTML = `
                <div class="setting-label">
                    <div class="setting-name">${sourceName}</div>
                    <div class="setting-desc">Auto-enabled for your teams</div>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="source-${sourceKey}" checked onchange="updateSourceToggle('${sourceKey}', this.checked)">
                    <span class="slider"></span>
                </label>
            `;
            customSection.appendChild(row);
        }
    });
    
    newsSection.appendChild(customSection);
    console.log('Added', Object.keys(enabledSources).length, 'custom sources');
}

function updateSourceToggle(sourceKey, enabled) {
    const settings = JSON.parse(localStorage.getItem('sportsHubSettings') || '{}');
    if (!settings.newsSources) settings.newsSources = {};
    settings.newsSources[sourceKey] = enabled;
    localStorage.setItem('sportsHubSettings', JSON.stringify(settings));
    console.log('Updated source:', sourceKey, enabled);
}

// Run after page loads and on visibility change
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderDynamicNewsSources);
} else {
    renderDynamicNewsSources();
}

// Re-render when page becomes visible (user comes back from adding team)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        setTimeout(renderDynamicNewsSources, 100);
    }
});

// Also re-render every 2 seconds if settings page is visible
setInterval(function() {
    if (!document.hidden && document.getElementById('newsSources')) {
        renderDynamicNewsSources();
    }
}, 2000);
