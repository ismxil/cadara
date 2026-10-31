import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {densifyPaths, splitCubic} from '../js/wordmark-geometry.js'
const evaluate = ([a, b, c, d], t) => ({x: (1-t)**3*a.x + 3*(1-t)**2*t*b.x + 3*(1-t)*t*t*c.x + t**3*d.x, y: (1-t)**3*a.y + 3*(1-t)**2*t*b.y + 3*(1-t)*t*t*c.y + t**3*d.y})
const close = (a, b) => assert.ok(Math.hypot(a.x-b.x, a.y-b.y) < 1e-8)
test('Bézier subdivision preserves the original contour exactly', () => {
  const curve = [{x: 0, y: 0}, {x: 150, y: -220}, {x: 300, y: 400}, {x: 500, y: 0}]
  const [left, right] = splitCubic(curve, .4)
  for (const t of [0, .2, .5, .8, 1]) {
    close(evaluate(left, t), evaluate(curve, t*.4))
    close(evaluate(right, t), evaluate(curve, .4 + t*.6))
  }
  const input = [[{type: 'M', ...curve[0]}, {type: 'C', x1: 150, y1: -220, x2: 300, y2: 400, x: 500, y: 0}, {type: 'Z'}]]
  const original = structuredClone(input)
  const segments = densifyPaths(input)[0].filter(c => c.type === 'C')
  let start = curve[0]
  segments.forEach((c, index) => {
    const piece = [start, {x: c.x1, y: c.y1}, {x: c.x2, y: c.y2}, {x: c.x, y: c.y}]
    for (const t of [0, .5, 1]) close(evaluate(piece, t), evaluate(curve, (index+t)/segments.length))
    start = piece[3]
  })
  assert.deepEqual(input, original)
})
test('quadratic curves and straight edges retain their shape with more editable nodes', () => {
  const path = [{type: 'M', x: 0, y: 0}, {type: 'Q', x1: 150, y1: -200, x: 300, y: 0}]
  const segments = densifyPaths([path])[0].slice(1)
  let start = {x: 0, y: 0}
  segments.forEach((c, index) => {
    const t = (index+.5)/segments.length
    close(evaluate([start, {x:c.x1,y:c.y1}, {x:c.x2,y:c.y2}, c], .5), {x: 300*t, y: -400*t*(1-t)})
    start = c
  })
  const line = densifyPaths([[{type:'M',x:0,y:0},{type:'L',x:0,y:400},{type:'Z'}]])[0]
  assert.ok(line.length > 3)
  assert.equal(line.at(-1).type, 'Z')
  assert.equal(line.at(-2).y, 400)
  assert.ok(line.slice(1,-1).every(c => c.x === 0 && c.x1 === 0 && c.x2 === 0))
})
test('Cadara gains nodes while retaining every glyph and contour', async () => {
  const {paths} = JSON.parse(await readFile(new URL('../asset/home/wordmark-outline.json', import.meta.url)))
  const dense = densifyPaths(paths)
  assert.equal(dense.length, paths.length)
  assert.ok(dense.flat().length > paths.flat().length * 1.7)
  for (let i = 0; i < paths.length; i++) {
    assert.deepEqual(dense[i].filter(c=>c.type==='M'), paths[i].filter(c=>c.type==='M'))
    assert.equal(dense[i].filter(c=>c.type==='Z').length, paths[i].filter(c=>c.type==='Z').length)
  }
})
