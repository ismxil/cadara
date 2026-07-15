const LOADER = {
  get duration() {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--cadara-loader-duration')
      .trim();
    return parseInt(value, 10) || 3900;
  },
  get settle() {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--cadara-loader-settle')
      .trim();
    return parseInt(value, 10) || 300;
  },
  fadeOut: 520,
  navFade: 360,
};

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isInternalNavigationLink(anchor) {
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return false;

  let url;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return false;
  }

  if (url.origin !== window.location.origin) return false;

  const samePath = url.pathname === window.location.pathname;
  const sameSearch = url.search === window.location.search;

  if (samePath && sameSearch && url.hash) return false;

  return true;
}

async function hideLoader(loader) {
  loader.classList.add('is-exiting');
  await wait(LOADER.fadeOut);
  loader.classList.add('is-hidden');
  document.body.classList.remove('is-loading');
  revealSite();
}

function waitForLoaderAnimation(loader) {
  const duration = LOADER.duration + LOADER.settle + 150;

  return Promise.race([
    new Promise((resolve) => {
      const rotateGroup = loader?.querySelector('.cadara-symbol-rotate');
      if (!rotateGroup) {
        resolve();
        return;
      }

      function onEnd(event) {
        if (event.animationName !== 'cadara-loader-rotate') return;
        rotateGroup.removeEventListener('animationend', onEnd);
        resolve();
      }

      rotateGroup.addEventListener('animationend', onEnd);
    }),
    wait(duration),
  ]);
}

function revealSite() {
  requestAnimationFrame(() => {
    document.body.classList.add('is-ready');
  });
}

async function playLoaderIntro(loader) {
  if (prefersReducedMotion()) {
    await hideLoader(loader);
    return;
  }

  await waitForLoaderAnimation(loader);
  await wait(LOADER.settle);
  await hideLoader(loader);
}

async function initSiteLoader() {
  const loader = document.getElementById('site-loader');
  if (!loader) {
    revealSite();
    return;
  }

  if (window.initCadaraSymbols) window.initCadaraSymbols();
  await playLoaderIntro(loader);
}

function setupPageTransitions() {
  document.addEventListener('click', async (event) => {
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = event.target.closest('a[href]');
    if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
    if (!isInternalNavigationLink(anchor)) return;

    event.preventDefault();

    const loader = document.getElementById('site-loader');
    const destination = anchor.href;

    document.body.classList.remove('is-ready');
    document.body.classList.add('is-leaving', 'is-loading');

    if (loader) {
      loader.classList.remove('is-hidden', 'is-exiting', 'is-nav');
    }

    try {
      await wait(LOADER.navFade);
    } finally {
      window.location.href = destination;
    }
  });
}

setupPageTransitions();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSiteLoader);
} else {
  initSiteLoader();
}
