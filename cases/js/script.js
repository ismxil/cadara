// Hide header on scroll down
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
    offer: isCasesPath ? '../index.html#offer' : '#offer',
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
      <img class="mobile-menu-emblem" src="${assetPrefix}cadara-symbol.svg" alt="" aria-hidden="true">
      <nav class="mobile-menu-socials" aria-label="Social links">
        <a href="https://www.linkedin.com/company/cadarastudio" target="_blank" rel="noopener">LinkedIn</a>
        <a href="https://www.instagram.com/cadarastudio" target="_blank" rel="noopener">Instagram</a>
        <a href="https://behance.net/cadara" target="_blank" rel="noopener">Behance</a>
      </nav>
      <div class="mobile-menu-wordmark" aria-hidden="true">CADARA</div>
    </div>
  `;
  document.body.appendChild(panel);

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

// Heading scroll animation
(function () {
  const headings = document.querySelectorAll('h3, h2, .section-heading');
  const vp = window.innerHeight;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      const el = entry.target;
      if (entry.isIntersecting) {
        el.classList.add('h-in');
        el.classList.remove('h-below', 'h-past');
      } else if (entry.boundingClientRect.top < 0) {
        el.classList.add('h-past');
        el.classList.remove('h-in', 'h-below');
      } else {
        el.classList.add('h-below');
        el.classList.remove('h-in', 'h-past');
      }
    });
  }, { threshold: 0.15 });

  headings.forEach(function (el) {
    const rect = el.getBoundingClientRect();
    if (rect.top < vp && rect.bottom > 0) {
      el.classList.add('h-in');
    }
    observer.observe(el);
  });
})();
