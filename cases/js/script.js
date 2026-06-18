// Hide header on scroll down
const siteHeader = document.querySelector('header');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  const isPastHeader = currentScrollY > 96;
  const isScrollingDown = currentScrollY > lastScrollY;
  siteHeader.classList.toggle('is-hidden', isPastHeader && isScrollingDown);
  lastScrollY = Math.max(currentScrollY, 0);
}, { passive: true });

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
