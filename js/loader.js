// The intro is decorative: images and fonts must never block access to the page.
const LOADER = { maxDuration: 650 };

function revealSite() {
  document.body.classList.remove('is-loading', 'is-leaving');
  document.body.classList.add('is-ready');
  document.dispatchEvent(new CustomEvent('cadara:ready'));
}

function prepareAllImages() {
  document.querySelectorAll('img').forEach((img) => {
    const finish = () => img.classList.add('is-loaded');
    if (img.complete) finish();
    else {
      img.addEventListener('load', finish, { once: true });
      img.addEventListener('error', finish, { once: true });
    }
  });
}

function initSiteLoader() {
  const loader = document.getElementById('site-loader');
  prepareAllImages();
  // If scripts arrive late, keep the already visible content on screen.
  if (!loader || performance.now() > 1000 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    loader?.classList.add('is-hidden');
    revealSite();
    return;
  }

  let finished = false;
  let deadline;
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(deadline);
    loader.classList.add('is-exiting');
    // Reveal underneath the fading overlay, without another blocking delay.
    revealSite();
    setTimeout(() => loader.classList.add('is-hidden'), 120);
  }

  // Set the deadline before symbol initialization so errors cannot trap visitors.
  deadline = setTimeout(finish, LOADER.maxDuration);
  document.body.classList.add('is-loading');
  try {
    window.initCadaraSymbols?.();
    const rotate = loader.querySelector('.cadara-symbol-rotate');
    if (!rotate) finish();
    else rotate.addEventListener('animationend', (event) => {
      if (event.animationName === 'cadara-loader-rotate') finish();
    }, { once: true });
  } catch {
    finish();
  }
}

// Native navigation preserves instant links, downloads and browser history.
// A page restored from the back/forward cache must always be usable.
window.addEventListener('pageshow', (event) => {
  if (!event.persisted) return;
  document.getElementById('site-loader')?.classList.add('is-hidden');
  revealSite();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSiteLoader, { once: true });
} else {
  initSiteLoader();
}
