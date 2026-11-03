// Apply a saved preference before the page paints. The Figma dark theme is the default.
try {
  const theme = localStorage.getItem('cadara-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch { /* Storage may be unavailable in private browsing. */ }

// Entrance motion finishes once per load; changing Work/Index never replays it.
const finishHomeEntrance = () => document.documentElement.classList.add('home-entrance-complete');
setTimeout(finishHomeEntrance, 1400);
window.addEventListener('pageshow', event => { if (event.persisted) finishHomeEntrance(); });
