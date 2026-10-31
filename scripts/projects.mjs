import {load} from 'cheerio'
import {escape, safeUrl, image, metadata, formatDate} from './render.mjs'
const paragraphs = values => (values || []).map(text => `<p>${escape(text)}</p>`).join('')
export function renderProjects(template, studio, projects) {
  const $ = load(template)
  const published = projects.filter(project => !project.comingSoon)
  const media = (value, className = '') => {
    if (!value?.asset) return ''
    const dimensions = value.asset._ref?.match(/-(\d+)x(\d+)-/)
    const crop = value.crop || {}
    const ratio = dimensions ? (Number(dimensions[1]) * (1 - (crop.left || 0) - (crop.right || 0))) / (Number(dimensions[2]) * (1 - (crop.top || 0) - (crop.bottom || 0))) : 16 / 9
    return `<figure class="project-media ${className}" style="--media-ratio: ${ratio}">${image(value, {width: 2000, sizes: '(max-width: 720px) 100vw, 84vw'})}</figure>`
  }
  $('.project-rail').html(published.map(project => {
    const slug = escape(project.slug.current)
    const website = safeUrl(project.website)
    return `<section class="project-story" id="project-${slug}" data-project="${slug}" aria-labelledby="title-${slug}">
      <div class="project-copy project-intro"><h1 id="title-${slug}">${website ? `<a href="${escape(website)}" target="_blank" rel="noopener">${escape(project.title)} <span class="project-external-icon" aria-hidden="true"></span></a>` : escape(project.title)}</h1>
        <p class="project-headline">${escape(project.headline || project.summary)}</p>
        ${paragraphs((project.intro || []).slice(0, 1))}
        ${project.intro?.length > 1 ? `<details class="project-background"><summary>Project background</summary>${paragraphs(project.intro.slice(1))}</details>` : ''}
        <dl class="project-details">${project.services?.length ? `<div><dt>Services</dt><dd>${project.services.map(escape).join(', ')}</dd></div>` : ''}${project.duration || project.date ? `<div><dt>${project.duration ? 'Duration' : 'Date'}</dt><dd>${escape(project.duration || formatDate(project.date))}</dd></div>` : ''}</dl>
      </div>
      ${media(project.coverImage)}
      ${(project.gallery || []).map(block => block._type === 'galleryText' ? `<div class="project-copy project-chapter"><h2>${escape(block.heading)}</h2>${paragraphs(block.paragraphs)}</div>` : media(block.image, block.fit === 'contain' ? 'project-media--contain' : '')).join('')}
      ${project.outcome?.length ? `<div class="project-copy project-chapter"><h2>${escape(project.outcomeHeading || 'The outcome')}</h2>${paragraphs(project.outcome)}</div>` : ''}
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
