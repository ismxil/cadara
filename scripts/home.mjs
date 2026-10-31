import {shell, escape, safeUrl, metadata, image} from './render.mjs'

const projectCards = projects => projects.map((project, index) => {
  const slug = project.slug.current
  const theme = ['lemfi', 'foma', 'cadana', 'gomoney', 'mezovest'].includes(slug) ? slug : 'default'
  const tag = project.comingSoon ? 'article' : 'a'
  return `<${tag} class="case-card home-project-card home-project-card--${theme}" ${project.comingSoon ? `aria-label="${escape(project.title)} — coming soon"` : `href="/projects?project=${escape(slug)}"`}>
    <div class="home-project-copy"><h3>${escape(project.title)}</h3><p class="home-project-summary">${escape(project.summary)}</p>
      ${project.services?.length ? `<ul class="home-project-services" aria-label="Services">${project.services.map(service => `<li>${escape(service)}</li>`).join('')}</ul>` : ''}
      <span class="home-project-action">${project.comingSoon ? 'Coming soon' : 'View project<span class="home-external-icon"><img src="/asset/home/external.svg" alt="" aria-hidden="true"></span>'}</span>
    </div>
    <figure class="case-image">${image(project.cardImage, {width: 1400, eager: index === 0, sizes: '(max-width: 540px) 85vw, 320px'})}</figure>
  </${tag}>`
}).join('')

const companyUrl = value => {
  const url = safeUrl(value)
  return url && !['cadarastudio.com', 'www.cadarastudio.com'].includes(new URL(url).hostname) ? url : ''
}

// New fields are optional so existing published Studio documents render the design
// immediately, without replacing legacy content or requiring a content migration.
export function renderHome(template, studio, projects) {
  const $ = shell(template, studio)
  const home = studio.home || {}
  const email = home.contactEmail || 'work@cadarastudio.com'
  if (home.headline) $('.home-headline').text(home.headline)
  if (home.intro) $('.home-intro-copy').html(home.intro.map(p => `<p>${escape(p)}</p>`).join(''))
  // Apply the founder link to CMS copy as well as the default introduction.
  $('.home-intro-copy p').each((_, paragraph) => {
    if ($(paragraph).find('.home-founder').length) return
    $(paragraph).html(escape($(paragraph).text()).replace(/Ismail Ahmad/g, '<a class="home-founder" href="https://linkedin.com/in/ismxil" target="_blank" rel="noopener">Ismail Ahmad</a>'))
  })
  $('.home-contact a').attr('href', `mailto:${email}`).text(email)
  $('.home-socials a[href^="mailto:"]').attr('href', `mailto:${email}`)
  if (home.teamCopy) $('.home-team-copy p').first().text(home.teamCopy)
  if (studio.statement) $('.home-statement').text(studio.statement)
  if (studio.services) $('.home-services-grid').html(studio.services.map(service => `<article class="home-service">
    ${['strategy', 'design', 'build'].includes(service.icon) ? `<div class="home-service-icon"><img src="/asset/home/${service.icon}.svg" alt="" aria-hidden="true"></div>` : ''}
    <div><h3>${escape(service.title)}</h3><p>${escape(service.description)}</p></div></article>`).join(''))
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
