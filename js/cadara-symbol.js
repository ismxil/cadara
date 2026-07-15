const CADARA_LOOP_SVG = `
  <svg class="cadara-symbol-svg" viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path class="cadara-symbol-line cadara-symbol-line--v" d="M32.1055 5V59.2156" stroke="currentColor" stroke-width="6"/>
    <path class="cadara-symbol-line cadara-symbol-line--h" d="M59.2148 32.1016L4.99922 32.1016" stroke="currentColor" stroke-width="6"/>
    <g class="cadara-symbol-rotate">
      <path class="cadara-symbol-line cadara-symbol-line--d" d="M12.9414 51.2812L51.2776 12.945" stroke="currentColor" stroke-width="6"/>
      <path class="cadara-symbol-line cadara-symbol-line--d" d="M12.9375 12.9453L51.2737 51.2815" stroke="currentColor" stroke-width="6"/>
    </g>
  </svg>`;

function mountCadaraSymbol(host, { variant = 'loop', size = 'md' } = {}) {
  if (!host || host.dataset.cadaraMounted === 'true') return host;

  host.dataset.cadaraMounted = 'true';
  host.classList.add('cadara-symbol-host', `cadara-symbol-host--${size}`, `cadara-symbol-host--${variant}`);

  if (variant === 'brand') {
    host.innerHTML = `<span class="cadara-mark cadara-mark--c" aria-hidden="true">C</span>`;
  } else {
    host.innerHTML = CADARA_LOOP_SVG;
  }

  return host;
}

function replaceImageWithSymbol(img, options) {
  const host = document.createElement('span');
  if (img.className) host.className = img.className;
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
    const symbol = host.dataset.cadaraSymbol;
    const variant = symbol === 'brand' ? 'brand' : symbol === 'loader' ? 'loader' : 'loop';
    const size = host.dataset.cadaraSize || 'md';
    mountCadaraSymbol(host, { variant, size });
  });

  setupBrandTypewriter();
}

function setupBrandTypewriter() {
  const desktopHover = window.matchMedia('(hover: hover) and (min-width: 901px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const suffixText = 'adara';
  const typeDelay = 90;

  document.querySelectorAll('.brand--animated').forEach((brand) => {
    const cMark = brand.querySelector('.cadara-mark--c');
    const wordmark = brand.querySelector('.brand-wordmark');
    if (!cMark || !wordmark) return;

    let timer = null;

    function clearTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function reset() {
      clearTimer();
      brand.classList.remove('is-writing', 'is-typing');
      if (desktopHover.matches) {
        wordmark.textContent = '';
      }
    }

    function startTyping() {
      if (!desktopHover.matches) return;

      clearTimer();
      brand.classList.add('is-writing');
      wordmark.textContent = '';

      if (reduceMotion.matches) {
        wordmark.textContent = suffixText;
        return;
      }

      brand.classList.add('is-typing');
      let index = 0;

      timer = setInterval(() => {
        index += 1;
        wordmark.textContent = suffixText.slice(0, index);
        if (index >= suffixText.length) {
          brand.classList.remove('is-typing');
          clearTimer();
        }
      }, typeDelay);
    }

    brand.addEventListener('mouseenter', startTyping);
    brand.addEventListener('mouseleave', reset);

    if (!desktopHover.matches) return;
    reset();
  });
}

window.initCadaraSymbols = initCadaraSymbols;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCadaraSymbols);
} else {
  initCadaraSymbols();
}
