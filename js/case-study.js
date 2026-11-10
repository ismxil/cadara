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
  document.querySelectorAll('.case-gallery > *').forEach(element => observer.observe(element));
}
// The expanded introduction floats over the artwork; "See less" sits at its end.
const background = document.querySelector('.case-background');
const collapse = background?.querySelector('.case-collapse');
const closeBackground = () => {
  background.open = false;
  background.querySelector('summary').focus({preventScroll: true});
  const top = background.closest('.case-introduction').getBoundingClientRect().top;
  if (top < 0) scrollBy({top: top - 96, behavior: reducedMotion.matches ? 'auto' : 'smooth'});
};
if (collapse) {
  collapse.hidden = false;
  collapse.addEventListener('click', closeBackground);
  background.classList.add('has-collapse');
}
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !event.defaultPrevented && !event.target.closest('input, textarea, select, [contenteditable]')) {
    if (background?.open) closeBackground();
    else location.assign(document.querySelector('.case-close').href);
  }
});

// Resize from the side, matching the adjustable project view on the homepage.
const caseResizes = [...document.querySelectorAll('.case-resize')];
if (caseResizes.length) {
  const desktopResize = matchMedia('(min-width: 781px) and (pointer: fine)');
  let width = 720, resizeDrag;
  const limits = () => ({min: 720, max: innerWidth});
  const setWidth = value => {
    const {min, max} = limits();
    width = Math.max(min, Math.min(max, value));
    document.body.style.setProperty('--case-width', `${width}px`);
    caseResizes.forEach(handle => {
      handle.setAttribute('aria-valuenow', String(Math.round(width)));
      handle.setAttribute('aria-valuemax', String(Math.round(max)));
      handle.setAttribute('aria-valuetext', `${Math.round(width)} pixels wide. Use left and right arrow keys to resize.`);
    });
  };
  const syncResize = () => {
    caseResizes.forEach(handle => { handle.hidden = !desktopResize.matches; });
    if (!desktopResize.matches) width = 720;
    setWidth(width);
  };
  const endResize = event => {
    if (resizeDrag?.id !== event.pointerId) return;
    if (event.type === 'pointercancel') setWidth(resizeDrag.width);
    const handle = resizeDrag.handle;
    resizeDrag = null;
    document.body.classList.remove('is-case-resizing');
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
  };
  caseResizes.forEach(caseResize => {
    const direction = caseResize.dataset.resizeSide === 'right' ? 1 : -1;
    caseResize.addEventListener('pointerdown', event => {
      if (!desktopResize.matches || event.button !== 0) return;
      event.preventDefault();
      resizeDrag = {id: event.pointerId, x: event.clientX, width, handle: caseResize};
      caseResize.setPointerCapture(event.pointerId);
      document.body.classList.add('is-case-resizing');
    });
    caseResize.addEventListener('pointermove', event => {
      if (resizeDrag?.id === event.pointerId && resizeDrag.handle === caseResize) setWidth(resizeDrag.width + direction * 2 * (event.clientX - resizeDrag.x));
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => caseResize.addEventListener(type, endResize));
    caseResize.addEventListener('keydown', event => {
      if (event.key === 'Escape' && resizeDrag) {
        event.preventDefault();
        endResize({pointerId: resizeDrag.id, type: 'pointercancel'});
      } else if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        setWidth(event.key === 'Home' ? 720 : event.key === 'End' ? limits().max : width + direction * (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 80 : 20));
      }
    });
  });
  desktopResize.addEventListener('change', syncResize);
  window.addEventListener('resize', syncResize);
  syncResize();
}
