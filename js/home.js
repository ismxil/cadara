const toggle = document.querySelector('.theme-toggle');
if (toggle) {
  const syncToggle = () => {
    const light = document.documentElement.dataset.theme === 'light';
    toggle.setAttribute('aria-pressed', String(light));
    toggle.setAttribute('aria-label', `Switch to ${light ? 'dark' : 'light'} theme`);
  };
  syncToggle();
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('cadara-theme', theme); } catch { /* Theme still works without storage. */ }
    syncToggle();
  });
}
const clock = document.querySelector('#local-time');
if (clock) {
  const dateFormatter = new Intl.DateTimeFormat('en-US', {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'});
  const timeFormatter = new Intl.DateTimeFormat('en-US', {hour: '2-digit', minute: '2-digit', hour12: true});
  const updateClock = () => {
    const now = new Date();
    clock.dateTime = now.toISOString();
    clock.textContent = `${dateFormatter.format(now)} ${timeFormatter.format(now)}`;
  };
  updateClock();
  clock.parentElement.hidden = false;
  setInterval(updateClock, 60_000);
}

const viewToggle = document.querySelector('.view-toggle');
const engagements = document.querySelector('#home-engagements');
const projectGrid = document.querySelector('#home-projects');
if (viewToggle && engagements && projectGrid && projectGrid.querySelector('.case-card')) {
  document.querySelector('.gallery-link').hidden = true;
  viewToggle.hidden = false;
  viewToggle.addEventListener('click', () => {
    const showGrid = projectGrid.hidden;
    document.querySelector('.home').classList.toggle('is-grid', showGrid);
    projectGrid.hidden = !showGrid;
    if (showGrid) projectGrid.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
    engagements.hidden = showGrid;
    viewToggle.setAttribute('aria-pressed', String(showGrid));
    viewToggle.setAttribute('aria-label', showGrid ? 'Show engagement list' : 'Show project grid');
    viewToggle.querySelector('.home-view-label').textContent = showGrid ? 'List' : 'Grid';
    viewToggle.querySelector('img').src = showGrid ? '/asset/home/list.svg' : '/asset/home/grid.svg';
  });
}
