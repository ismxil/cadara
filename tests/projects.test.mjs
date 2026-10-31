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
  assert.equal($('.project-story h1').text(), 'A <client> ↗')
  assert.equal($('.project-story script').length, 0)
  assert.equal($('.project-background p').text(), '<script>bad()</script>')
  assert.equal($('.project-media img').length, 2)
  assert.match($('.project-media').attr('style'), /1.333333/)
  assert.equal($('.project-chapter h2').first().text(), 'Challenge')
  assert.equal($('.project-chapter h2').last().text(), 'Results')
  assert.equal($('.project-menu a').attr('href'), '#project-client')
  assert.equal($('.project-contact').attr('href'), 'mailto:hello@example.com')
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
