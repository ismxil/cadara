const siteHeader = document.querySelector('.header');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  const isPastHeader = currentScrollY > 96;
  const isScrollingDown = currentScrollY > lastScrollY;

  siteHeader.classList.toggle('is-hidden', isPastHeader && isScrollingDown);
  lastScrollY = Math.max(currentScrollY, 0);
}, { passive: true });
