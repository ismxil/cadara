import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {load} from 'cheerio'
import {renderProjects} from '../scripts/projects.mjs'
import {renderHome} from '../scripts/home.mjs'
const template = await readFile(new URL('../projects.html', import.meta.url), 'utf8')
const homeTemplate = await readFile(new URL('../index.html', import.meta.url), 'utf8')
const image = {asset: {_ref: 'image-0123456789abcdef0123456789abcdef01234567-800x600-jpg'}, alt: 'A project image'}
test('project viewer preserves published images and story sections', () => {
  const $ = load(renderProjects(template, {contactEmail: 'hello@example.com'}, [{title: 'A <client>', slug: {current: 'client'}, website: 'https://example.com', summary: 'A new direction', services: ['Identity'], intro: ['Overview', '<script>bad()</script>'], images: [{layout: 'single', images: [image]}, {layout: 'pair', images: [image]}], sections: [{heading: 'Challenge', paragraphs: ['The challenge']}, {heading: 'Results', paragraphs: ['The result']}]}]))
  assert.equal($('.project-story').length, 1)
  assert.equal($('.project-headline').text(), 'A new direction')
  assert.equal($('.project-story h1').text().trim(), 'A <client>')
  assert.equal($('.project-story script').length, 0)
  assert.equal($('.project-background p').text(), '<script>bad()</script>')
  assert.equal($('.project-media img').length, 2)
  assert.match($('.project-media').attr('style'), /1.333333/)
  assert.equal($('.project-chapter h2').first().text(), 'Challenge')
  assert.equal($('.project-chapter h2').last().text(), 'Results')
  assert.equal($('.project-dock a').attr('href'), '#project-client')
  assert.equal($('.project-menu, .projects-footer').length, 0)
  assert.equal($('.project-external-icon').length, 1)
  assert.equal($('.project-back').attr('href'), '/?view=work')
})
test('engagements accept external websites while rejecting internal case-study and unsafe destinations', () => {
  const $ = load(renderHome(homeTemplate, {home: {engagements: [{name: 'Disabled', website: 'https://disabled.example', disabled: true}, {name: 'External', website: 'https://client.example'}, {name: 'Internal', website: 'https://cadarastudio.com/cases/client'}, {name: 'Relative', website: '/projects?project=client'}, {name: 'Unsafe', website: 'javascript:bad()'}]}}, []))
  assert.equal($('.engagement').length, 5)
  assert.equal($('.engagement-name').first().text(), 'External')
  assert.equal($('.engagement[aria-disabled="true"]').length, 4)
  assert.equal($('.engagement[href]').length, 1)
  assert.equal($('.engagement[href]').attr('href'), 'https://client.example/')
  assert.equal($('.engagement[href]').attr('target'), '_blank')
})
test('empty project viewer has a usable fallback', () => {
  const $ = load(renderProjects(template, {}, []))
  assert.equal($('.project-story').length, 0)
  assert.equal($('.projects-empty a').attr('href'), '/')
})

test('vertical case studies preserve content, metadata and safe navigation between published projects', async () => {
  const {renderCase} = await import('../scripts/render.mjs')
  const caseTemplate = await readFile(new URL('../scripts/templates/case-study.html', import.meta.url), 'utf8')
  const wide = {asset: {_ref: 'image-0123456789abcdef0123456789abcdef01234567-1600x900-jpg'}, alt: 'Wide'}
  const project = {title: 'Client <one>', slug: {current: 'client'}, summary: 'A thoughtful launch', intro: ['The primary introduction', 'Overview', '<script>unsafe()</script>'], services: ['Brand', 'Product'], duration: '6 months', website: 'javascript:alert(1)',
    images: [{layout: 'single', images: [image]}, {layout: 'pair', images: [image, wide]}, {layout: 'grid', images: [wide, image, image]}, {layout: 'pair', images: [image]}],
    sections: [{heading: 'The challenge', paragraphs: ['First paragraph', 'Second paragraph']}, {heading: 'What changed', paragraphs: ['A clearer identity']}]}
  const $ = load(renderCase(caseTemplate, {}, project, [project, {title: 'Next', slug: {current: 'next'}, images: [{layout: 'single', images: [image]}]}]))
  assert.equal($('h1').text(), project.title)
  assert.equal($('.case-summary').text(), 'The primary introduction')
  assert.equal($('.case-overview > p:not(.case-headline)').length, 2)
  assert.equal($('.case-overview script').length, 0)
  assert.equal($('.case-background[open]').length, 0)
  assert.equal($('.case-background > summary .case-see-more').text(), 'See more')
  assert.equal($('.case-headline').text(), project.summary)
  assert.equal($('.case-background > summary .case-see-less').text(), 'See less')
  assert.equal($('.case-duration').text(), '6 months')
  assert.equal($('.case-visit').length, 0)
  assert.equal($('.case-hero-cover, .meta-date').length, 0)
  assert.doesNotMatch($('.case-details').text(), /23 Jun 2021|Date/)
  assert.equal($('.case-gallery-item img').first().attr('fetchpriority'), 'high')
  assert.equal($('.case-gallery-item').length, 7)
  assert.equal($('.case-gallery > .case-gallery-item').length, 1)
  assert.deepEqual($('.case-gallery-row').map((_, el) => $(el).find('.case-gallery-item').length).get(), [2, 3, 1])
  assert.deepEqual($('.case-gallery-row--pair .case-gallery-item').map((_, el) => $(el).attr('style')).get(), ['--ratio: 1', '--ratio: 1', '--ratio: 1'])
  assert.equal($('.case-gallery-row--grid .case-gallery-item').filter((_, el) => /--ratio: 1.777/.test($(el).attr('style'))).length, 3)
  assert.match($('.case-gallery-row--grid img').eq(1).attr('src'), /h=/)
  assert.equal($('.case-gallery img[fetchpriority="high"]').length, 1)
  assert.equal($('.case-gallery .case-narrative, .case-outcome').length, 0)
  assert.deepEqual($('.case-overview-section h2').map((_, el) => $(el).text()).get(), ['The challenge', 'What changed'])
  assert.match($('.case-overview').text(), /The challenge.*First paragraph.*Second paragraph.*What changed.*A clearer identity/s)
  assert.equal($('.case-overview .case-collapse').text(), 'See less')
  assert.equal($('link[rel="canonical"]').attr('href'), 'https://cadarastudio.com/cases/client')
  assert.equal($('.home-projects-grid').attr('data-initial-project'), 'next')
  assert.deepEqual($('.home-project-card').map((_, el) => $(el).attr('href')).get(), ['/cases/client', '/cases/next'])
  assert.equal($('.case-close').attr('href'), '/?view=work')
})


test('Cadana displays artwork without the removed Challenges and Outcome sections', async () => {
  const {renderCase} = await import('../scripts/render.mjs')
  const caseTemplate = await readFile(new URL('../scripts/templates/case-study.html', import.meta.url), 'utf8')
  const project = {title: 'Cadana', slug: {current: 'cadana'}, images: [{layout: 'single', images: [image, image]}], sections: [{heading: 'Challenges', paragraphs: ['Removed challenge copy']}, {heading: 'Outcome', paragraphs: ['Removed outcome copy']}]}
  const $ = load(renderCase(caseTemplate, {}, project, [project]))
  assert.equal($('.case-gallery-item').length, 2)
  assert.equal($('.case-gallery .case-narrative, .case-outcome, .case-overview-section').length, 0)
  assert.doesNotMatch($('body').text(), /Removed challenge copy|Removed outcome copy/)
})

test('legacy case studies convert to image rows, story sections and visible crops', async () => {
  const {normalizeProject} = await import('../scripts/render.mjs')
  const square = id => ({_type: 'contentImage', alt: id, asset: {_ref: `image-${id}-1000x1000-jpg`}})
  const project = normalizeProject({title: 'Old', slug: {current: 'old'}, comingSoon: true, headline: 'Tagline', seoDescription: 'x', appearance: 'foma', date: '2021-01-01', nextProject: {_ref: 'a'},
    coverImage: square('cover'), outcomeHeading: 'Outcome', outcome: ['Done'], gallery: [
      {_type: 'galleryText', heading: 'Objective', paragraphs: ['Why']},
      {_type: 'galleryImage', width: 'half', aspectRatio: 2, image: square('a')}, {_type: 'galleryImage', width: 'half', image: square('b')},
      {_type: 'galleryImage', width: 'half', image: square('c')}, {_type: 'galleryImage', width: 'full', aspectRatio: 2, image: square('d')}]})
  assert.deepEqual(project.images[3].images[0].crop, {_type: 'sanity.imageCrop', top: 0.25, bottom: 0.25, left: 0, right: 0})
  assert.deepEqual(['comingSoon', 'headline', 'seoDescription', 'appearance', 'date', 'nextProject', 'coverImage', 'gallery', 'outcome'].filter(key => key in project), [])
  assert.equal(project.summary, 'Tagline')
  assert.deepEqual(project.images.map(row => [row.layout, row.images.map(i => i.alt).join()]), [['single', 'cover'], ['pair', 'a,b'], ['pair', 'c'], ['single', 'd']])
  assert.equal(project.images[1].images[0].crop, undefined)
  assert.ok(project.images.every(row => row._key && row._type === 'imageRow' && row.images.every(i => i._key && i._type === 'contentImage')))
  assert.deepEqual(project.sections.map(s => s.heading), ['Objective', 'Outcome'])
  assert.deepEqual(normalizeProject(project), project)
})
