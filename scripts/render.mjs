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
function image(image, {className = '', width = 2000, eager = false, ratio, sizes = '(max-width: 900px) 100vw, 90vw'} = {}) {
  const src = imageUrl(image, width)
  if (!src) return ''
  const dimensions = image.asset._ref?.match(/-(\d+)x(\d+)-/)
  const crop = image.crop || {}
  const sourceWidth = dimensions ? Math.max(1, Math.floor(Number(dimensions[1]) * (1 - (crop.left || 0) - (crop.right || 0)))) : width
  const sourceHeight = dimensions ? Math.max(1, Math.floor(Number(dimensions[2]) * (1 - (crop.top || 0) - (crop.bottom || 0)))) : width
  const maxWidth = Math.min(width, sourceWidth)
  const aspect = ratio || sourceWidth / sourceHeight
  const urlFor = w => {
    let url = builder.image(image).width(w)
    if (ratio) url = url.height(Math.max(1, Math.round(w / ratio))).fit('crop')
    else url = url.fit('max')
    return url.auto('format').url()
  }
  const widths = [...new Set([320, 480, 640, 960, 1400, maxWidth].filter(w => w <= maxWidth))].sort((a, b) => a - b)
  return `<img src="${escape(urlFor(maxWidth))}" srcset="${escape(widths.map(w => `${urlFor(w)} ${w}w`).join(', '))}" sizes="${escape(sizes)}" width="${maxWidth}" height="${Math.max(1, Math.round(maxWidth / aspect))}" alt="${escape(image.alt)}" class="${escape(className)}" ${eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async">`
}
const paragraphs = values => (values || []).map(p => `<p>${escape(p)}</p>`).join('')
export function cards(projects) {
  return projects.map((project, index) => {
    const tag = project.comingSoon ? 'div' : 'a'
    const attrs = project.comingSoon ? `aria-label="${escape(project.title)} — coming soon"` : `href="/cases/${escape(project.slug.current)}"`
    const appearance = ['foma', 'cadana'].includes(project.appearance) ? ` case-image--${project.appearance}` : ''
    return `<${tag} class="case-card${project.comingSoon ? ' case-card--soon' : ''}" ${attrs}>
      <figure class="case-image${appearance}">${image(project.cardImage, {width: 1400, eager: index === 0, sizes: '(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw'})}</figure>
      <div class="case-meta"><h3>${escape(project.title)}</h3><p>${escape(project.summary)}</p></div>
      ${project.comingSoon ? '<span class="case-card-soon">Coming soon</span>' : ''}</${tag}>`
  }).join('\n')
}
export function shell(template, studio) {
  const $ = load(template)
  $('body').removeClass('is-loading')
  // Root-relative paths work for both original and newly generated nested pages.
  $('a[href], img[src], script[src], link[href]').each((_, el) => {
    const attr = $(el).attr('href') !== undefined ? 'href' : 'src'
    const value = $(el).attr(attr)
    if (value && !value.startsWith('#') && !value.startsWith('/') && !/^[a-z][a-z0-9+.-]*:/i.test(value)) {
      const base = template.includes('href="../css/') ? 'https://cadara.local/cases/' : 'https://cadara.local/'
      $(el).attr(attr, new URL(value, base).pathname)
    }
  })
  // Public routes are extensionless; the build still emits static HTML files.
  $('a[href^="/"]').each((_, el) => {
    const href = $(el).attr('href')
    if (href.startsWith('//')) return
    const url = new URL(href, 'https://cadara.local')
    url.pathname = url.pathname.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/\/$/, '') || '/'
    $(el).attr('href', `${url.pathname}${url.search}${url.hash}`)
  })
  $('.nav-links').each((_, el) => {
    if (!$(el).find('[href="/insights"]').length) $(el).find('a').first().after('<a href="/insights">Insights</a>')
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
    <figure class="case-hero-cover${appearance}">${image(project.coverImage, {eager: true, sizes: '(max-width: 900px) 100vw, 60vw'})}</figure></div>`)
  $('.case-gallery').attr('class', 'case-gallery container').html((project.gallery || []).map(block => {
    const style = `grid-column: ${block.width === 'half' ? 'span 1' : '1 / -1'}`
    if (block._type === 'galleryText') return `<div class="case-gallery-text" style="${style}"><h2>${escape(block.heading)}</h2>${paragraphs(block.paragraphs)}</div>`
    const dimensions = block.image?.asset?._ref?.match(/-(\d+)x(\d+)-/)
    const ratio = Number(block.aspectRatio) > 0 ? Number(block.aspectRatio) : dimensions ? Number(dimensions[1]) / Number(dimensions[2]) : 16 / 9
    return `<figure class="case-gallery-item${block.fit === 'contain' ? ' case-gallery-item--contain' : ''}" style="${style}; --ratio: ${ratio}">${image(block.image, {ratio: block.fit === 'contain' ? undefined : ratio, sizes: block.width === 'half' ? '(max-width: 900px) 100vw, 50vw' : '100vw'})}</figure>`
  }).join(''))
  $('.case-credit').remove()
  if (project.outcome?.length) $('.case-gallery').after(`<section class="case-credit container"><h2>${escape(project.outcomeHeading)}</h2>${paragraphs(project.outcome)}</section>`)
  $('.case-next').remove()
  const next = projects.find(p => p._id === project.nextProject?._ref && !p.comingSoon)
  if (next) $('footer').before(`<a class="case-next container" href="/cases/${escape(next.slug.current)}" aria-label="View next project: ${escape(next.title)}">${image(next.cardImage, {className: 'case-next-cover'})}<span class="case-next-link">View work ↗</span></a>`)
  return $.html()
}
const siteUrl = 'https://cadarastudio.com'
const blockText = block => (block.children || []).map(child => child.text || '').join('')
export function formatDate(value) {
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'})
}
export function readingTime(body) {
  const words = (body || []).filter(b => b._type === 'block').map(blockText).join(' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 225))
}
// Heading anchors for the table of contents; renderBody assigns the same ids in document order.
export function headings(body) {
  const used = new Set()
  return (body || []).filter(b => b._type === 'block' && ['h2', 'h3'].includes(b.style)).map(block => {
    const text = blockText(block).trim()
    const base = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60).replace(/-$/, '') || 'section'
    let id = base
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`
    used.add(id)
    return {id, text, level: block.style}
  })
}
export function renderBody(body) {
  const ids = headings(body).map(h => h.id)
  const heading = tag => ({children}) => `<${tag} id="${escape(ids.shift())}">${children}</${tag}>`
  return toHTML(body || [], {components: {
    block: {h2: heading('h2'), h3: heading('h3')},
    types: {contentImage: ({value}) => `<figure>${image(value)}</figure>`},
    marks: {link: ({value, children}) => safeUrl(value?.href) ? `<a href="${escape(safeUrl(value.href))}" target="_blank" rel="noopener">${children}</a>` : children},
  }})
}
const insightMeta = insight => `<p class="insight-meta">${insight.category ? `<span class="insight-category">${escape(insight.category)}</span>` : ''}<time datetime="${escape(insight.publishedAt)}">${escape(formatDate(insight.publishedAt))}</time></p>`
function insightCard(insight, {featured = false, heading = 'h2'} = {}) {
  return `<a class="insight-card${featured ? ' insight-card--featured' : ''}" href="/insights/${escape(insight.slug.current)}" data-category="${escape(insight.category || '')}">
    <figure class="insight-card-image">${image(insight.coverImage, {width: featured ? 2000 : 1200, ratio: featured ? 3 / 2 : 4 / 3, eager: featured, sizes: featured ? '(max-width: 1200px) 100vw, 50vw' : '(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw'})}</figure>
    <div class="insight-card-copy">${insightMeta(insight)}<${heading}>${escape(insight.title)}</${heading}><p class="insight-card-excerpt">${escape(insight.excerpt)}</p></div></a>`
}
function setNav($) {
  $('.nav-links a').removeAttr('aria-current').filter('[href="/insights"]').attr('aria-current', 'page')
  $('head').append('<link rel="stylesheet" href="/css/insights.css">')
}
export function renderInsight(template, studio, insight, insights = []) {
  const $ = shell(template, studio)
  const url = `${siteUrl}/insights/${insight.slug.current}`
  const description = insight.seoDescription || insight.excerpt
  metadata($, `${insight.title} — Cadara Insights`, description, true)
  $('head').append(`<link rel="canonical" href="${escape(url)}">`)
  if (insight.coverImage?.asset) $('head').append(`<meta property="og:image" content="${escape(imageUrl(insight.coverImage, 1200))}">`)
  $('head').append(`<script type="application/ld+json">${JSON.stringify({'@context': 'https://schema.org', '@type': 'BlogPosting', headline: insight.title, description, datePublished: insight.publishedAt, url,
    ...(insight.author ? {author: {'@type': 'Person', name: insight.author}} : {}), ...(insight.coverImage?.asset ? {image: imageUrl(insight.coverImage, 1200)} : {}),
    publisher: {'@type': 'Organization', name: 'Cadara Studio'}}).replace(/</g, '\\u003c')}</script>`)
  setNav($)
  $('main').addClass('insight-site')
  $('.intro, .work-section, .services-section, .studio-section').remove()
  const toc = headings(insight.body).filter(h => h.level === 'h2')
  const share = [['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`], ['X', `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(insight.title)}`], ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`]]
  const author = insight.author ? `<div class="insight-author">${image(insight.authorImage, {width: 160, ratio: 1, className: 'insight-author-photo', sizes: '64px'})}<div><p>${escape(insight.author)}</p>${insight.authorRole ? `<p>${escape(insight.authorRole)}</p>` : ''}</div></div>` : ''
  const related = insights.filter(i => i._id !== insight._id).sort((a, b) => (b.category === insight.category) - (a.category === insight.category)).slice(0, 3)
  $('footer').before(`<article class="insight-article">
    <header class="insight-hero container">
      <a class="insight-back" href="/insights">← All insights</a>
      <div class="insight-hero-grid"><h1>${escape(insight.title)}</h1>
        <div class="insight-hero-aside">${insightMeta(insight).replace('</p>', `<span>${readingTime(insight.body)} min read</span></p>`)}<p class="insight-excerpt">${escape(insight.excerpt)}</p>${author}</div></div>
    </header>
    ${insight.coverImage?.asset ? `<figure class="insight-cover container">${image(insight.coverImage, {eager: true})}${insight.coverCaption ? `<figcaption>${escape(insight.coverCaption)}</figcaption>` : ''}</figure>` : ''}
    <div class="insight-layout container">
      <aside class="insight-aside"><div class="insight-aside-inner">
        ${toc.length > 1 ? `<nav class="insight-toc" aria-label="Table of contents"><p class="insight-label">Contents</p><ol>${toc.map(h => `<li><a href="#${escape(h.id)}">${escape(h.text)}</a></li>`).join('')}</ol></nav>` : ''}
        <div class="insight-share"><p class="insight-label">Share</p><ul>${share.map(([name, href]) => `<li><a href="${escape(href)}" target="_blank" rel="noopener" data-share="${name.toLowerCase()}">${name}</a></li>`).join('')}<li><button type="button" data-share="copy" data-url="${escape(url)}">Copy link</button></li></ul></div>
      </div></aside>
      <div class="insight-main">
        <div class="insight-body">${renderBody(insight.body)}</div>
        ${(insight.tags || []).length ? `<ul class="insight-tags" aria-label="Tags">${insight.tags.map(tag => `<li>${escape(tag)}</li>`).join('')}</ul>` : ''}
        ${insight.author ? `<div class="insight-author-box"><p class="insight-label">Written by</p>${author}</div>` : ''}
      </div>
    </div>
    ${related.length ? `<section class="insight-related container" aria-labelledby="related-label"><h2 id="related-label" class="insight-label">Recommended reads</h2><div class="insight-grid">${related.map(i => insightCard(i, {heading: 'h3'})).join('')}</div></section>` : ''}
  </article>`)
  return $.html()
}
export function renderInsights(template, studio, insights) {
  const $ = shell(template, studio)
  metadata($, 'Insights — Cadara Studio', 'Perspectives on brand, product design and the future of financial services from Cadara Studio.')
  $('head').append(`<link rel="canonical" href="${siteUrl}/insights">`)
  setNav($)
  $('main').addClass('insight-site')
  $('.intro-headline').text('Insights')
  $('.intro').append('<p class="intro-tagline">Perspectives on brand, product and the future of financial services.</p>')
  $('.services-section, .studio-section').remove()
  const categories = [...new Set(insights.map(i => i.category).filter(Boolean))]
  const [featured, ...rest] = insights
  $('.work-section').attr('class', 'insights-section').attr('aria-label', 'Insights').attr('id', 'insights').html(insights.length ? `
    <div class="insight-filters container" role="group" aria-label="Filter by category">
      ${['All', ...categories].map((c, i) => `<button type="button" data-filter="${i ? escape(c) : ''}" aria-pressed="${i === 0}">${escape(c)}<sup>${i ? insights.filter(x => x.category === c).length : insights.length}</sup></button>`).join('')}
    </div>
    <div class="insight-list container">${insightCard(featured, {featured: true})}${rest.map(i => insightCard(i)).join('')}</div>`
    : '<p class="container">Insights will appear here when published.</p>')
  return $.html()
}
