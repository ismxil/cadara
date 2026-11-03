(() => {
  const rail = document.querySelector('.home-projects-grid');
  const originals = [...(rail?.querySelectorAll('.home-project-card') || [])];
  if (!originals.length) return;
  const section = rail.closest('.home-projects');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const desktop = matchMedia('(min-width: 721px) and (hover: hover) and (pointer: fine)');
  const count = originals.length;
  const modulo = value => ((value % count) + count) % count;
  // Three copies keep both sides populated while crossing either end of the list.
  const cards = [];
  for (let copy = 0; copy < (count > 1 ? 3 : 1); copy++) {
    originals.forEach((original, index) => {
      const card = copy === 1 || count === 1 ? original : original.cloneNode(true);
      card.dataset.wheelIndex = String(index);
      card.dataset.wheelCopy = String(copy);
      cards.push(card);
    });
  }
  const track = document.createElement('div');
  track.className = 'home-wheel-track';
  track.replaceChildren(...cards);
  rail.replaceChildren(track);
  let position = (count > 1 ? count : 0) + Math.min(2, count - 1);
  let dragFrame = 0, dragOffset = 0, paintedDragOffset = 0;
  let scale = 1, layout, drag, settling = false, settleTimer, suppressClick = false;
  let cursorCard, previewCard, previewTimer, previewGeneration = 0, lastPointer;
  const cursor = document.createElement('span');
  cursor.className = 'home-project-eye home-project-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.hidden = true;
  document.body.appendChild(cursor);
  const status = document.createElement('span');
  status.className = 'home-wheel-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  section.appendChild(status);
  rail.setAttribute('aria-roledescription', 'carousel');
  rail.setAttribute('aria-label', 'Projects. Use left and right arrows to explore. Select a side card to center it, then select again to open.');
  const currentCard = () => cards[position];
  const hideCursor = () => {
    cursorCard?.classList.remove('has-eye-cursor');
    cursorCard = null;
    cursor.hidden = true;
  };
  const moveCursor = (event, card) => {
    lastPointer = {clientX: event.clientX, clientY: event.clientY, pointerType: event.pointerType};
    if (!finePointer.matches || event.pointerType === 'touch' || drag?.moved || settling || card !== currentCard() || !card.matches('a')) {
      hideCursor();
      return;
    }
    if (cursorCard !== card) {
      hideCursor();
      cursorCard = card;
      card.classList.add('has-eye-cursor');
    }
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.hidden = false;
  };
  const loadSlides = card => {
    card.querySelectorAll('img[data-src]').forEach(slide => {
      slide.loading = 'eager';
      if (slide.dataset.srcset) slide.srcset = slide.dataset.srcset;
      slide.src = slide.dataset.src;
      delete slide.dataset.src;
      delete slide.dataset.srcset;
      slide.decode().catch(() => {});
    });
  };
  const stopPreview = () => {
    previewGeneration++;
    clearTimeout(previewTimer);
    if (previewCard) {
      previewCard.classList.remove('is-previewing');
      previewCard.querySelectorAll('.case-image img').forEach((slide, index) => slide.classList.toggle('is-visible', index === 0));
    }
    previewCard = null;
    rail.classList.remove('has-preview');
  };
  const startPreview = card => {
    if (card !== currentCard() || settling || drag || reducedMotion.matches || !finePointer.matches || !card.matches('a') || previewCard === card) return;
    stopPreview();
    previewCard = card;
    card.classList.add('is-previewing');
    rail.classList.add('has-preview');
    loadSlides(card);
    const slides = [...card.querySelectorAll('.case-image img')];
    const token = previewGeneration;
    let index = 0;
    const advance = async () => {
      if (token !== previewGeneration || slides.length < 2) return;
      index = (index + 1) % slides.length;
      try {
        await slides[index].decode();
        if (token !== previewGeneration) return;
        slides.forEach((slide, i) => slide.classList.toggle('is-visible', i === index));
      } catch { /* Keep the loaded frame when the next image is unavailable. */ }
      if (token === previewGeneration) previewTimer = setTimeout(advance, 600);
    };
    advance();
  };
  const syncPointer = () => {
    if (!lastPointer || drag) return;
    const card = document.elementFromPoint(lastPointer.clientX, lastPointer.clientY)?.closest('.home-project-card');
    if (card && rail.contains(card)) {
      moveCursor(lastPointer, card);
      if (card === currentCard()) startPreview(card);
    } else hideCursor();
  };
  const geometry = () => {
    const width = rail.clientWidth;
    const gap = 20;
    const base = width <= 720 ? width - 42 : Math.min(660, Math.max(300, width * .32));
    const center = base * scale;
    const sideBase = width <= 720 ? base : Math.max(80, (width - base - (width >= 1000 ? 6 : 4) * gap) / (width >= 1000 ? 4 : 2));
    const side = sideBase * scale;
    return {width, gap, base, center, side, sideBase, height: center * 2 / 3};
  };
  const cardOffset = (index, origin = position) => {
    const distance = index - origin;
    return distance === 0 ? 0 : Math.sign(distance) * (layout.center / 2 + layout.gap + layout.side / 2 + (Math.abs(distance) - 1) * (layout.side + layout.gap));
  };
  const render = () => {
    if (!rail.clientWidth) return;
    layout = geometry();
    rail.style.setProperty('--wheel-height', `${layout.height}px`);
    rail.style.setProperty('--wheel-base-height', `${layout.base * 2 / 3}px`);
    rail.style.setProperty('--wheel-side-base-width', `${layout.sideBase}px`);
    rail.style.setProperty('--wheel-scale', String(scale));
    rail.style.setProperty('--card-row-gap', `${layout.gap}px`);
    cards.forEach((card, index) => {
      const distance = index - position;
      const centered = distance === 0;
      const x = cardOffset(index);
      const visible = Math.abs(x) - (centered ? layout.center : layout.side) / 2 < layout.width / 2;
      card.style.setProperty('--wheel-x', `${x}px`);
      card.style.setProperty('--wheel-card-width', `${centered ? layout.center : layout.side}px`);
      card.classList.toggle('is-active', centered);
      card.classList.toggle('is-offscreen', !visible);
      card.tabIndex = centered ? 0 : -1;
      card.setAttribute('aria-hidden', String(!visible));
      if (centered) card.setAttribute('aria-current', 'true');
      else card.removeAttribute('aria-current');
      card.querySelectorAll('img[src]').forEach(img => { if (visible) img.loading = 'eager'; });
    });
  };
  const rebase = () => {
    const canonical = count > 1 ? count + modulo(position) : 0;
    if (canonical === position) return;
    const focused = document.activeElement === currentCard();
    stopPreview();
    hideCursor();
    rail.classList.add('is-rebasing');
    position = canonical;
    render();
    // Commit the identical visual positions before allowing the next transition.
    void rail.offsetWidth;
    rail.classList.remove('is-rebasing');
    if (focused) currentCard().focus({preventScroll: true});
  };
  const finish = () => {
    clearTimeout(settleTimer);
    rebase();
    settling = false;
    status.textContent = `${originals[modulo(position)].getAttribute('aria-label')}. Project ${modulo(position) + 1} of ${count}.`;
    if (document.activeElement === currentCard()) startPreview(currentCard());
    syncPointer();
  };
  const select = (target, focus = false) => {
    if (target === position) return;
    clearTimeout(settleTimer);
    stopPreview();
    hideCursor();
    position = Math.max(0, Math.min(cards.length - 1, target));
    settling = !reducedMotion.matches;
    render();
    if (focus) currentCard().focus({preventScroll: true});
    if (settling) settleTimer = setTimeout(finish, 420);
    else finish();
  };
  const step = (direction, focus = false) => {
    if (settling || count < 2) return;
    select(position + direction, focus);
  };
  cards.forEach(card => {
    card.addEventListener('pointerenter', event => { moveCursor(event, card); startPreview(card); });
    card.addEventListener('pointermove', event => moveCursor(event, card));
    card.addEventListener('pointerleave', () => {
      if (cursorCard === card) hideCursor();
      if (previewCard === card && document.activeElement !== card) stopPreview();
    });
    card.addEventListener('focus', () => startPreview(card));
    card.addEventListener('blur', () => { if (previewCard === card) stopPreview(); });
  });
  rail.addEventListener('click', event => {
    const card = event.target.closest('.home-project-card');
    if (!card || !rail.contains(card)) return;
    if (suppressClick || settling) {
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
      return;
    }
    if (card !== currentCard()) {
      event.preventDefault();
      select(cards.indexOf(card), true);
    }
  }, true);
  rail.addEventListener('keydown', event => {
    if (event.key === 'Enter') suppressClick = false;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (settling) return;
    if (event.key === 'Home') select(count > 1 ? count : 0, true);
    else if (event.key === 'End') select((count > 1 ? count : 0) + count - 1, true);
    else step(event.key === 'ArrowRight' ? 1 : -1, true);
  });
  let wheelDelta = 0, wheelTimer, wheelLocked = false;
  rail.addEventListener('wheel', event => {
    if (event.ctrlKey || count < 2 || (!event.shiftKey && Math.abs(event.deltaX) <= Math.abs(event.deltaY))) return;
    event.preventDefault();
    // Treat the full trackpad gesture, including its momentum tail, as one move.
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelDelta = 0; wheelLocked = false; }, 180);
    if (settling || drag || wheelLocked) { wheelLocked = true; return; }
    wheelDelta += (event.shiftKey ? event.deltaY || event.deltaX : event.deltaX) * (event.deltaMode === 1 ? 20 : 1);
    if (Math.abs(wheelDelta) >= 40) {
      step(Math.sign(wheelDelta));
      wheelDelta = 0;
      wheelLocked = true;
    }
  }, {passive: false});
  rail.addEventListener('pointerdown', event => {
    if (event.button !== 0 || count < 2) return;
    suppressClick = false;
    drag = {id: event.pointerId, x: event.clientX, y: event.clientY, moved: false};
  });
  rail.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.moved) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) { drag = null; return; }
      if (Math.abs(dx) < 6) return;
      drag.moved = true;
      drag.baseOffset = track.getBoundingClientRect().left - rail.getBoundingClientRect().left;
      paintedDragOffset = drag.baseOffset;
      track.style.transform = `translate3d(${drag.baseOffset}px, 0, 0)`;
      clearTimeout(settleTimer);
      settling = false;
      stopPreview(); hideCursor();
      rail.classList.add('is-dragging');
      rail.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    dragOffset = Math.max(-layout.width / 2, Math.min(layout.width / 2, (drag.baseOffset || 0) + dx));
    if (!dragFrame) dragFrame = requestAnimationFrame(() => {
      dragFrame = 0;
      paintedDragOffset = dragOffset;
      track.style.transform = `translate3d(${dragOffset}px, 0, 0)`;
    });
  });
  const endDrag = event => {
    if (drag?.id !== event.pointerId) return;
    const {moved, x, baseOffset = 0} = drag;
    if (dragFrame) { cancelAnimationFrame(dragFrame); dragFrame = 0; }
    const dx = Math.max(-layout.width / 2, Math.min(layout.width / 2, baseOffset + event.clientX - x));
    // Select the card actually nearest the center, not the next card merely
    // because a drag passed a fixed threshold. Cancellation keeps the selection.
    const railCenter = rail.getBoundingClientRect().left + rail.clientWidth / 2;
    const offsets = cards.map(card => {
      const rect = card.getBoundingClientRect();
      return rect.left + rect.width / 2 - railCenter - paintedDragOffset;
    });
    const target = moved && event.type === 'pointerup' ? cards.reduce((nearest, _, index) =>
      Math.abs(offsets[index] + dx) < Math.abs(offsets[nearest] + dx) ? index : nearest, position) : position;
    drag = null;
    rail.classList.remove('is-dragging');
    dragOffset = paintedDragOffset = 0;
    track.style.transform = 'translate3d(0px, 0, 0)';
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    if (moved) {
      // Keep this guard until the synthetic click is consumed or another
      // intentional pointerdown occurs; touch clicks can arrive after a delay.
      suppressClick = true;
      wheelLocked = true;
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => { wheelDelta = 0; wheelLocked = false; }, 180);
      if (target !== position) select(target);
      else {
        settling = !reducedMotion.matches;
        if (settling) settleTimer = setTimeout(finish, 420);
        else finish();
      }
    }

  };
  rail.addEventListener('pointerup', endDrag);
  rail.addEventListener('pointercancel', endDrag);
  rail.addEventListener('lostpointercapture', endDrag);
  rail.addEventListener('dragstart', event => event.preventDefault());
  const resize = section.querySelector('.home-project-resize');
  let resizeDrag;
  const maximumScale = () => layout ? Math.max(1, Math.min(2, (layout.width - 2 * layout.gap) / layout.base)) : 1;
  const syncResize = () => {
    if (!resize) return;
    resize.hidden = !desktop.matches;
    resize.setAttribute('aria-valuenow', String(Math.round(scale * 100)));
    resize.setAttribute('aria-valuemax', String(Math.round(maximumScale() * 100)));
    resize.setAttribute('aria-valuetext', `${Math.round(scale * 100)} percent card size. Use up and down arrow keys to resize.`);
  };
  const setScale = value => { stopPreview(); scale = Math.max(1, Math.min(maximumScale(), value)); render(); syncResize(); };
  const endResize = event => {
    if (resizeDrag?.id !== event.pointerId) return;
    if (event.type === 'pointercancel') setScale(resizeDrag.scale);
    resizeDrag = null;
    section.classList.remove('is-resizing');
    if (resize.hasPointerCapture(event.pointerId)) resize.releasePointerCapture(event.pointerId);
  };
  resize?.addEventListener('pointerdown', event => {
    if (!desktop.matches || event.button !== 0) return;
    event.preventDefault();
    resize.focus({preventScroll: true});
    resizeDrag = {id: event.pointerId, y: event.clientY, scale};
    section.classList.add('is-resizing');
    resize.setPointerCapture(event.pointerId);
  });
  resize?.addEventListener('pointermove', event => {
    if (resizeDrag?.id === event.pointerId) setScale(resizeDrag.scale + (event.clientY - resizeDrag.y) / (layout.base * 2 / 3));
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => resize?.addEventListener(type, endResize));
  resize?.addEventListener('keydown', event => {
    if (event.key === 'Escape' && resizeDrag) {
      event.preventDefault(); setScale(resizeDrag.scale);
      endResize({pointerId: resizeDrag.id, type: 'pointercancel'});
    } else if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      setScale(event.key === 'Home' ? 1 : event.key === 'End' ? maximumScale() : scale + (event.key === 'ArrowDown' ? 1 : -1) * (event.shiftKey ? .1 : .05));
    }
  });
  new ResizeObserver(() => {
    scale = desktop.matches ? Math.min(scale, maximumScale()) : 1;
    render(); syncResize();
  }).observe(rail);
  desktop.addEventListener('change', () => { scale = 1; render(); syncResize(); });
  reducedMotion.addEventListener('change', () => { stopPreview(); if (settling) finish(); });
  finePointer.addEventListener('change', () => { stopPreview(); hideCursor(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stopPreview(); hideCursor(); } });
  document.addEventListener('pointermove', event => {
    lastPointer = {clientX: event.clientX, clientY: event.clientY, pointerType: event.pointerType};
  }, {passive: true});
  document.addEventListener('pointerleave', () => { lastPointer = null; hideCursor(); });
  window.addEventListener('blur', () => { lastPointer = null; hideCursor(); });
  window.addEventListener('scroll', syncPointer, {passive: true, capture: true});
  document.querySelector('.view-toggle')?.addEventListener('click', () => { stopPreview(); hideCursor(); });
  const warmup = new IntersectionObserver(entries => {
    if (reducedMotion.matches || !finePointer.matches) return;
    entries.forEach(entry => {
      if (entry.isIntersecting) { loadSlides(entry.target); warmup.unobserve(entry.target); }
    });
  }, {rootMargin: '300px'});
  cards.forEach(card => warmup.observe(card));
  rail.classList.add('is-wheel-ready');
  render(); syncResize();
})();
