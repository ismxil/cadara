import {readFileSync} from 'node:fs'
import {shell, escape, safeUrl, metadata, image} from './render.mjs'

const serviceGlyphs = Object.fromEntries(['strategy', 'design', 'build'].map(name => [name, readFileSync(new URL(`../asset/home/${name}.svg`, import.meta.url), 'utf8')]))

const projectCards = projects => projects.map((project, index) => {
  const slug = project.slug.current
  const theme = ['lemfi', 'foma', 'cadana', 'gomoney', 'mezovest'].includes(slug) ? slug : 'default'
  const tag = project.comingSoon ? 'article' : 'a'
  return `<${tag} class="case-card home-project-card home-project-card--${theme}" ${project.comingSoon ? `aria-label="${escape(project.title)} — coming soon"` : `href="/projects?project=${escape(slug)}"`}>
    <div class="home-project-card-content"><div class="home-project-copy"><h3>${escape(project.title)}</h3><p class="home-project-summary">${escape(project.summary)}</p>
      ${project.services?.length ? `<ul class="home-project-services" aria-label="Services">${project.services.map(service => `<li>${escape(service)}</li>`).join('')}</ul>` : ''}
      <span class="home-project-action">${project.comingSoon ? 'Coming soon' : 'View project<span class="home-external-icon"><img src="/asset/home/external.svg" alt="" aria-hidden="true"></span>'}</span>
    </div>
    <figure class="case-image">${image(project.cardImage, {width: 1400, eager: index === 0, sizes: '(max-width: 540px) calc(100vw - 42px), (max-width: 720px) calc(50vw - 21px), 331px'})}</figure></div>
  </${tag}>`
}).join('')

const companyUrl = value => {
  const url = safeUrl(value)
  return url && !['cadarastudio.com', 'www.cadarastudio.com'].includes(new URL(url).hostname) ? url : ''
}

// Refresh the original service copy while preserving descriptions edited in the CMS.
const serviceCopy = new Map([
  ["Customer journeys, onboarding flows, service touchpoints, and product moments built around trust.", "Bringing ideas to life through reliable technology, with care for every detail."],
  ["Digital design, identity design, system design, interface craft, and launch-ready brand assets.", "Turning ideas into thoughtful, intuitive experiences that work for people and businesses."],
  ["Insight-led positioning, product direction, and leading clarity workshop for financial teams.", "Finding clarity, defining direction, and aligning people around ideas worth pursuing."],
  ["Finding clarity, defining direction, and aligning your team around shared goals, opportunities, and a clear vision for the project.", "Finding clarity, defining direction, and aligning people around ideas worth pursuing."],
  ["Turning ideas into thoughtful digital experiences, visual identities, and intuitive interfaces that balance user needs with business goals.", "Turning ideas into thoughtful, intuitive experiences that work for people and businesses."],
  ["Bringing designs to life through development, turning concepts into functional, scalable, and reliable digital products ready for the real world.", "Bringing ideas to life through reliable technology, with care for every detail."],
])

const legacyIntro = ["Cadara Studio is an independent design studio. We combine thoughtful design with business thinking to challenge conventions, explore unconventional ideas, and create experiences that make a difference.", "We're selectively impulsive, but intentional in our approach, turning bold ideas into meaningful solutions that work for people and the businesses behind them.", "Led by Ismail Ahmad, our team embeds within your team to create inspiration, find clarity in ambiguity, and walk alongside you as you build your bold vision."]
const legacyTeamCopy = "We exist to create a sanctuary for creativity. We want to inspire ourselves and everyone who collaborates with us. Aside from that, we also exist to have fun. Everyone internally and externally should enjoy the process of design."
const legacyStatement = "We help financial brands become easier to understand, easier to trust, and harder to ignore."

// New fields are optional so existing published Studio documents render the design
// immediately, without replacing legacy content or requiring a content migration.
export function renderHome(template, studio, projects) {
  const $ = shell(template, studio)
  const home = studio.home || {}
  const email = home.contactEmail || 'info@cadarastudio.com'
  if (home.headline) $('.home-headline').text(home.headline)
  if (home.intro && JSON.stringify(home.intro) !== JSON.stringify(legacyIntro)) $('.home-intro-copy').html(home.intro.map(p => `<p>${escape(p)}</p>`).join(''))
  // Apply the founder link to CMS copy as well as the default introduction.
  $('.home-intro-copy p').each((_, paragraph) => {
    if ($(paragraph).find('.home-founder').length) return
    $(paragraph).html(escape($(paragraph).text()).replace(/Ismail Ahmad/g, '<a class="home-founder" href="https://linkedin.com/in/ismxil" target="_blank" rel="noopener">Ismail Ahmad</a>'))
  })
  $('.home-contact a').attr('href', `mailto:${email}`).text(email)
  $('.home-socials a[href^="mailto:"]').attr('href', `mailto:${email}`)
  if (home.teamCopy && home.teamCopy !== legacyTeamCopy) $('.home-team-copy').html(home.teamCopy.split(/\n\s*\n/).map(p => `<p>${escape(p)}</p>`).join(''))
  if (studio.statement && studio.statement !== legacyStatement) $('.home-statement').text(studio.statement)
  if (studio.services) $('.home-services-grid').html(studio.services.map(service => `<article class="home-service">
    ${['strategy', 'design', 'build'].includes(service.icon) ? `<div class="home-service-icon">${serviceGlyphs[service.icon]}</div>` : ''}
    <div><h3>${escape(service.title)}</h3><p>${escape(serviceCopy.get(service.description) || service.description)}</p></div></article>`).join(''))
  if (home.engagements) $('.engagement-list').html(home.engagements.map(item => {
    const project = projects.find(p => p._id === item.project?._ref)
    const website = item.disabled ? '' : companyUrl(item.website) || companyUrl(project?.website)
    const tag = website ? 'a' : 'div'
    return `<li><${tag} class="engagement"${!website ? ' aria-disabled="true"' : ''}${website ? ` href="${escape(website)}" target="_blank" rel="noopener"` : ''}><span class="engagement-tags">${(item.services || []).map(service => `<span>${escape(service)}</span>`).join('')}</span><span class="engagement-name">${escape(item.name)}</span><span class="engagement-year">${escape(item.year)}</span></${tag}></li>`
  }).join(''))
  // Engagements visit company sites. Case studies are entered through project cards.
  $('.engagement[href]').each((_, el) => {
    const url = companyUrl($(el).attr('href'))
    if (url) $(el).attr({href: url, target: '_blank', rel: 'noopener'})
    else $(el).replaceWith(`<div class="engagement" aria-disabled="true">${$(el).html()}</div>`)
  })
  $('.engagement-list .engagement:not([href])').attr('aria-disabled', 'true')
  const rows = $('.engagement-list > li').toArray()
  rows.sort((a, b) => Number(!$(a).find('.engagement[href]').length) - Number(!$(b).find('.engagement[href]').length))
  $('.engagement-list').append(rows)
  $('.home-projects-grid').html(projectCards(projects.filter(project => project.featured).slice(0, 4)))
  $('.home-projects-grid').attr({'role': 'region', 'aria-label': 'Selected projects', 'tabindex': '0'})
  if (home.socials) {
    $('.home-socials').html(`<a href="mailto:${escape(email)}">Email<span class="home-external-icon"><img src="/asset/home/external.svg" alt="" aria-hidden="true"></span></a>` + home.socials.filter(social => safeUrl(social.url)).map(social => `<a href="${escape(safeUrl(social.url))}" target="_blank" rel="noopener">${escape(social.title)}<span class="home-external-icon"><img src="/asset/home/external.svg" alt="" aria-hidden="true"></span></a>`).join(''))
  }
  metadata($, 'Cadara Studio', home.seoDescription || $('.home-headline').text())
  return $.html()
}
