import {load} from 'cheerio'
import {createImageUrlBuilder} from '@sanity/image-url'
import {toHTML} from '@portabletext/to-html'
const builder = createImageUrlBuilder({projectId: 'o47ti8nx', dataset: 'production'})
export const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]))
export function safeUrl(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : '' } catch { return '' }
}
export function imageUrl(image, width = 2000) {
  if (!image?.asset) return ''
  return builder.image(image).width(width).fit('max').auto('format').url()
}
function image(image, {className = '', width = 2000, eager = false, ratio} = {}) {
  const src = imageUrl(image, width)
  if (!src) return ''
  let url = builder.image(image).width(width)
  if (ratio) url = url.height(Math.round(width / ratio)).fit('crop')
  else url = url.fit('max')
  return `<img src="${escape(url.auto('format').url())}" alt="${escape(image.alt)}" class="${escape(className)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`
}
const paragraphs = values => (values || []).map(p => `<p>${escape(p)}</p>`).join('')
export function cards(projects) {
  return projects.map(project => {
    const tag = project.comingSoon ? 'div' : 'a'
    const attrs = project.comingSoon ? `aria-label="${escape(project.title)} — coming soon"` : `href="/cases/${escape(project.slug.current)}.html"`
    const appearance = ['foma', 'cadana'].includes(project.appearance) ? ` case-image--${project.appearance}` : ''
    return `<${tag} class="case-card${project.comingSoon ? ' case-card--soon' : ''}" ${attrs}>
      <figure class="case-image${appearance}">${image(project.cardImage, {width: 1400})}</figure>
      <div class="case-meta"><h3>${escape(project.title)}</h3><p>${escape(project.summary)}</p></div>
      ${project.comingSoon ? '<span class="case-card-soon">Coming soon</span>' : ''}</${tag}>`
  }).join('\n')
}
export function shell(template, studio) {
  const $ = load(template)
  // Root-relative paths work for both original and newly generated nested pages.
  $('a[href], img[src], script[src], link[href]').each((_, el) => {
    const attr = $(el).attr('href') !== undefined ? 'href' : 'src'
    const value = $(el).attr(attr)
    if (value && !value.startsWith('#') && !value.startsWith('/') && !/^[a-z][a-z0-9+.-]*:/i.test(value)) {
      const base = template.includes('href="../css/') ? 'https://cadara.local/cases/' : 'https://cadara.local/'
      $(el).attr(attr, new URL(value, base).pathname)
    }
  })
  $('.nav-links').each((_, el) => {
    if (!$(el).find('[href="/insights/index.html"]').length) $(el).find('a').first().after('<a href="/insights/index.html">Insights</a>')
  })
  $('.statement p').text(studio.statement)
  $('.services-heading').text(studio.servicesHeading)
  $('.services-grid').html((studio.services || []).map(service => `<article class="service-card">
    ${['strategy', 'design', 'build'].includes(service.icon) ? `<img src="/asset/${service.icon}.svg" alt="" class="service-icon" aria-hidden="true">` : ''}
    <div class="service-copy"><h3>${escape(service.title)}</h3><p>${escape(service.description)}</p></div></article>`).join(''))
  $('a[href^="mailto:"]').attr('href', `mailto:${studio.contactEmail}`)
  $('.footer-socials').html((studio.socials || []).map(social => `<a href="${escape(safeUrl(social.url))}" target="_blank" rel="noopener">${escape(social.title)}</a>`).join(''))
  // Mobile navigation reads the same published contact and social fields.
  $('body').attr('data-contact-email', studio.contactEmail)
  $('body').attr('data-social-links', JSON.stringify(studio.socials || []))
  return $
}
export function metadata($, title, description, article = false) {
  $('title').text(title)
  for (const [attr, name, content] of [['name', 'description', description], ['property', 'og:title', title], ['property', 'og:description', description], ['property', 'og:type', article ? 'article' : 'website']]) {
    let meta = $(`meta[${attr}="${name}"]`)
    if (!meta.length) { $('head').append(`<meta ${attr}="${name}">`); meta = $(`meta[${attr}="${name}"]`) }
    meta.attr('content', content || '')
  }
}
export function renderCase(template, studio, project, projects) {
  const $ = shell(template, studio)
  metadata($, `${project.title} — Cadara Studio`, project.seoDescription || project.summary)
  $('main').attr('class', 'site case-site')
  const appearance = ['foma', 'gomoney', 'mezovest'].includes(project.appearance) ? ` case-hero-cover--${project.appearance}` : ''
  const date = project.date?.split('-').reverse().map((v, i) => i === 2 ? v.slice(-2) : v).join('.')
  $('.case-hero').html(`<div class="case-hero-title"><h1>${escape(project.headline || project.summary)}</h1><div class="case-hero-meta">
    <p class="meta-client">${escape(project.title)}</p>
    ${(project.services || []).length ? `<div class="meta-group"><p>Services</p>${project.services.map(s => `<p class="meta-label">${escape(s)}</p>`).join('')}</div>` : ''}
    ${project.duration || date ? `<div class="meta-group"><p>${project.duration ? 'Duration' : 'Date'}</p><p class="meta-date">${escape(project.duration || date)}</p></div>` : ''}
    </div></div><div class="case-hero-intro"><div class="case-hero-copy">${paragraphs(project.intro)}
    ${safeUrl(project.website) ? `<a class="case-visit" href="${escape(safeUrl(project.website))}" target="_blank" rel="noopener">Visit company</a>` : ''}</div>
    <figure class="case-hero-cover${appearance}">${image(project.coverImage, {eager: true})}</figure></div>`)
  $('.case-gallery').attr('class', 'case-gallery container').html((project.gallery || []).map(block => {
    const style = `grid-column: ${block.width === 'half' ? 'span 1' : '1 / -1'}`
    if (block._type === 'galleryText') return `<div class="case-gallery-text" style="${style}"><h2>${escape(block.heading)}</h2>${paragraphs(block.paragraphs)}</div>`
    const dimensions = block.image?.asset?._ref?.match(/-(\d+)x(\d+)-/)
    const ratio = Number(block.aspectRatio) > 0 ? Number(block.aspectRatio) : dimensions ? Number(dimensions[1]) / Number(dimensions[2]) : 16 / 9
    return `<figure class="case-gallery-item${block.fit === 'contain' ? ' case-gallery-item--contain' : ''}" style="${style}; --ratio: ${ratio}">${image(block.image, {ratio: block.fit === 'contain' ? undefined : ratio})}</figure>`
  }).join(''))
  $('.case-credit').remove()
  if (project.outcome?.length) $('.case-gallery').after(`<section class="case-credit container"><h2>${escape(project.outcomeHeading)}</h2>${paragraphs(project.outcome)}</section>`)
  $('.case-next').remove()
  const next = projects.find(p => p._id === project.nextProject?._ref && !p.comingSoon)
  if (next) $('footer').before(`<a class="case-next container" href="/cases/${escape(next.slug.current)}.html" aria-label="View next project: ${escape(next.title)}">${image(next.cardImage, {className: 'case-next-cover'})}<span class="case-next-link">View work ↗</span></a>`)
  return $.html()
}
export function renderBody(body) {
  return toHTML(body || [], {components: {
    types: {contentImage: ({value}) => `<figure>${image(value)}</figure>`},
    marks: {link: ({value, children}) => safeUrl(value?.href) ? `<a href="${escape(safeUrl(value.href))}" rel="noopener">${children}</a>` : children},
  }})
}
export function renderInsight(template, studio, insight) {
  const $ = shell(template, studio)
  metadata($, `${insight.title} — Cadara Insights`, insight.seoDescription || insight.excerpt, true)
  $('.intro, .work-section, .services-section, .studio-section').remove()
  $('footer').before(`<article class="insight-article container"><header><p>Insights${insight.author ? ` · ${escape(insight.author)}` : ''} · <time datetime="${escape(insight.publishedAt)}">${escape(insight.publishedAt)}</time></p>
    <h1>${escape(insight.title)}</h1><p class="insight-excerpt">${escape(insight.excerpt)}</p></header>
    ${image(insight.coverImage, {eager: true})}<div class="insight-body">${renderBody(insight.body)}</div><a href="/insights/index.html">← All insights</a></article>`)
  $('head').append('<link rel="stylesheet" href="/css/insights.css">')
  return $.html()
}
export function renderInsights(template, studio, insights) {
  const $ = shell(template, studio)
  metadata($, 'Insights — Cadara Studio', 'Ideas and perspectives from Cadara Studio.')
  $('.intro-headline').text('Insights')
  $('.services-section, .studio-section').remove()
  $('.cases-grid').html(insights.length ? insights.map(insight => `<a class="case-card" href="/insights/${escape(insight.slug.current)}.html"><figure class="case-image">${image(insight.coverImage, {width: 1400})}</figure>
    <div class="case-meta"><h3>${escape(insight.title)}</h3><p>${escape(insight.excerpt)}</p></div></a>`).join('') : '<p>Insights will appear here when published.</p>')
  $('.work-section').attr('aria-label', 'Insights').attr('id', 'insights')
  $('.nav-links a').removeAttr('aria-current').filter('[href="/insights/index.html"]').attr('aria-current', 'page')
  return $.html()
}
