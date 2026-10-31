// Apply a saved preference before the page paints. The Figma dark theme is the default.
try {
  const theme = localStorage.getItem('cadara-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch { /* Storage may be unavailable in private browsing. */ }
