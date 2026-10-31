import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {load} from 'cheerio'
import {renderHome} from '../scripts/home.mjs'
const template = await readFile(new URL('../index.html', import.meta.url), 'utf8')
const projects = [{_id: 'cadana', slug: {current: 'cadana'}}, {_id: 'foma', slug: {current: 'foma'}, comingSoon: true}]

test('existing Studio content uses design defaults and only published engagement links', () => {
  const $ = load(renderHome(template, {contactEmail: 'legacy@example.com', headline: 'Legacy headline'}, projects))
  assert.equal($('.home-headline').text(), 'Bold by instinct. Deliberate by design. Driven by curiosity.')
  assert.equal($('.home-contact a').attr('href'), 'mailto:work@cadarastudio.com')
  assert.equal($('.home-team-copy a').attr('href'), 'mailto:jobs@otherkind.design')
  assert.deepEqual($('.engagement[href]').map((_, el) => $(el).attr('href')).get(), ['/cases/cadana'])
  assert.equal($('.engagement').length, 6)
  assert.equal($('.home-services-grid .home-service').length, 3)
  assert.equal($('.home-socials a').length, 3)
  assert.equal($('a[href="/cases/work"]').length, 1)
})

test('homepage CMS overrides escape content, reject unsafe social URLs, and respect publication state', () => {
  const studio = {contactEmail: 'legacy@example.com', statement: 'A new statement', services: [{title: 'Strategy', description: 'Custom service', icon: 'strategy'}], home: {
    headline: 'A new headline', intro: ['<script>bad()</script>'], contactEmail: 'hello@example.com',
    teamCopy: 'Custom team', hiringCopy: 'Join us.', hiringEmail: 'jobs@example.com',
    engagements: [{name: '<b>Client</b>', services: ['Product'], year: '2026', project: {_ref: 'cadana'}}, {name: 'Upcoming', project: {_ref: 'foma'}}],
    socials: [{title: 'X', url: 'https://x.com/example'}, {title: 'Unsafe', url: 'javascript:bad()'}],
  }}
  const $ = load(renderHome(template, studio, projects))
  assert.equal($('h1').text(), 'A new headline')
  assert.equal($('.home-intro-copy script').length, 0)
  assert.equal($('.home-intro-copy p').text(), '<script>bad()</script>')
  assert.equal($('.home-statement').text(), 'A new statement')
  assert.equal($('.home-contact a').text(), 'hello@example.com')
  assert.equal($('.home-team-copy a').attr('href'), 'mailto:jobs@example.com')
  assert.equal($('.home-service p').text(), 'Custom service')
  assert.equal($('.engagement b').length, 0)
  assert.equal($('.engagement a').length, 0)
  assert.equal($('.engagement[href]').length, 1)
  assert.equal($('.home-socials a').length, 2)
  assert.equal($('.home-socials [href="javascript:bad()"] ').length, 0)
  const unpublished = load(renderHome(template, studio, []))
  assert.equal(unpublished('.engagement[href]').length, 0)
  assert.equal(unpublished('.engagement').length, 2)
})
