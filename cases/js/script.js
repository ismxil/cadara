function setupMobileMenu() {
  const menuTrigger = document.querySelector('.nav-toggle');
  if (!menuTrigger) return;

  const isCasesPath = window.location.pathname.includes('/cases/');
  const assetPrefix = isCasesPath ? '../asset/' : 'asset/';
  const links = {
    home: isCasesPath ? '../index.html' : 'index.html',
    work: isCasesPath ? 'work.html' : 'cases/work.html',
    studio: isCasesPath ? '../index.html#studio' : '#studio',
    contact: 'mailto:info@cadarstudio.com',
  };

  const panel = document.createElement('div');
  panel.className = 'mobile-menu-panel';
  panel.id = 'mobile-menu';
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML = `
    <div class="mobile-menu-top">
      <a href="${links.home}" aria-label="Cadara Studio home">
        <img class="mobile-menu-symbol" src="${assetPrefix}cadara-symbol.svg" alt="">
      </a>
      <button class="mobile-menu-close" type="button" aria-label="Close menu">Close</button>
    </div>
    <nav class="mobile-menu-links" aria-label="Mobile navigation">
      <a href="${links.work}">Work</a>
      <a href="${links.studio}">Studio</a>
      <a href="${links.contact}">Contact</a>
    </nav>
    <div class="mobile-menu-bottom">
      <nav class="mobile-menu-socials" aria-label="Social links">
        <a href="https://www.linkedin.com/company/cadarastudio" target="_blank" rel="noopener">LinkedIn</a>
        <a href="https://www.instagram.com/cadarastudio" target="_blank" rel="noopener">Instagram</a>
        <a href="https://behance.net/cadara" target="_blank" rel="noopener">Behance</a>
      </nav>
    </div>
  `;
  document.body.appendChild(panel);

  const closeButton = panel.querySelector('.mobile-menu-close');
  const mobileQuery = window.matchMedia('(max-width: 900px)');

  function openMenu() {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    menuTrigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    closeButton.focus();
  }

  function closeMenu() {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    menuTrigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  menuTrigger.addEventListener('click', () => {
    if (!mobileQuery.matches) return;
    if (panel.classList.contains('is-open')) {
      closeMenu();
      return;
    }
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
