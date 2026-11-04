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

// Resize from the side, matching the adjustable project view on the homepage.
const caseResize = document.querySelector('.case-resize');
if (caseResize) {
  const desktopResize = matchMedia('(min-width: 781px) and (pointer: fine)');
  let width = 720, resizeDrag;
  const limits = () => ({min: 720, max: Math.min(1200, innerWidth - 40)});
  const setWidth = value => {
    const {min, max} = limits();
    width = Math.max(min, Math.min(max, value));
    document.body.style.setProperty('--case-width', `${width}px`);
    caseResize.setAttribute('aria-valuenow', String(Math.round(width)));
    caseResize.setAttribute('aria-valuemax', String(Math.round(max)));
    caseResize.setAttribute('aria-valuetext', `${Math.round(width)} pixels wide. Use left and right arrow keys to resize.`);
  };
  const syncResize = () => {
    caseResize.hidden = !desktopResize.matches;
    if (!desktopResize.matches) width = 720;
    setWidth(width);
  };
  const endResize = event => {
    if (resizeDrag?.id !== event.pointerId) return;
    if (event.type === 'pointercancel') setWidth(resizeDrag.width);
    resizeDrag = null;
    document.body.classList.remove('is-case-resizing');
    if (caseResize.hasPointerCapture(event.pointerId)) caseResize.releasePointerCapture(event.pointerId);
  };
  caseResize.addEventListener('pointerdown', event => {
    if (!desktopResize.matches || event.button !== 0) return;
    event.preventDefault();
    resizeDrag = {id: event.pointerId, x: event.clientX, width};
    caseResize.setPointerCapture(event.pointerId);
    document.body.classList.add('is-case-resizing');
  });
  caseResize.addEventListener('pointermove', event => {
    if (resizeDrag?.id === event.pointerId) setWidth(resizeDrag.width - 2 * (event.clientX - resizeDrag.x));
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => caseResize.addEventListener(type, endResize));
  caseResize.addEventListener('keydown', event => {
    if (event.key === 'Escape' && resizeDrag) {
      event.preventDefault();
      endResize({pointerId: resizeDrag.id, type: 'pointercancel'});
    } else if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      setWidth(event.key === 'Home' ? 720 : event.key === 'End' ? limits().max : width + (event.key === 'ArrowLeft' ? 1 : -1) * (event.shiftKey ? 80 : 20));
    }
  });
  desktopResize.addEventListener('change', syncResize);
  window.addEventListener('resize', syncResize);
  syncResize();
}
