import {shell, escape, safeUrl, metadata, cards} from './render.mjs'

// New fields are optional so existing published Studio documents render the design
// immediately, without replacing legacy content or requiring a content migration.
export function renderHome(template, studio, projects) {
  const $ = shell(template, studio)
  const home = studio.home || {}
  const email = home.contactEmail || 'work@cadarastudio.com'
  if (home.headline) $('.home-headline').text(home.headline)
  if (home.intro) $('.home-intro-copy').html(home.intro.map(p => `<p>${escape(p)}</p>`).join(''))
  $('.home-contact a').attr('href', `mailto:${email}`).text(email)
  $('.home-socials a[href^="mailto:"]').attr('href', `mailto:${email}`)
  // Restore the hiring address after shell applies the shared contact address.
  $('.home-team-copy a').attr('href', `mailto:${home.hiringEmail || 'jobs@otherkind.design'}`).text(home.hiringEmail || 'jobs@otherkind.design')
  if (home.teamCopy) $('.home-team-copy p').first().text(home.teamCopy)
  if (home.hiringCopy) $('.home-team-copy p').last().html(`${escape(home.hiringCopy)} <a href="mailto:${escape(home.hiringEmail || 'jobs@otherkind.design')}">${escape(home.hiringEmail || 'jobs@otherkind.design')}</a> with your portfolio.`)
  if (studio.statement) $('.home-statement').text(studio.statement)
  if (studio.services) $('.home-services-grid').html(studio.services.map(service => `<article class="home-service">
    ${['strategy', 'design', 'build'].includes(service.icon) ? `<div class="home-service-icon"><img src="/asset/home/${service.icon}.svg" alt="" aria-hidden="true"></div>` : ''}
    <div><h3>${escape(service.title)}</h3><p>${escape(service.description)}</p></div></article>`).join(''))
  if (home.engagements) $('.engagement-list').html(home.engagements.map(item => {
    const project = projects.find(p => p._id === item.project?._ref && !p.comingSoon)
    const tag = project ? 'a' : 'div'
    return `<li><${tag} class="engagement"${project ? ` href="/cases/${escape(project.slug.current)}"` : ''}><span class="engagement-tags">${(item.services || []).map(service => `<span>${escape(service)}</span>`).join('')}</span><span class="engagement-name">${escape(item.name)}</span><span class="engagement-year">${escape(item.year)}</span></${tag}></li>`
  }).join(''))
  // Default engagements keep their label if the corresponding case is unpublished.
  const published = new Set(projects.filter(p => !p.comingSoon).map(p => `/cases/${p.slug.current}`))
  $('.engagement[href]').each((_, el) => {
    if (!published.has($(el).attr('href'))) $(el).replaceWith(`<div class="engagement">${$(el).html()}</div>`)
  })
  $('.home-projects-grid').html(cards(projects.filter(project => project.featured).slice(0, 4)))
  if (home.socials) {
    $('.home-socials').html(`<a href="mailto:${escape(email)}">Email<span class="home-external-icon"><img src="/asset/home/external.svg" alt="" aria-hidden="true"></span></a>` + home.socials.filter(social => safeUrl(social.url)).map(social => `<a href="${escape(safeUrl(social.url))}" target="_blank" rel="noopener">${escape(social.title)}<span class="home-external-icon"><img src="/asset/home/external.svg" alt="" aria-hidden="true"></span></a>`).join(''))
  }
  metadata($, 'Cadara Studio', home.seoDescription || $('.home-headline').text())
  return $.html()
}
