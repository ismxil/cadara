import {load} from 'cheerio'
import {escape, safeUrl, image, metadata, imageRatio, projectImages} from './render.mjs'
const paragraphs = values => (values || []).map(text => `<p>${escape(text)}</p>`).join('')
export function renderProjects(template, studio, projects) {
  const $ = load(template)
  const published = projects
  const media = (value, className = '') => {
    if (!value?.asset) return ''
    return `<figure class="project-media ${className}" style="--media-ratio: ${imageRatio(value)}">${image(value, {width: 2000, sizes: '(max-width: 720px) 100vw, 84vw'})}</figure>`
  }
  $('.project-rail').html(published.map(project => {
    const slug = escape(project.slug.current)
    const website = safeUrl(project.website)
    return `<section class="project-story" id="project-${slug}" data-project="${slug}" aria-labelledby="title-${slug}">
      <div class="project-copy project-intro"><h1 id="title-${slug}">${website ? `<a href="${escape(website)}" target="_blank" rel="noopener">${escape(project.title)} <span class="project-external-icon" aria-hidden="true"></span></a>` : escape(project.title)}</h1>
        <p class="project-headline">${escape(project.summary)}</p>
        ${paragraphs((project.intro || []).slice(0, 1))}
        ${project.intro?.length > 1 ? `<details class="project-background"><summary>Project background</summary>${paragraphs(project.intro.slice(1))}</details>` : ''}
        <dl class="project-details">${project.services?.length ? `<div><dt>Services</dt><dd>${project.services.map(escape).join(', ')}</dd></div>` : ''}${project.duration ? `<div><dt>Duration</dt><dd>${escape(project.duration)}</dd></div>` : ''}</dl>
      </div>
      ${projectImages(project).map(value => media(value)).join('')}
      ${(project.sections || []).map(section => `<div class="project-copy project-chapter"><h2>${escape(section.heading)}</h2>${paragraphs(section.paragraphs)}</div>`).join('')}
    </section>`
  }).join(''))
  if (!published.length) $('.project-rail').html('<p class="projects-empty">New work is on its way. <a href="/">Back to the studio</a></p>')
  $('.project-dock').html(published.map(project => {
    const slug = escape(project.slug.current)
    const icon = ['lemfi', 'cadana', 'gomoney', 'foma', 'mezovest'].includes(project.slug.current)
      ? `<img src="/asset/app-icon/${slug}.svg" alt="" width="48" height="48">`
      : project.cardImage?.asset ? image({...project.cardImage, alt: ''}, {width: 160, ratio: 1, eager: true, sizes: '80px'})
      : `<span class="dock-monogram" aria-hidden="true">${escape(project.title.charAt(0))}</span>`
    return `<a class="project-dock-link" href="#project-${slug}" data-project-link="${slug}" aria-label="${escape(project.title)}">${icon}<span class="project-dock-label" aria-hidden="true">${escape(project.title)}</span></a>`
  }).join(''))
  if (!published.length) $('.project-dock').remove()
  metadata($, 'Projects — Cadara Studio', 'Explore selected brand and digital product design projects from Cadara Studio.')
  return $.html()
}
