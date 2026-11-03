const toggle = document.querySelector('.theme-toggle');
if (toggle) {
  const syncToggle = () => {
    const light = document.documentElement.dataset.theme === 'light';
    toggle.setAttribute('aria-pressed', String(light));
    toggle.querySelector('img').src = light ? '/asset/home/light.svg' : '/asset/home/dark.svg';
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

const viewToggle = document.querySelector('.view-toggle');
const engagements = document.querySelector('#home-engagements');
const projectGrid = document.querySelector('#home-projects');
if (viewToggle && engagements && projectGrid && projectGrid.querySelector('.case-card')) {
  document.querySelector('.gallery-link').hidden = true;
  viewToggle.hidden = false;
  function setWorkView(showGrid) {
    document.querySelector('.home').classList.toggle('is-grid', showGrid);
    projectGrid.hidden = !showGrid;
    if (showGrid) projectGrid.querySelectorAll('img[src]').forEach(image => { image.loading = 'eager'; });
    engagements.hidden = showGrid;
    viewToggle.setAttribute('aria-pressed', String(showGrid));
    viewToggle.setAttribute('aria-label', showGrid ? 'Show index' : 'Show work');
    viewToggle.querySelector('.home-view-label').textContent = showGrid ? 'Index' : 'Work';
    viewToggle.querySelector('img').src = showGrid ? '/asset/home/doc.svg' : '/asset/home/folder.svg';
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
const contactLink = document.querySelector('.home-email-link');
if (contactLink && navigator.clipboard?.writeText) {
  const status = document.querySelector('.home-copy-status');
  const icon = contactLink.querySelector('.home-copy-icon');
  const email = contactLink.querySelector('.home-email-address').textContent.trim();
  let feedbackTimer;
  icon.hidden = false;
  contactLink.setAttribute('aria-label', `Copy ${email}`);
  contactLink.setAttribute('role', 'button');
  contactLink.addEventListener('keydown', event => {
    if (event.key === ' ') { event.preventDefault(); contactLink.click(); }
  });
  contactLink.addEventListener('click', async event => {
    event.preventDefault();
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
  });
}

// Start the approach drawing when its icons enter the viewport.
const approachIcons = document.querySelector('.home-services-grid');
if (approachIcons) {
  const observer = new IntersectionObserver(([entry]) => {
    approachIcons.closest('.home-services').classList.toggle('is-animating', entry.isIntersecting);
  });
  observer.observe(approachIcons);
}
