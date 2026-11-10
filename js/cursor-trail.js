// Dot trail: small Cadara-green circles, snapped to a grid, dropped along
// the pointer path and faded out. Purely decorative, so it stays out of the
// way of touch devices, reduced-motion preferences and pointer events.
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const COLOR = '0, 233, 53'; // #00E935
  const CELL = 12;            // grid the squares snap to
  const SIZE = 9;             // dot diameter
  const SPACING = 34;         // distance travelled between squares
  const LIFE = 1100;          // ms until a square has fully faded

  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-trail';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '2147483646',
  });
  document.body.appendChild(canvas);
  // Keep the green target as the pointer across the page; the trail follows it.
  document.body.style.cursor = 'url("/asset/home/click-cursor.svg") 16 16, crosshair';
  const ctx = canvas.getContext('2d');

  let width = 0, height = 0, ratio = 1;
  function resize() {
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = innerWidth;
    height = innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  resize();
  addEventListener('resize', resize);

  const squares = [];
  let last = null, travelled = 0, frame = 0;

  function drop(x, y, time) {
    const gx = Math.round(x / CELL) * CELL;
    const gy = Math.round(y / CELL) * CELL;
    const previous = squares[squares.length - 1];
    if (previous && previous.x === gx && previous.y === gy) return;
    squares.push({x: gx, y: gy, born: time});
  }

  addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    const now = performance.now();
    const point = {x: event.clientX, y: event.clientY};
    if (!last) {
      last = point;
      drop(point.x, point.y, now);
    } else {
      const dx = point.x - last.x, dy = point.y - last.y;
      const distance = Math.hypot(dx, dy);
      // Lay squares at even intervals along the segment so fast moves stay continuous.
      let along = SPACING - travelled;
      while (along <= distance) {
        const t = along / distance;
        drop(last.x + dx * t, last.y + dy * t, now);
        along += SPACING;
      }
      travelled = (travelled + distance) % SPACING;
      last = point;
    }
    if (!frame) frame = requestAnimationFrame(draw);
  }, {passive: true});

  document.addEventListener('pointerleave', () => { last = null; travelled = 0; });

  function draw(now) {
    ctx.clearRect(0, 0, width, height);
    while (squares.length && now - squares[0].born > LIFE) squares.shift();
    const offset = SIZE / 2;
    for (const square of squares) {
      const progress = (now - square.born) / LIFE;
      const alpha = 0.6 * (1 - progress) ** 1.6;
      ctx.fillStyle = `rgba(${COLOR}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(square.x, square.y, offset, 0, Math.PI * 2);
      ctx.fill();
    }
    frame = squares.length ? requestAnimationFrame(draw) : 0;
  }
})();
