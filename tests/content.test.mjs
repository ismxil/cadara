import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp, readFile, access, rm} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {load} from 'cheerio'
import {extractContent} from '../scripts/content.mjs'
import {buildSite, validateContent} from '../scripts/build.mjs'
import {renderBody, safeUrl} from '../scripts/render.mjs'
const fixture = async () => {
  const docs = await extractContent()
  function assets(value) {
    if (!value || typeof value !== 'object') return
    if (value.localPath) {value.asset = {_type: 'reference', _ref: 'image-0123456789abcdef0123456789abcdef01234567-800x600-jpg'}; delete value.localPath}
    Object.values(value).forEach(assets)
  }
  docs.forEach(assets)
  return docs
}
test('migration preserves source projects, duration, image count, text and layouts', async () => {
  const docs = await extractContent()
  assert.equal(docs.length, 7)
  assert.equal(docs.filter(d => d._type === 'caseStudy' && !d.comingSoon).length, 5)
  const mezovest = docs.find(d => d.title === 'Mezovest')
  assert.equal(mezovest.duration, '6 months')
  assert.equal(mezovest.date, undefined)
  assert.equal(mezovest.gallery.length, 14)
  const lemfi = docs.find(d => d.title === 'Lemfi')
  assert.equal(lemfi.date, '2023-06-23')
  assert.equal(lemfi.gallery[2]._type, 'galleryText')
  assert.equal(lemfi.gallery[2].width, 'half')
  assert.equal(lemfi.gallery[0].width, 'full')
  assert.equal(lemfi.gallery[0].aspectRatio, 3744 / 1842)
  const paths = new Set()
  function collect(value) {
    if (!value || typeof value !== 'object') return
    if (value.localPath) paths.add(value.localPath)
    Object.values(value).forEach(collect)
  }
  docs.forEach(collect)
  assert.equal(paths.size, 66)
})
test('published content generates new routes, edited copy, CMS images and safe article markup', async () => {
  const docs = await fixture()
  docs.find(d => d._type === 'studioPage').headline = 'An updated studio headline'
  const project = structuredClone(docs.find(d => d.title === 'Lemfi'))
  Object.assign(project, {_id: 'new-project', title: 'New project', slug: {current: 'new-project'}, featured: false, order: 10})
  docs.push(project)
  docs.push({_id: 'article', _type: 'insight', title: 'A new insight', slug: {current: 'a-new-insight'}, excerpt: 'Fresh thinking', author: 'Cadara', publishedAt: '2026-10-13', body: [{_type: 'block', _key: 'p', style: 'normal', markDefs: [], children: [{_type: 'span', _key: 's', marks: [], text: '<script>alert(1)</script>'}]}]})
  const output = await mkdtemp(path.join(os.tmpdir(), 'cadara-test-'))
  try {
    await buildSite(docs, output)
    const home = load(await readFile(path.join(output, 'index.html'), 'utf8'))
    assert.equal(home('.intro-headline').text(), 'An updated studio headline')
    assert.equal(home('.case-card').length, 6)
    assert.equal(home('.case-card--soon').length, 1)
    assert.equal(home('[href="/cases/new-project.html"]').length, 0)
    assert.match(home('.case-image img').first().attr('src'), /^https:\/\/cdn.sanity.io\//)
    const studioPage = load(await readFile(path.join(output, 'studio.html'), 'utf8'))
    assert.equal(studioPage('.nav-links [href="/studio.html"]').length, 1)
    assert.equal(studioPage('link[href="/css/studio.css"]').length, 1)
    const work = load(await readFile(path.join(output, 'cases/work.html'), 'utf8'))
    assert.equal(work('[href="/cases/new-project.html"]').length, 1)
    await access(path.join(output, 'cases/new-project.html'))
    await assert.rejects(access(path.join(output, 'cases/sterling.html')))
    const casePage = load(await readFile(path.join(output, 'cases/mezovest.html'), 'utf8'))
    assert.equal(casePage('.meta-date').text(), '6 months')
    const article = load(await readFile(path.join(output, 'insights/a-new-insight.html'), 'utf8'))
    assert.equal(article('h1').text(), 'A new insight')
    assert.equal(article('.insight-body script').length, 0)
    assert.equal(article('.insight-body p').text(), '<script>alert(1)</script>')
    assert.equal(article('.nav-links [href="/insights/index.html"]').length, 1)
    // Unpublishing removes a previously generated page on the next build.
    await buildSite(docs.filter(d => d._id !== 'new-project' && d._id !== 'article'), output)
    await assert.rejects(access(path.join(output, 'cases/new-project.html')))
    await assert.rejects(access(path.join(output, 'insights/a-new-insight.html')))
  } finally { await rm(output, {recursive: true, force: true}) }
})
test('rejects duplicate and reserved slugs, missing studio content, and unsafe links', async () => {
  const docs = await fixture()
  assert.throws(() => validateContent([]), /Studio content is missing/)
  docs.push({...docs[0], _id: 'duplicate'})
  assert.throws(() => validateContent(docs), /Duplicate/)
  docs.pop()
  docs[0].slug.current = '../escape'
  assert.throws(() => validateContent(docs), /Invalid/)
  docs[0].slug.current = 'work'
  assert.throws(() => validateContent(docs), /reserved/)
  assert.equal(safeUrl('javascript:alert(1)'), '')
  const html = renderBody([{_type: 'block', style: 'normal', markDefs: [{_key: 'link', _type: 'link', href: 'javascript:alert(1)'}], children: [{_type: 'span', marks: ['link'], text: 'Click'}]}])
  assert.equal(html, '<p>Click</p>')
})
