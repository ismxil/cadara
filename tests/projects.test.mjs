import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {load} from 'cheerio'
import {renderProjects} from '../scripts/projects.mjs'
import {renderHome} from '../scripts/home.mjs'
const template = await readFile(new URL('../projects.html', import.meta.url), 'utf8')
const homeTemplate = await readFile(new URL('../index.html', import.meta.url), 'utf8')
const image = {asset: {_ref: 'image-0123456789abcdef0123456789abcdef01234567-800x600-jpg'}, alt: 'A project image'}
test('project viewer preserves published galleries and text without including coming-soon projects', () => {
  const $ = load(renderProjects(template, {contactEmail: 'hello@example.com'}, [{title: 'A <client>', slug: {current: 'client'}, website: 'https://example.com', headline: 'A new direction', services: ['Identity'], intro: ['Overview', '<script>bad()</script>'], coverImage: image, gallery: [{_type: 'galleryImage', image}, {_type: 'galleryText', heading: 'Challenge', paragraphs: ['The challenge']}], outcome: ['The result'], outcomeHeading: 'Results'}, {title: 'Soon', comingSoon: true, slug: {current: 'soon'}}]))
  assert.equal($('.project-story').length, 1)
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
  const project = {title: 'Client <one>', slug: {current: 'client'}, headline: 'A thoughtful launch', lead: 'The primary introduction', intro: ['Overview', '<script>unsafe()</script>'], services: ['Brand', 'Product'], duration: '6 months', date: '2021-06-23', website: 'javascript:alert(1)', coverImage: image, gallery: [{_type: 'galleryImage', image, width: 'half', fit: 'contain'}, {_type: 'galleryText', heading: 'The challenge', paragraphs: ['First paragraph', 'Second paragraph']}], outcomeHeading: 'What changed', outcome: ['A clearer identity']}
  const $ = load(renderCase(caseTemplate, {}, project, [project, {title: 'Next', slug: {current: 'next'}, coverImage: image}, {title: 'Soon', slug: {current: 'soon'}, comingSoon: true}]))
  assert.equal($('h1').text(), project.title)
  assert.equal($('.case-summary').text(), project.lead)
  assert.equal($('.case-overview > p:not(.case-headline)').length, 2)
  assert.equal($('.case-overview script').length, 0)
  assert.equal($('.case-background[open]').length, 0)
  assert.equal($('.case-background > summary .case-see-more').text(), 'See more')
  assert.equal($('.case-headline').text(), project.headline)
  assert.equal($('.case-background > summary .case-see-less').text(), 'See less')
  assert.equal($('.case-duration').text(), '6 months')
  assert.equal($('.case-visit').length, 0)
  assert.equal($('.case-hero-cover, .meta-date').length, 0)
  assert.doesNotMatch($('.case-details').text(), /23 Jun 2021|Date/)
  assert.equal($('.case-gallery-item img').first().attr('fetchpriority'), 'high')
  assert.equal($('.case-gallery-item').length, 2)
  assert.equal($('.case-gallery-item--half.case-gallery-item--contain').length, 1)
  assert.match($('.case-gallery').text(), /The challenge.*First paragraph.*Second paragraph/s)
  assert.equal($('.case-outcome').text(), 'What changedA clearer identity')
  assert.equal($('link[rel="canonical"]').attr('href'), 'https://cadarastudio.com/cases/client')
  assert.equal($('.home-projects-grid').attr('data-initial-project'), 'client')
  assert.deepEqual($('.home-project-card').map((_, el) => $(el).attr('href')).get(), ['/cases/client', '/cases/next'])
  assert.equal($('.case-close').attr('href'), '/?view=work')
})


test('Cadana displays artwork without the removed Challenges and Outcome sections', async () => {
  const {renderCase} = await import('../scripts/render.mjs')
  const caseTemplate = await readFile(new URL('../scripts/templates/case-study.html', import.meta.url), 'utf8')
  const project = {title: 'Cadana', slug: {current: 'cadana'}, coverImage: image, gallery: [{_type: 'galleryText', heading: 'Challenges', paragraphs: ['Removed challenge copy']}, {_type: 'galleryImage', image}], outcomeHeading: 'Outcome', outcome: ['Removed outcome copy']}
  const $ = load(renderCase(caseTemplate, {}, project, [project]))
  assert.equal($('.case-gallery-item').length, 2)
  assert.equal($('.case-gallery .case-narrative, .case-outcome').length, 0)
  assert.doesNotMatch($('body').text(), /Removed challenge copy|Removed outcome copy/)
})
