import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {load} from 'cheerio'
import {insights} from './insights.mjs'
export const root = path.resolve(import.meta.dirname, '..')
const clean = value => value.replace(/\s+/g, ' ').trim()
const paragraphs = ($, selector) => $(selector).map((_, el) => clean($(el).text())).get()
export async function extractContent() {
  const home = load(await readFile(path.join(root, 'scripts/templates/legacy-home.html'), 'utf8'))
  const css = await readFile(path.join(root, 'cases/css/case.css'), 'utf8')
  const docs = []
  const image = ($, el, base) => {
    const src = $(el).attr('src')
    return src ? {_type: 'contentImage', alt: $(el).attr('alt') || 'Project image', localPath: path.posix.join(base, src)} : undefined
  }
  for (const [index, card] of home('.case-card').toArray().entries()) {
    const title = clean(home(card).find('h3').text())
    const slug = title.toLowerCase()
    const doc = {_id: `caseStudy-${slug}`, _type: 'caseStudy', title, slug: {_type: 'slug', current: slug},
      summary: clean(home(card).find('.case-meta p').text()), cardImage: image(home, home(card).find('img'), ''),
      order: index, featured: true, comingSoon: home(card).hasClass('case-card--soon'), appearance: slug === 'sterling' ? 'default' : slug}
    if (!doc.comingSoon) {
      const $ = load(await readFile(path.join(root, 'cases', `${slug}.html`), 'utf8'))
      doc.headline = clean($('.case-hero h1').text())
      doc.services = paragraphs($, '.meta-label')
      const dateText = $('.meta-date').text().trim()
      if (/^\d{2}\.\d{2}\.\d{2}$/.test(dateText)) {
        const [day, month, year] = dateText.split('.')
        doc.date = `20${year}-${month}-${day}`
      } else { doc.duration = dateText }
      doc.intro = paragraphs($, '.case-hero-copy p')
      doc.website = $('.case-visit').attr('href')
      doc.coverImage = image($, $('.case-hero-cover img'), 'cases')
      doc.seoDescription = $('meta[name="description"]').attr('content')
      doc.outcomeHeading = $('.case-credit h2').text()
      doc.outcome = paragraphs($, '.case-credit p')
      const next = $('.case-next').attr('href')
      if (next && !next.includes('work')) doc.nextProject = {_type: 'reference', _ref: `caseStudy-${path.basename(next, '.html')}`}
      doc.gallery = $('.case-gallery > *').toArray().map((el, i) => {
        const classes = ($(el).attr('class') || '').split(/\s+/)
        const layoutClass = classes.find(c => /^[a-z]+-\d/.test(c))
        const rule = css.match(new RegExp(`\\.${layoutClass} \\{([^}]+)\\}`))?.[1] || ''
        const width = rule.includes('1 / -1') ? 'full' : 'half'
        if ($(el).hasClass('case-gallery-text')) return {_key: `gallery-${i}`, _type: 'galleryText', heading: $(el).find('h2').text(), paragraphs: paragraphs($, $(el).find('p')), width}
        const ratio = $(el).attr('style')?.match(/--ratio:\s*([\d.]+)\s*\/\s*([\d.]+)/)
        return {_key: `gallery-${i}`, _type: 'galleryImage', image: image($, $(el).find('img'), 'cases'), width,
          aspectRatio: ratio ? Number(ratio[1]) / Number(ratio[2]) : $(el).hasClass('case-gallery-item--tall') ? 2772 / 2700 : $(el).hasClass('case-gallery-item--full') ? undefined : 2772 / 1560,
          fit: $(el).hasClass('case-gallery-item--contain') ? 'contain' : 'cover'}
      })
    }
    docs.push(doc)
  }
  const offer = load(await readFile(path.join(root, 'cases/offer.html'), 'utf8'))
  const work = load(await readFile(path.join(root, 'cases/work.html'), 'utf8'))
  docs.push({_id: 'studioPage', _type: 'studioPage', headline: clean(home('.intro-headline').text()), workHeadline: clean(work('.intro-headline').text()),
    statement: clean(home('.statement p').text()), servicesHeading: clean(offer('.intro-headline').text()), servicesTagline: clean(offer('.intro-tagline').text()),
    contactEmail: home('.footer-actions a').first().attr('href').replace('mailto:', ''),
    services: home('.service-card').toArray().map((el, i) => ({_key: `service-${i}`, _type: 'service', title: home(el).find('h3').text(), description: clean(home(el).find('p').text()), icon: path.basename(home(el).find('img').attr('src'), '.svg')})),
    socials: home('.footer-socials a').toArray().map((el, i) => ({_key: `social-${i}`, _type: 'socialLink', title: home(el).text(), url: home(el).attr('href')})),
  })
  docs.push(...structuredClone(insights))
  return docs
}
