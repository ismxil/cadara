import {mkdir, readFile, writeFile, cp, rm} from 'node:fs/promises'
import path from 'node:path'
import {createClient} from '@sanity/client'
import {root} from './content.mjs'
import {shell, cards, metadata, renderCase, renderInsight, renderInsights} from './render.mjs'
export function validateContent(docs) {
  const studio = docs.find(d => d._type === 'studioPage' && d._id === 'studioPage')
  if (!studio) throw new Error('Studio content is missing. Run npm run import:content before building.')
  for (const type of ['caseStudy', 'insight']) {
    const slugs = new Set()
    for (const doc of docs.filter(d => d._type === type)) {
      const slug = doc.slug?.current
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '') || (type === 'insight' && slug === 'index') || (type === 'caseStudy' && ['work', 'offer'].includes(slug))) throw new Error(`Invalid or reserved slug for ${doc._id}`)
      if (slugs.has(slug)) throw new Error(`Duplicate ${type} slug: ${slug}`)
      slugs.add(slug)
    }
  }
  return studio
}
export async function buildSite(docs, output = path.join(root, 'dist/site')) {
  const studio = validateContent(docs)
  const projects = docs.filter(d => d._type === 'caseStudy').sort((a, b) => (a.order || 0) - (b.order || 0))
  const insights = docs.filter(d => d._type === 'insight').sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
  const [homeTemplate, workTemplate, offerTemplate, caseTemplate] = await Promise.all(['index.html', 'cases/work.html', 'cases/offer.html', 'cases/lemfi.html'].map(file => readFile(path.join(root, file), 'utf8')))
  await rm(output, {recursive: true, force: true})
  await mkdir(path.join(output, 'cases'), {recursive: true})
  await mkdir(path.join(output, 'insights'), {recursive: true})
  for (const dir of ['css', 'js', 'asset', 'fonts', 'cases/css', 'cases/js']) await cp(path.join(root, dir), path.join(output, dir), {recursive: true, filter: source => !source.endsWith('.DS_Store')})
  const home = shell(homeTemplate, studio)
  home('.intro-headline').text(studio.headline)
  home('.cases-grid').html(cards(projects.filter(p => p.featured)))
  metadata(home, 'Cadara Studio', studio.headline)
  await writeFile(path.join(output, 'index.html'), home.html())
  const work = shell(workTemplate, studio)
  work('.intro-headline').text(studio.workHeadline)
  work('.cases-grid').html(cards(projects))
  await writeFile(path.join(output, 'cases/work.html'), work.html())
  const offer = shell(offerTemplate, studio)
  offer('.intro-headline').text(studio.servicesHeading)
  offer('.intro-tagline').text(studio.servicesTagline)
  await writeFile(path.join(output, 'cases/offer.html'), offer.html())
  for (const project of projects.filter(p => !p.comingSoon)) await writeFile(path.join(output, 'cases', `${project.slug.current}.html`), renderCase(caseTemplate, studio, project, projects))
  await writeFile(path.join(output, 'insights/index.html'), renderInsights(workTemplate, studio, insights))
  for (const insight of insights) await writeFile(path.join(output, 'insights', `${insight.slug.current}.html`), renderInsight(homeTemplate, studio, insight))
  console.log(`Built ${projects.length} project cards, ${projects.filter(p => !p.comingSoon).length} case studies, and ${insights.length} insights.`)
}
if (process.argv[1] === path.join(root, 'scripts/build.mjs')) {
  const client = createClient({projectId: 'o47ti8nx', dataset: 'production', apiVersion: '2026-10-01', useCdn: false, perspective: 'published', token: process.env.SANITY_API_READ_TOKEN})
  const docs = await client.fetch('*[_type in ["caseStudy", "insight", "studioPage"] && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]')
  await buildSite(docs)
}
