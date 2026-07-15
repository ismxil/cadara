const CADARA_SYMBOL_SVG = `
  <svg class="cadara-symbol-svg" viewBox="0 0 92 92" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path class="cadara-symbol-line cadara-symbol-line--v" d="M45.9961 7.03125V84.9662" stroke="currentColor" stroke-width="6"/>
    <path class="cadara-symbol-line cadara-symbol-line--h" d="M84.9688 45.9922L7.03378 45.9922" stroke="currentColor" stroke-width="6"/>
    <g class="cadara-symbol-rotate">
      <path class="cadara-symbol-line cadara-symbol-line--d" d="M18.4492 73.5547L73.5576 18.4463" stroke="currentColor" stroke-width="6"/>
      <path class="cadara-symbol-line cadara-symbol-line--d" d="M18.4434 18.4453L73.5517 73.5536" stroke="currentColor" stroke-width="6"/>
    </g>
  </svg>`;

function mountCadaraSymbol(host, { variant = 'loop', size = 'md' } = {}) {
  if (!host || host.dataset.cadaraMounted === 'true') return host;

  host.dataset.cadaraMounted = 'true';
  host.classList.add('cadara-symbol-host', `cadara-symbol-host--${size}`, `cadara-symbol-host--${variant}`);
  host.innerHTML = CADARA_SYMBOL_SVG;
  return host;
}

function replaceImageWithSymbol(img, options) {
  const host = document.createElement('span');
  mountCadaraSymbol(host, options);
  img.replaceWith(host);
  return host;
}

function ensureBrandWordmark(brand) {
  let wordmark = brand.querySelector('.brand-wordmark');
  if (wordmark) return wordmark;

  wordmark = document.createElement('span');
  wordmark.className = 'brand-wordmark';
  wordmark.textContent = 'Cadara';
  wordmark.setAttribute('aria-hidden', 'true');
  brand.appendChild(wordmark);
  return wordmark;
}

function initCadaraSymbols() {
  document.querySelectorAll('.brand').forEach((brand) => {
    const img = brand.querySelector('img');
    const existingHost = brand.querySelector('.cadara-symbol-host');

    if (!img && !existingHost) return;

    if (brand.dataset.cadaraBrandMounted === 'true') {
      brand.classList.add('brand--animated');
      ensureBrandWordmark(brand);
      return;
    }

    brand.dataset.cadaraBrandMounted = 'true';
    brand.classList.add('brand--animated');

    const symbolHost = document.createElement('span');
    mountCadaraSymbol(symbolHost, { variant: 'brand', size: 'md' });

    const wordmark = document.createElement('span');
    wordmark.className = 'brand-wordmark';
    wordmark.textContent = 'Cadara';
    wordmark.setAttribute('aria-hidden', 'true');

    if (img) {
      brand.replaceChildren(symbolHost, wordmark);
    } else {
      brand.prepend(symbolHost);
      brand.appendChild(wordmark);
    }
  });

  document.querySelectorAll('.statement-emblem, .mobile-menu-symbol, .mobile-menu-emblem').forEach((img) => {
    if (img.tagName !== 'IMG') return;

    const size = img.classList.contains('statement-emblem') ? 'lg' : 'md';
    replaceImageWithSymbol(img, { variant: 'loop', size });
  });

  document.querySelectorAll('[data-cadara-symbol]').forEach((host) => {
    const variant = host.dataset.cadaraSymbol === 'brand' ? 'brand' : 'loop';
    const size = host.dataset.cadaraSize || 'md';
    mountCadaraSymbol(host, { variant, size });
  });
}

window.initCadaraSymbols = initCadaraSymbols;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCadaraSymbols);
} else {
  initCadaraSymbols();
}
