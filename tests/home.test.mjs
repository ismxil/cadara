import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {load} from 'cheerio'
import {renderHome} from '../scripts/home.mjs'
const template = await readFile(new URL('../index.html', import.meta.url), 'utf8')
const projects = [{_id: 'cadana', slug: {current: 'cadana'}, website: 'https://cadana.example/'}, {_id: 'foma', slug: {current: 'foma'}, comingSoon: true}]

test('image-only project previews keep accessible navigation and defer distinct gallery frames', () => {
  const photo = (id, width = 900, height = 600) => ({asset: {_ref: `image-${id}-${width}x${height}-jpg`}, alt: 'Project image'})
  const cover = photo('cover')
  const $ = load(renderHome(template, {}, [
    {title: '<Client>', slug: {current: 'client'}, featured: true, cardImage: cover, coverImage: cover, gallery: [
      {_type: 'galleryImage', image: photo('portrait', 600, 1200)},
      {_type: 'galleryText', heading: 'Context'},
      ...['one', 'two', 'three'].map(id => ({_type: 'galleryImage', image: photo(id)})),
    ]},
    {title: 'Upcoming', slug: {current: 'upcoming'}, featured: true, comingSoon: true, cardImage: photo('upcoming')},
    {title: 'Hidden', slug: {current: 'hidden'}, featured: false},
  ]))
  const card = $('.home-project-card').first()
  assert.equal($('.home-project-card').length, 2)
  assert.equal(card.attr('href'), '/projects?project=client')
  assert.equal(card.attr('aria-label'), '<Client> — view project')
  assert.equal(card.find('h3, p, ul, script, Client').length, 0)
  assert.equal(card.find('img').length, 4)
  assert.equal(card.find('img[src]').length, 1)
  assert.equal(card.find('img[data-src][data-srcset]').length, 3)
  assert.equal(card.find('img.is-visible').length, 1)
  assert.equal(card.find('img[data-src*="portrait"]').length, 0)
  assert.equal(card.find('img[src*="cover"]').length, 1)
  assert.equal($('.home-project-eye').length, 1)
  assert.equal($('.home-project-card').last().is('article'), true)
  assert.equal($('.home-project-card').last().attr('href'), undefined)
  assert.equal($('.home-project-card').last().attr('aria-label'), 'Upcoming — coming soon')
  assert.equal($('.home-projects-grid').attr('tabindex'), '0')
})

test('existing Studio content uses design defaults and only external company engagement links', () => {
  const $ = load(renderHome(template, {contactEmail: 'legacy@example.com', headline: 'Legacy headline'}, projects))
  assert.equal($('.home-headline').text(), 'Bold by instinct. Deliberate by design. Driven by curiosity.')
  assert.equal($('.home-contact a').attr('href'), 'mailto:info@cadarastudio.com')
  assert.equal($('.home-team-copy p').length, 2)
  assert.doesNotMatch($('.home-team-copy').text(), /hiring|jobs@/)
  assert.deepEqual($('.engagement[href]').map((_, el) => $(el).attr('href')).get(), ['https://cadanapay.com/', 'https://trybrass.com/', 'https://foma.money/', 'https://lemfi.com/en-gb/cards'])
  assert.equal($('.engagement').length, 6)
  assert.deepEqual($('.engagement-name').map((_, el) => $(el).text()).get(), ['Cadana', 'Brass', 'FoMA', 'LEMFI', 'Biscons', 'Salarify'])
  assert.deepEqual($('.engagement[aria-disabled="true"] .engagement-name').map((_, el) => $(el).text()).get(), ['Biscons', 'Salarify'])
  assert.equal($('.engagement').filter((_, el) => $(el).find('.engagement-name').text() === 'LEMFI').find('.engagement-year').text(), '2023')
  assert.equal($('.engagement').last().find('.engagement-year').text(), '2019')

  assert.equal($('.home-services-grid .home-service').length, 3)
  assert.equal($('.home-socials a').length, 4)
  assert.equal($('.home-socials [href="https://x.com/cadarastudio"]').text(), 'X')
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
  assert.equal($('.home-email-address').text(), 'hello@example.com')
  assert.equal($('.home-email-link .home-copy-icon').length, 1)
  assert.equal($('.home-contact button').length, 0)
  assert.equal($('.home-team-copy').text(), 'Custom team')
  assert.equal($('.home-team-copy a').length, 0)
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


test('previously published homepage copy adopts the new defaults during a CMS build', () => {
  const defaults = load(renderHome(template, {}, []))
  const published = load(renderHome(template, {"home": {"intro": ["Cadara Studio is an independent design studio. We combine thoughtful design with business thinking to challenge conventions, explore unconventional ideas, and create experiences that make a difference.", "We're selectively impulsive, but intentional in our approach, turning bold ideas into meaningful solutions that work for people and the businesses behind them.", "Led by Ismail Ahmad, our team embeds within your team to create inspiration, find clarity in ambiguity, and walk alongside you as you build your bold vision."], "teamCopy": "We exist to create a sanctuary for creativity. We want to inspire ourselves and everyone who collaborates with us. Aside from that, we also exist to have fun. Everyone internally and externally should enjoy the process of design."}, "statement": "We help financial brands become easier to understand, easier to trust, and harder to ignore.", "services": [{"title": "Strategy", "description": "Insight-led positioning, product direction, and leading clarity workshop for financial teams.", "icon": "strategy"}, {"title": "Design", "description": "Digital design, identity design, system design, interface craft, and launch-ready brand assets.", "icon": "design"}, {"title": "Build", "description": "Customer journeys, onboarding flows, service touchpoints, and product moments built around trust.", "icon": "build"}]}, []))
  for (const selector of ['.home-intro-copy', '.home-team-copy', '.home-statement']) {
    assert.equal(published(selector).text(), defaults(selector).text())
  }
  assert.deepEqual(published('.home-service p').map((_, p) => published(p).text()).get(), defaults('.home-service p').map((_, p) => defaults(p).text()).get())
  assert.equal(published('.home-founder').length, 1)
})


test('the project wheel includes every featured project, including Mezovest after the fourth slot', () => {
  const titles = ['Lemfi', 'FoMA', 'Cadana', 'Gomoney', 'Mezovest', 'Sterling']
  const $ = load(renderHome(template, {}, titles.map(title => ({title, slug: {current: title.toLowerCase()}, featured: true, comingSoon: title === 'Sterling'}))))
  assert.equal($('.home-project-card').length, 6)
  assert.equal($('.home-project-card[data-project-slug="mezovest"]').attr('href'), '/projects?project=mezovest')
  assert.equal($('.home-project-card[data-project-slug="sterling"]').is('article'), true)
})
