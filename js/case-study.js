// Reveal artwork as it arrives, without hiding content while images load.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('case-reveal');
      observer.unobserve(entry.target);
    });
  }, {threshold: .08});
  document.querySelectorAll('.case-gallery > *, .case-outcome').forEach(element => observer.observe(element));
}
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !event.defaultPrevented && !event.target.closest('input, textarea, select, [contenteditable]')) {
    location.assign(document.querySelector('.case-close').href);
  }
});
