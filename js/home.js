const toggle = document.querySelector('.theme-toggle');
if (toggle) {
  const syncToggle = () => {
    const light = document.documentElement.dataset.theme === 'light';
    toggle.setAttribute('aria-pressed', String(light));
    toggle.setAttribute('aria-label', `Switch to ${light ? 'dark' : 'light'} theme`);
  };
  syncToggle();
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('cadara-theme', theme); } catch { /* Theme still works without storage. */ }
    syncToggle();
  });
}

const viewToggle = document.querySelector('.view-toggle');
const engagements = document.querySelector('#home-engagements');
const projectGrid = document.querySelector('#home-projects');
if (viewToggle && engagements && projectGrid && projectGrid.querySelector('.case-card')) {
  document.querySelector('.gallery-link').hidden = true;
  viewToggle.hidden = false;
  function setWorkView(showGrid) {
    document.querySelector('.home').classList.toggle('is-grid', showGrid);
    projectGrid.hidden = !showGrid;
    if (showGrid) projectGrid.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
    engagements.hidden = showGrid;
    viewToggle.setAttribute('aria-pressed', String(showGrid));
    viewToggle.setAttribute('aria-label', showGrid ? 'Show index' : 'Show work');
    viewToggle.querySelector('.home-view-label').textContent = showGrid ? 'Index' : 'Work';
    viewToggle.querySelector('img').src = showGrid ? '/asset/home/list.svg' : '/asset/home/grid.svg';
  }
  setWorkView(new URL(location.href).searchParams.get('view') === 'work');
  viewToggle.addEventListener('click', () => {
    const showGrid = projectGrid.hidden;
    setWorkView(showGrid);
    const url = new URL(location.href);
    if (showGrid) url.searchParams.set('view', 'work');
    else url.searchParams.delete('view');
    history.replaceState(null, '', url);
  });
}

const projectCardRail = document.querySelector('.home-projects-grid');
if (projectCardRail) {
  const projectCards = [...projectCardRail.querySelectorAll('.home-project-card')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let activeIndex = 0, drag, frame, settleTimer, suppressClick = false;
  const targetLeft = (index) => projectCards[index].offsetLeft - (projectCardRail.clientWidth - projectCards[index].offsetWidth) / 2;
  const nearestIndex = () => projectCards.reduce((nearest, _, index) =>
    Math.abs(targetLeft(index) - projectCardRail.scrollLeft) < Math.abs(targetLeft(nearest) - projectCardRail.scrollLeft) ? index : nearest, 0);
  const updateActive = () => {
    frame = null;
    if (!projectCardRail.clientWidth || !projectCards.length) return;
    activeIndex = nearestIndex();
    projectCards.forEach((card, index) => card.classList.toggle('is-active', index === activeIndex));
  };
  const centerCard = (index, smooth = true) => {
    if (!projectCardRail.clientWidth || !projectCards.length) return;
    const left = targetLeft(index);
    if (Math.abs(projectCardRail.scrollLeft - left) > 1)
      projectCardRail.scrollTo({left, behavior: smooth && !reducedMotion.matches ? 'smooth' : 'instant'});
    updateActive();
  };
  const releasePull = () => {
    projectCardRail.style.setProperty('--card-pull', '0px');
  };
  const pull = (distance) => {
    if (!reducedMotion.matches)
      projectCardRail.style.setProperty('--card-pull', `${Math.sign(distance) * Math.min(72, Math.sqrt(Math.abs(distance)) * 5)}px`);
  };
  projectCardRail.classList.add('is-carousel-ready');
  projectCardRail.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(updateActive);
  }, {passive: true});
  projectCardRail.addEventListener('focusin', (event) => {
    if (drag) return;
    const index = projectCards.indexOf(event.target.closest('.home-project-card'));
    if (index >= 0) centerCard(index, false);
  });
  projectCardRail.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || !projectCards.length) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? projectCards.length - 1
      : Math.max(0, Math.min(projectCards.length - 1, activeIndex + (event.key === 'ArrowRight' ? 1 : -1)));
    projectCards[next].focus({preventScroll: true});
    centerCard(next);
  });
  projectCardRail.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    clearTimeout(settleTimer);
    releasePull();
    suppressClick = false;
    drag = {id: event.pointerId, x: event.clientX, y: event.clientY, left: projectCardRail.scrollLeft, moved: false};
  });
  projectCardRail.addEventListener('pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.moved) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) { drag = null; return; }
      if (Math.abs(dx) < 6) return;
      drag.moved = true;
      projectCardRail.classList.add('is-dragging');
      projectCardRail.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    const requested = drag.left - dx;
    const max = projectCards.length ? targetLeft(projectCards.length - 1) : 0;
    projectCardRail.scrollLeft = Math.max(0, Math.min(max, requested));
    pull(requested < 0 ? -requested : requested > max ? max - requested : 0);
  });
  const endDrag = (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const moved = drag.moved;
    const index = projectCards.length ? nearestIndex() : 0;
    drag = null;
    projectCardRail.classList.remove('is-dragging');
    releasePull();
    if (projectCardRail.hasPointerCapture(event.pointerId)) projectCardRail.releasePointerCapture(event.pointerId);
    if (moved) {
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 0);
      centerCard(index);
    }
  };
  projectCardRail.addEventListener('pointerup', endDrag);
  projectCardRail.addEventListener('pointercancel', endDrag);
  projectCardRail.addEventListener('lostpointercapture', (event) => {
    if (event.target === projectCardRail) endDrag(event);
  });
  projectCardRail.addEventListener('click', (event) => {
    if (suppressClick) { event.preventDefault(); event.stopPropagation(); }
  }, true);
  projectCardRail.addEventListener('dragstart', (event) => event.preventDefault());
  projectCardRail.addEventListener('wheel', (event) => {
    if (event.ctrlKey || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    const max = projectCards.length ? targetLeft(projectCards.length - 1) : 0;
    if ((projectCardRail.scrollLeft <= 1 && event.deltaX < 0) || (projectCardRail.scrollLeft >= max - 1 && event.deltaX > 0)) {
      event.preventDefault();
      pull(-event.deltaX);
      clearTimeout(settleTimer);
      settleTimer = setTimeout(releasePull, 160);
    }
  }, {passive: false});
  new ResizeObserver(() => centerCard(activeIndex, false)).observe(projectCardRail);
  centerCard(0, false);

  const projectSection = projectCardRail.closest('.home-projects');
  const resizeHandle = projectSection.querySelector('.home-project-resize');
  if (resizeHandle && projectCards.length) {
    const maximumExtra = 480;
    let sizeExtra = 0, resizeDrag;
    const setSize = (extra) => {
      sizeExtra = Math.max(0, Math.min(maximumExtra, extra));
      projectSection.style.setProperty('--project-size-extra', `${sizeExtra}px`);
    };
    const syncSizeRange = () => {
      if (!projectCardRail.clientWidth) return;
      const height = projectCards[0].offsetHeight;
      resizeHandle.setAttribute('aria-valuenow', height);
      resizeHandle.setAttribute('aria-valuemin', height - Math.round(sizeExtra));
      resizeHandle.setAttribute('aria-valuemax', height - Math.round(sizeExtra) + maximumExtra);
      resizeHandle.setAttribute('aria-valuetext', `${height} pixels tall. Use up and down arrow keys to resize.`);
      // A taller cover paints a wider crop; request enough source pixels for it.
      projectCards.forEach((card) => {
        const cover = card.querySelector('.case-image');
        const image = cover?.querySelector('img');
        if (!image) return;
        const ratio = Number(image.getAttribute('width')) / Number(image.getAttribute('height'));
        if (!Number.isFinite(ratio) || ratio <= 0) return;
        image.sizes = `${Math.ceil(Math.max(cover.clientWidth, cover.clientHeight * ratio))}px`;
      });
    };
    const endResize = (cancel = false) => {
      if (!resizeDrag) return;
      const {id, extra} = resizeDrag;
      resizeDrag = null;
      if (cancel) setSize(extra);
      projectSection.classList.remove('is-resizing');
      if (resizeHandle.hasPointerCapture(id)) resizeHandle.releasePointerCapture(id);
      syncSizeRange();
    };
    resizeHandle.hidden = false;
    resizeHandle.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || !event.isPrimary) return;
      event.preventDefault();
      resizeHandle.focus({preventScroll: true});
      resizeDrag = {id: event.pointerId, y: event.clientY, extra: sizeExtra};
      projectSection.classList.add('is-resizing');
      resizeHandle.setPointerCapture(event.pointerId);
    });
    resizeHandle.addEventListener('pointermove', (event) => {
      if (resizeDrag?.id !== event.pointerId) return;
      event.preventDefault();
      setSize(resizeDrag.extra + event.clientY - resizeDrag.y);
    });
    resizeHandle.addEventListener('pointerup', (event) => {
      if (resizeDrag?.id === event.pointerId) endResize();
    });
    resizeHandle.addEventListener('pointercancel', (event) => {
      if (resizeDrag?.id === event.pointerId) endResize(true);
    });
    resizeHandle.addEventListener('lostpointercapture', (event) => {
      if (event.target === resizeHandle && resizeDrag?.id === event.pointerId) endResize();
    });
    resizeHandle.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && resizeDrag) { event.preventDefault(); endResize(true); return; }
      if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (resizeDrag) endResize();
      const step = event.shiftKey ? 64 : 24;
      setSize(event.key === 'Home' ? 0 : event.key === 'End' ? maximumExtra
        : sizeExtra + (event.key === 'ArrowDown' ? step : -step));
    });
    new ResizeObserver(syncSizeRange).observe(projectCardRail);
    syncSizeRange();
  }
}

// Match the original brand typeout timing, without an idle animation.
const homeBrand = document.querySelector('.home-brand');
const brandSuffix = homeBrand?.querySelector('.home-brand-suffix');
if (brandSuffix) {
  const wideHeader = matchMedia('(min-width: 640px)');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let typing;
  const resetBrand = () => {
    clearInterval(typing);
    brandSuffix.textContent = '';
    homeBrand.classList.remove('is-typing');
  };
  const typeBrand = () => {
    if (!wideHeader.matches) return;
    resetBrand();
    if (reduceMotion.matches) { brandSuffix.textContent = 'adara'; return; }
    let count = 0;
    homeBrand.classList.add('is-typing');
    typing = setInterval(() => {
      brandSuffix.textContent = 'adara'.slice(0, ++count);
      if (count === 5) { clearInterval(typing); homeBrand.classList.remove('is-typing'); }
    }, 90);
  };
  homeBrand.addEventListener('mouseenter', typeBrand);
  homeBrand.addEventListener('focus', typeBrand);
  homeBrand.addEventListener('mouseleave', () => { if (document.activeElement !== homeBrand) resetBrand(); });
  homeBrand.addEventListener('blur', () => { if (!homeBrand.matches(':hover')) resetBrand(); });
  wideHeader.addEventListener('change', resetBrand);
  reduceMotion.addEventListener('change', resetBrand);
}
const copyEmail = document.querySelector('.home-copy-email');
const contactLink = document.querySelector('.home-contact a');
if (copyEmail && contactLink && navigator.clipboard?.writeText) {
  const status = document.querySelector('.home-copy-status');
  let feedbackTimer;
  const email = contactLink.textContent.trim();
  copyEmail.hidden = false;
  copyEmail.setAttribute('aria-label', `Copy ${email}`);
  const copyContactEmail = async () => {
    clearTimeout(feedbackTimer);
    try {
      await navigator.clipboard.writeText(email);
      status.textContent = 'Email copied';
    } catch {
      status.textContent = 'Could not copy. Select the address to copy it.';
    }
    status.classList.remove('is-above');
    status.classList.toggle('is-above', status.getBoundingClientRect().bottom > innerHeight - 8);
    feedbackTimer = setTimeout(() => { status.textContent = ''; }, 2500);
  };
  copyEmail.addEventListener('click', copyContactEmail);
  contactLink.addEventListener('click', (event) => {
    event.preventDefault();
    copyContactEmail();
  });
}
