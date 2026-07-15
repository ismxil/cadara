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
  assetTimeout: 10000,
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

function markImageLoaded(img) {
  img.classList.add('is-loaded');
}

function waitForImage(img, timeout = LOADER.assetTimeout) {
  if (!img) return Promise.resolve();

  const finish = async () => {
    if (img.decode) {
      try {
        await img.decode();
      } catch {
        /* ignore decode errors for broken assets */
      }
    }
    markImageLoaded(img);
  };

  if (img.complete && img.naturalWidth > 0) {
    return finish();
  }

  return Promise.race([
    new Promise((resolve) => {
      const done = async () => {
        await finish();
        resolve();
      };
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', () => {
        markImageLoaded(img);
        resolve();
      }, { once: true });
    }),
    wait(timeout).then(() => {
      markImageLoaded(img);
    }),
  ]);
}

function getCriticalImages() {
  const hero = [...document.querySelectorAll('.case-hero-cover img')];
  const gallery = [...document.querySelectorAll('.case-gallery-item img')].slice(0, 6);
  const cards = [...document.querySelectorAll('.case-card .case-image img')];
  const covers = [...document.querySelectorAll('.case-next-cover img, .case-next img')];

  return [...new Set([...hero, ...gallery, ...cards, ...covers])];
}

function prepareAllImages() {
  document.querySelectorAll('img').forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      markImageLoaded(img);
      return;
    }

    img.addEventListener('load', () => markImageLoaded(img), { once: true });
    img.addEventListener('error', () => markImageLoaded(img), { once: true });
  });
}

async function waitForCriticalAssets() {
  prepareAllImages();

  const fontsReady = document.fonts?.ready?.catch(() => undefined) ?? Promise.resolve();
  const critical = getCriticalImages();
  const imagesReady = Promise.all(critical.map((img) => waitForImage(img)));

  await Promise.race([
    Promise.all([fontsReady, imagesReady]),
    wait(LOADER.assetTimeout),
  ]);
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
    document.dispatchEvent(new CustomEvent('cadara:ready'));
  });
}

async function playLoaderIntro(loader) {
  const assets = waitForCriticalAssets();

  if (prefersReducedMotion()) {
    await assets;
    await hideLoader(loader);
    return;
  }

  await Promise.all([
    waitForLoaderAnimation(loader).then(() => wait(LOADER.settle)),
    assets,
  ]);
  await hideLoader(loader);
}

async function initSiteLoader() {
  const loader = document.getElementById('site-loader');
  if (!loader) {
    await waitForCriticalAssets();
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
