import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {runInNewContext} from 'node:vm'

const source = await readFile(new URL('../js/loader.js', import.meta.url), 'utf8')
function harness({reduced = false, symbolError = false, noLoader = false, noSymbol = false, lateScript = false} = {}) {
  const classes = () => {
    const values = new Set()
    return {add: (...names) => names.forEach(n => values.add(n)), remove: (...names) => names.forEach(n => values.delete(n)), contains: n => values.has(n)}
  }
  const timers = new Map(), events = [], windowEvents = {}, animationEvents = {}
  let nextId = 0
  const body = {classList: classes()}
  const loader = {classList: classes(), querySelector: () => noSymbol ? null : {addEventListener: (name, fn) => {animationEvents[name] = fn}}}
  const setTimeout = (fn, ms) => {const id = ++nextId; timers.set(id, {fn, ms}); return id}
  const clearTimeout = id => timers.delete(id)
  const document = {
    readyState: 'complete', body,
    getElementById: () => noLoader ? null : loader,
    querySelectorAll: () => [{complete: false, addEventListener() {}}],
    dispatchEvent: event => events.push(event.type),
  }
  // Any attempt to wait for fonts is a regression; pending images never finish.
  Object.defineProperty(document, 'fonts', {get() {throw new Error('Loader accessed fonts')}})
  const window = {
    matchMedia: () => ({matches: reduced}),
    initCadaraSymbols() {if (symbolError) throw new Error('Symbol failed')},
    addEventListener: (name, fn) => {windowEvents[name] = fn},
  }
  runInNewContext(source, {window, document, setTimeout, clearTimeout, performance: {now: () => lateScript ? 1500 : 0}, CustomEvent: class {constructor(type) {this.type = type}}})
  const runTimer = ms => {
    const entry = [...timers].find(([, timer]) => timer.ms === ms)
    assert.ok(entry, `Expected ${ms}ms timer`)
    timers.delete(entry[0]); entry[1].fn()
  }
  return {body, loader, events, timers, windowEvents, animationEvents, runTimer}
}
test('pending images, fonts and missing animation events cannot hold the page', () => {
  const h = harness()
  assert.ok(h.body.classList.contains('is-loading'))
  h.runTimer(650)
  assert.ok(h.body.classList.contains('is-ready'))
  assert.ok(!h.body.classList.contains('is-loading'))
  h.runTimer(120)
  assert.ok(h.loader.classList.contains('is-hidden'))
  assert.deepEqual(h.events, ['cadara:ready'])
})
test('animation completion reveals immediately and cancels the deadline', () => {
  const h = harness()
  h.animationEvents.animationend({animationName: 'cadara-loader-rotate'})
  assert.ok(h.body.classList.contains('is-ready'))
  assert.ok(![...h.timers.values()].some(t => t.ms === 650))
  h.animationEvents.animationend({animationName: 'cadara-loader-rotate'})
  assert.equal(h.events.length, 1)
})
test('reduced motion, unavailable symbols and symbol errors reveal safely', () => {
  for (const options of [{reduced: true}, {symbolError: true}, {noLoader: true}, {noSymbol: true}, {lateScript: true}]) {
    const h = harness(options)
    assert.ok(h.body.classList.contains('is-ready'))
    assert.ok(!h.body.classList.contains('is-loading'))
  }
})
test('back/forward cache restoration clears a blocking state', () => {
  const h = harness()
  h.body.classList.add('is-leaving')
  h.windowEvents.pageshow({persisted: true})
  assert.ok(h.body.classList.contains('is-ready'))
  assert.ok(!h.body.classList.contains('is-loading'))
  assert.ok(!h.body.classList.contains('is-leaving'))
  assert.ok(h.loader.classList.contains('is-hidden'))
})
