const siteHeader = document.querySelector('.header');
let lastScrollY = window.scrollY;

if (siteHeader) {
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const isPastHeader = currentScrollY > 96;
    const isScrollingDown = currentScrollY > lastScrollY;

    siteHeader.classList.toggle('is-hidden', isPastHeader && isScrollingDown);
    lastScrollY = Math.max(currentScrollY, 0);
  }, { passive: true });
}

function setupMobileMenu() {
  const menuTrigger = document.querySelector('.nav-pill-wrap .pill');
  if (!menuTrigger) return;

  const isCasesPath = window.location.pathname.includes('/cases/');
  const assetPrefix = isCasesPath ? '../asset/' : 'asset/';
  const links = {
    home: isCasesPath ? '../index.html' : 'index.html',
    work: isCasesPath ? 'work.html' : 'cases/work.html',
    studio: isCasesPath ? '../index.html#studio' : '#studio',
    offer: isCasesPath ? 'offer.html' : 'cases/offer.html',
  };

  const panel = document.createElement('div');
  panel.className = 'mobile-menu-panel';
  panel.id = 'mobile-menu';
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML = `
    <div class="mobile-menu-top">
      <a href="${links.home}" aria-label="Cadara Studio home">
        <img class="mobile-menu-logo" src="${assetPrefix}cadara-logo.svg" alt="Cadara">
      </a>
      <button class="mobile-menu-close" type="button" aria-label="Close menu">Close</button>
    </div>
    <nav class="mobile-menu-links" aria-label="Mobile navigation">
      <a href="${links.home}">Home</a>
      <a href="${links.work}">Work</a>
      <a href="${links.studio}">Studio</a>
      <a href="${links.offer}">Offer</a>
      <a href="mailto:info@cadarstudio.com">Contact</a>
    </nav>
    <div class="mobile-menu-bottom">
      <img class="mobile-menu-emblem" src="${assetPrefix}cadara-symbol.svg" alt="" aria-hidden="true" data-cadara-pending="loop">
      <nav class="mobile-menu-socials" aria-label="Social links">
        <a href="https://www.linkedin.com/company/cadarastudio" target="_blank" rel="noopener">LinkedIn</a>
        <a href="https://www.instagram.com/cadarastudio" target="_blank" rel="noopener">Instagram</a>
        <a href="https://behance.net/cadara" target="_blank" rel="noopener">Behance</a>
      </nav>
      <div class="mobile-menu-wordmark" aria-hidden="true">CADARA</div>
    </div>
  `;
  document.body.appendChild(panel);
  if (window.initCadaraSymbols) window.initCadaraSymbols();

  const closeButton = panel.querySelector('.mobile-menu-close');
  const mobileQuery = window.matchMedia('(max-width: 900px)');

  function openMenu() {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
    closeButton.focus();
  }

  function closeMenu() {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  }

  menuTrigger.setAttribute('aria-haspopup', 'dialog');
  menuTrigger.setAttribute('aria-controls', 'mobile-menu');

  menuTrigger.addEventListener('click', (event) => {
    if (!mobileQuery.matches) return;
    event.preventDefault();
    openMenu();
  });

  closeButton.addEventListener('click', closeMenu);
  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

setupMobileMenu();

function setupComingSoonCards() {
  const cards = document.querySelectorAll('.case-card--soon');
  if (!cards.length) return;

  const finePointer = window.matchMedia('(pointer: fine) and (min-width: 901px)');

  cards.forEach((card) => {
    const label = card.querySelector('.case-card-soon');
    if (!label) return;

    function moveLabel(event) {
      const rect = card.getBoundingClientRect();
      label.style.left = `${event.clientX - rect.left}px`;
      label.style.top = `${event.clientY - rect.top}px`;
    }

    function activate(event) {
      if (!finePointer.matches) return;
      card.classList.add('is-active');
      moveLabel(event);
    }

    function deactivate() {
      card.classList.remove('is-active');
    }

    card.addEventListener('mouseenter', activate);
    card.addEventListener('mousemove', moveLabel);
    card.addEventListener('mouseleave', deactivate);
  });
}

setupComingSoonCards();
