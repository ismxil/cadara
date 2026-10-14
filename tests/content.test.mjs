import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp, readFile, access, rm} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {load} from 'cheerio'
import {extractContent} from '../scripts/content.mjs'
import {buildSite, validateContent} from '../scripts/build.mjs'
import {renderBody, safeUrl, headings} from '../scripts/render.mjs'
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
  assert.equal(docs.length, 8)
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
  assert.equal(paths.size, 68)
  const banks = docs.find(d => d._id === 'insight-what-is-killing-traditional-banks')
  assert.equal(banks.slug.current, 'what-is-killing-traditional-banks')
  assert.equal(banks.body.filter(b => b.style === 'blockquote').length, 1)
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
    assert.equal(home('body').hasClass('is-loading'), false)
    const firstImage = home('.case-image img').first()
    assert.equal(firstImage.attr('loading'), 'eager')
    assert.equal(firstImage.attr('fetchpriority'), 'high')
    assert.match(firstImage.attr('srcset'), /w=320[^,]* 320w/)
    assert.match(firstImage.attr('sizes'), /640px/)
    // The fixture is 800px wide: never advertise a larger intrinsic width.
    assert.equal(firstImage.attr('width'), '800')
    assert.equal(firstImage.attr('height'), '600')
    assert.doesNotMatch(firstImage.attr('srcset'), /1400w/)
    assert.equal(home('.case-image img').last().attr('loading'), 'lazy')
    const studioPage = load(await readFile(path.join(output, 'studio.html'), 'utf8'))
    assert.equal(studioPage('.nav-links [href="/studio.html"]').length, 1)
    assert.equal(studioPage('link[href="/css/studio.css"]').length, 1)
    const studioPhoto = studioPage('.studio-media-placeholder--image img')
    assert.match(studioPhoto.attr('src'), /-1600\.webp$/)
    assert.match(studioPhoto.attr('srcset'), /-480\.webp 480w/)
    assert.equal(studioPhoto.attr('loading'), 'lazy')
    await access(path.join(output, studioPhoto.attr('src')))
    const work = load(await readFile(path.join(output, 'cases/work.html'), 'utf8'))
    assert.equal(work('[href="/cases/new-project.html"]').length, 1)
    await access(path.join(output, 'cases/new-project.html'))
    await assert.rejects(access(path.join(output, 'cases/sterling.html')))
    const casePage = load(await readFile(path.join(output, 'cases/mezovest.html'), 'utf8'))
    assert.equal(casePage('.meta-date').text(), '6 months')
    assert.equal(casePage('.case-hero-cover img').attr('fetchpriority'), 'high')
    assert.equal(casePage('.case-gallery-item img').first().attr('loading'), 'lazy')
    const article = load(await readFile(path.join(output, 'insights/a-new-insight.html'), 'utf8'))
    assert.equal(article('h1').text(), 'A new insight')
    assert.equal(article('.insight-body script').length, 0)
    assert.equal(article('.insight-body p').text(), '<script>alert(1)</script>')
    assert.equal(article('.nav-links [href="/insights/index.html"]').length, 1)
    const seeded = load(await readFile(path.join(output, 'insights/what-is-killing-traditional-banks.html'), 'utf8'))
    assert.equal(seeded('.insight-category').first().text(), 'Opinion')
    assert.match(seeded('.insight-meta').first().text(), /20 Nov 2021.*min read/)
    assert.equal(seeded('.insight-body h2#how-can-this-be-best-approach').length, 1)
    assert.equal(seeded('.insight-body a[href^="https://www.financial-ombudsman.org.uk/"]').length, 1)
    assert.equal(seeded('.insight-related .insight-card').length, 1)
    assert.equal(JSON.parse(seeded('script[type="application/ld+json"]').text()).datePublished, '2021-11-20')
    const index = load(await readFile(path.join(output, 'insights/index.html'), 'utf8'))
    assert.equal(index('.insight-card--featured h2').text(), 'A new insight')
    assert.equal(index('.insight-filters button').length, 2)
    assert.equal(index('.insight-filters [aria-pressed="true"]').text(), 'All2')
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
  assert.deepEqual(headings([{_type: 'block', style: 'h2', children: [{text: 'Same'}]}, {_type: 'block', style: 'h2', children: [{text: 'Same'}]}]).map(h => h.id), ['same', 'same-2'])
  const html = renderBody([{_type: 'block', style: 'normal', markDefs: [{_key: 'link', _type: 'link', href: 'javascript:alert(1)'}], children: [{_type: 'span', marks: ['link'], text: 'Click'}]}])
  assert.equal(html, '<p>Click</p>')
})
