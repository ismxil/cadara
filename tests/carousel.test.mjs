import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {runInNewContext} from 'node:vm'

const source = await readFile(new URL('../js/home-carousel.js', import.meta.url), 'utf8')
// Run the actual carousel event handlers with deterministic pointer events and time.
function harness() {
  const document = {activeElement: null, pointerTarget: null}
  class Element {
    constructor(slug) {
      this.slug = slug
      this.dataset = {}
      this.attrs = new Map()
      this.events = new Map()
      this.styles = new Map()
      this.style = {setProperty: (name, value) => this.styles.set(name, value)}
      const classes = new Set()
      this.classList = {
        add: (...names) => names.forEach(name => classes.add(name)),
        remove: (...names) => names.forEach(name => classes.delete(name)),
        contains: name => classes.has(name),
        toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name),
      }
      this.hidden = false
    }
    addEventListener(type, fn) { this.events.set(type, [...(this.events.get(type) || []), fn]) }
    emit(type, values = {}) {
      const event = {type, target: this, pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0, button: 0, deltaX: 0, deltaY: 0, defaultPrevented: false, preventDefault() {this.defaultPrevented = true}, stopPropagation() {}, ...values}
      for (const fn of this.events.get(type) || []) fn(event)
      return event
    }
    setAttribute(name, value) { this.attrs.set(name, value) }
    getAttribute(name) { return name === 'aria-label' ? this.slug : this.attrs.get(name) }
    removeAttribute(name) { this.attrs.delete(name) }
    matches(selector) { return selector === 'a' && this.slug && this.slug !== 'sterling' }
    querySelectorAll() { return [] }
    replaceChildren(...children) { this.children = children }
    getBoundingClientRect() {
      if (!this.slug) return {left: 0, width: 1440};
      const offset = Number.parseFloat(this.styles.get('--wheel-x') || 0)
      const width = Number.parseFloat(this.styles.get('--wheel-card-width') || 0)
      const trackOffset = Number.parseFloat(rail.track?.style.transform?.match(/translate3d\(([-\d.]+)/)?.[1] || 0)
      return {left: 720 + offset - width / 2 + trackOffset, width}
    }
    cloneNode() { return new Element(this.slug) }
    closest() { return this.slug ? this : section }
    focus() { document.activeElement = this; this.emit('focus') }
    hasPointerCapture() { return Boolean(this.captured) }
    setPointerCapture() { this.captured = true }
    releasePointerCapture() { this.captured = false }
  }
  const originals = ['lemfi', 'foma', 'cadana', 'gomoney', 'mezovest', 'sterling'].map(slug => new Element(slug))
  const body = new Element(), rail = new Element(), section = new Element()
  rail.clientWidth = rail.offsetWidth = 1440
  rail.querySelectorAll = () => originals
  rail.replaceChildren = track => { rail.track = track; rail.cards = track.children }
  rail.contains = card => rail.cards.includes(card)
  section.querySelector = () => null
  section.appendChild = () => {}
  body.children = []
  body.appendChild = child => body.children.push(child)
  Object.assign(document, {body, activeElement: body, querySelector: selector => selector === '.home-projects-grid' ? rail : null, createElement: () => new Element(), addEventListener() {}, elementFromPoint: () => document.pointerTarget})
  let now = 0, nextId = 0
  const timers = new Map()
  const setTimeout = (fn, delay) => { const id = ++nextId; timers.set(id, {fn, at: now + delay}); return id }
  const tick = duration => {
    const target = now + duration
    while (true) {
      const next = [...timers].filter(([, timer]) => timer.at <= target).sort((a, b) => a[1].at - b[1].at)[0]
      if (!next) break
      timers.delete(next[0]); now = next[1].at; next[1].fn()
    }
    now = target
  }
  class Observer {observe() {} unobserve() {}}
  runInNewContext(source, {document, window: {addEventListener() {}}, matchMedia: query => ({matches: !query.includes('reduced-motion'), addEventListener() {}}), ResizeObserver: Observer, IntersectionObserver: Observer, setTimeout, clearTimeout: id => timers.delete(id), requestAnimationFrame: fn => setTimeout(fn, 16), cancelAnimationFrame: id => timers.delete(id)})
  return {rail, tick, document, cursor: body.children[0], active: () => rail.cards.find(card => card.classList.contains('is-active')), side: offset => rail.cards[rail.cards.findIndex(card => card.classList.contains('is-active')) + offset]}
}

test('eye cursor is restricted to the settled center card', () => {
  const h = harness()
  h.side(1).emit('pointerenter')
  assert.equal(h.cursor.hidden, true)
  h.active().emit('pointerenter')
  assert.equal(h.cursor.hidden, false)
  h.side(1).emit('pointerenter')
  assert.equal(h.cursor.hidden, true)
  const next = h.side(1)
  h.rail.emit('click', {target: next})
  next.emit('pointerenter')
  assert.equal(h.cursor.hidden, true)
  h.tick(420)
  next.emit('pointermove')
  assert.equal(h.cursor.hidden, false)
})

test('trackpad momentum advances once until the gesture has ended', () => {
  const h = harness()
  for (let i = 0; i < 9; i++) {h.rail.emit('wheel', {deltaX: 45}); h.tick(100)}
  h.tick(500)
  assert.equal(h.active().slug, 'gomoney')
  h.rail.emit('wheel', {deltaX: 45}); h.tick(420)
  assert.equal(h.active().slug, 'mezovest')
})

test('dragging snaps to the nearest card and ignores a delayed release click', () => {
  const h = harness()
  h.rail.emit('pointerdown', {clientX: 720})
  h.rail.emit('pointermove', {clientX: 650})
  h.rail.emit('pointerup', {clientX: 650})
  h.tick(600)
  assert.equal(h.active().slug, 'cadana')
  h.rail.emit('pointerdown', {clientX: 720})
  h.rail.emit('pointermove', {clientX: 380})
  h.rail.emit('pointerup', {clientX: 380})
  h.tick(600)
  assert.equal(h.active().slug, 'gomoney')
  assert.equal(h.rail.emit('click', {target: h.side(1)}).defaultPrevented, true)
  assert.equal(h.active().slug, 'gomoney')
  h.rail.emit('pointerdown', {clientX: 720})
  h.rail.emit('pointerup', {clientX: 720})
  assert.equal(h.rail.emit('click', {target: h.active()}).defaultPrevented, false)
})

test('cancelled pointer capture does not advance and a fresh wheel gesture still works after a drag', () => {
  const h = harness()
  h.rail.emit('pointerdown', {clientX: 720})
  h.rail.emit('pointermove', {clientX: 380})
  h.rail.emit('lostpointercapture', {clientX: 0})
  h.tick(600)
  assert.equal(h.active().slug, 'cadana')
  h.rail.emit('wheel', {deltaX: 45}); h.tick(420)
  assert.equal(h.active().slug, 'gomoney')
})

test('a project dragged in from the second side slot becomes the centered project', () => {
  const h = harness()
  const draggedProject = h.side(2)
  h.rail.emit('pointerdown', {target: draggedProject, clientX: 1310})
  h.rail.emit('pointermove', {clientX: 720})
  h.rail.emit('pointerup', {clientX: 720})
  h.tick(1500)
  assert.equal(h.active(), draggedProject)
  assert.equal(h.active().slug, 'mezovest')
})

test('a new drag responds while the previous selection is still centering', () => {
  const h = harness()
  h.rail.emit('click', {target: h.side(1)})
  h.tick(80)
  h.rail.emit('pointerdown', {clientX: 720})
  h.rail.emit('pointermove', {clientX: 1060})
  h.tick(16)
  assert.match(h.rail.track.style.transform, /340px/)
  h.rail.emit('pointerup', {clientX: 1060})
  h.tick(500)
  assert.equal(h.active().slug, 'cadana')
})

test('high-frequency drag input is painted only on animation frames', () => {
  const h = harness()
  h.rail.emit('pointerdown', {clientX: 720})
  for (let x = 710; x >= 620; x -= 10) h.rail.emit('pointermove', {clientX: x})
  assert.match(h.rail.track.style.transform, /translate3d\(0px/)
  h.tick(16)
  assert.match(h.rail.track.style.transform, /-100px/)
  for (let x = 610; x >= 520; x -= 10) h.rail.emit('pointermove', {clientX: x})
  assert.match(h.rail.track.style.transform, /-100px/)
  h.tick(16)
  assert.match(h.rail.track.style.transform, /-200px/)
})
