import {readFileSync} from 'node:fs'
import {shell, escape, safeUrl, metadata, image} from './render.mjs'

const serviceGlyphs = Object.fromEntries(['strategy', 'design', 'build'].map(name => [name, readFileSync(new URL(`../asset/home/${name}.svg`, import.meta.url), 'utf8')]))

// Keep the cover first, followed by up to three distinct, similarly shaped images.
const previewImages = project => {
  const candidates = [project.cardImage, project.coverImage, ...(project.gallery || []).filter(block => block._type === 'galleryImage').map(block => block.image)]
  const seen = new Set()
  const unique = candidates.filter(value => {
    const ref = value?.asset?._ref
    if (!ref || seen.has(ref)) return false
    seen.add(ref)
    return true
  })
  const distance = value => {
    const dimensions = value.asset._ref.match(/-(\d+)x(\d+)-/)
    const crop = value.crop || {}
    const ratio = dimensions ? Number(dimensions[1]) * (1 - (crop.left || 0) - (crop.right || 0)) / (Number(dimensions[2]) * (1 - (crop.top || 0) - (crop.bottom || 0))) : 1.5
    return Math.abs(Math.log(ratio / 1.5))
  }
  return unique.length ? [unique[0], ...unique.slice(1).sort((a, b) => distance(a) - distance(b))].slice(0, 4) : []
}
const projectCards = projects => projects.map((project, index) => {
  const slug = project.slug.current
  const tag = project.comingSoon ? 'article' : 'a'
  const label = `${project.title}${project.comingSoon ? ' — coming soon' : ' — view project'}`
  const slides = previewImages(project).map((value, slide) => {
    const markup = image({...value, alt: ''}, {width: 1400, eager: index === 0 && slide === 0, ratio: 1.5, className: slide === 0 ? 'is-visible' : '', sizes: '(max-width: 720px) calc(100vw - 42px), 660px'})
    // Only the cover loads initially; preview frames load on deliberate interaction.
    return slide === 0 ? markup : markup.replace(/ src=/, ' data-src=').replace(/ srcset=/, ' data-srcset=')
  }).join('')
  return `<${tag} class="case-card home-project-card" data-project-slug="${escape(slug)}" aria-label="${escape(label)}" ${project.comingSoon ? '' : `href="/projects?project=${escape(slug)}"`}>
    <div class="home-project-card-content"><figure class="case-image" aria-hidden="true">${slides}</figure></div>
    ${project.comingSoon ? '' : '<span class="home-project-eye" aria-hidden="true"></span>'}
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
  // Keep the actual words and natural wrapping, including CMS-edited headlines.
  let wordOrder = 0
  $('.home-headline').html($('.home-headline').text().split(/(\s+)/).map(word =>
    word.trim() ? `<span class="home-headline-word" style="--word-order: ${Math.min(wordOrder++, 12)}">${escape(word)}</span>` : word
  ).join(''))
  if (home.intro && JSON.stringify(home.intro) !== JSON.stringify(legacyIntro)) $('.home-intro-copy').html(home.intro.map(p => `<p>${escape(p)}</p>`).join(''))
  // Apply the founder link to CMS copy as well as the default introduction.
  $('.home-intro-copy p').each((_, paragraph) => {
    if ($(paragraph).find('.home-founder').length) return
    $(paragraph).html(escape($(paragraph).text()).replace(/Ismail Ahmad/g, '<a class="home-founder" href="https://linkedin.com/in/ismxil" target="_blank" rel="noopener">Ismail Ahmad</a>'))
  })
  $('.home-contact a').attr('href', `mailto:${email}`)
  $('.home-email-address').text(email)
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
  $('.home-projects-grid').html(projectCards(projects.filter(project => project.featured)))
  $('.home-projects-grid').attr({'role': 'region', 'aria-label': 'Selected projects', 'tabindex': '0'})
  if (home.socials) {
    $('.home-socials').html(`<a href="mailto:${escape(email)}">Email<span class="home-external-icon"><img src="/asset/home/external.svg" alt="" aria-hidden="true"></span></a>` + home.socials.filter(social => safeUrl(social.url)).map(social => `<a href="${escape(safeUrl(social.url))}" target="_blank" rel="noopener">${escape(social.title)}<span class="home-external-icon"><img src="/asset/home/external.svg" alt="" aria-hidden="true"></span></a>`).join(''))
  }
  metadata($, 'Cadara Studio', home.seoDescription || $('.home-headline').text())
  return $.html()
}
