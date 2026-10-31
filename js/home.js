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
  function setWorkView(showGrid) {
    document.querySelector('.home').classList.toggle('is-grid', showGrid);
    projectGrid.hidden = !showGrid;
    if (showGrid) projectGrid.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
    engagements.hidden = showGrid;
    viewToggle.setAttribute('aria-pressed', String(showGrid));
    viewToggle.setAttribute('aria-label', showGrid ? 'Show index' : 'Show work');
    viewToggle.querySelector('.home-view-label').textContent = showGrid ? 'Index' : 'Work';
    viewToggle.querySelector('img').src = showGrid ? '/asset/home/list.svg' : '/asset/home/grid.svg';
  }
  setWorkView(new URL(location.href).searchParams.get('view') === 'work');
  viewToggle.addEventListener('click', () => {
    const showGrid = projectGrid.hidden;
    setWorkView(showGrid);
    const url = new URL(location.href);
    if (showGrid) url.searchParams.set('view', 'work');
    else url.searchParams.delete('view');
    history.replaceState(null, '', url);
  });
}

// Match the original brand typeout timing, without an idle animation.
const homeBrand = document.querySelector('.home-brand');
const brandSuffix = homeBrand?.querySelector('.home-brand-suffix');
if (brandSuffix) {
  const wideHeader = matchMedia('(min-width: 640px)');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let typing;
  const resetBrand = () => {
    clearInterval(typing);
    brandSuffix.textContent = '';
    homeBrand.classList.remove('is-typing');
  };
  const typeBrand = () => {
    if (!wideHeader.matches) return;
    resetBrand();
    if (reduceMotion.matches) { brandSuffix.textContent = 'adara'; return; }
    let count = 0;
    homeBrand.classList.add('is-typing');
    typing = setInterval(() => {
      brandSuffix.textContent = 'adara'.slice(0, ++count);
      if (count === 5) { clearInterval(typing); homeBrand.classList.remove('is-typing'); }
    }, 90);
  };
  homeBrand.addEventListener('mouseenter', typeBrand);
  homeBrand.addEventListener('focus', typeBrand);
  homeBrand.addEventListener('mouseleave', () => { if (document.activeElement !== homeBrand) resetBrand(); });
  homeBrand.addEventListener('blur', () => { if (!homeBrand.matches(':hover')) resetBrand(); });
  wideHeader.addEventListener('change', resetBrand);
  reduceMotion.addEventListener('change', resetBrand);
}
const copyEmail = document.querySelector('.home-copy-email');
const contactLink = document.querySelector('.home-contact a');
if (copyEmail && contactLink && navigator.clipboard?.writeText) {
  const status = document.querySelector('.home-copy-status');
  let feedbackTimer;
  const email = contactLink.textContent.trim();
  copyEmail.hidden = false;
  copyEmail.setAttribute('aria-label', `Copy ${email}`);
  const copyContactEmail = async () => {
    clearTimeout(feedbackTimer);
    try {
      await navigator.clipboard.writeText(email);
      status.textContent = 'Email copied';
    } catch {
      status.textContent = 'Could not copy. Select the address to copy it.';
    }
    status.classList.remove('is-above');
    status.classList.toggle('is-above', status.getBoundingClientRect().bottom > innerHeight - 8);
    feedbackTimer = setTimeout(() => { status.textContent = ''; }, 2500);
  };
  copyEmail.addEventListener('click', copyContactEmail);
  // Keep the mailto default action so the same click also opens the mail app.
  contactLink.addEventListener('click', copyContactEmail);
}
