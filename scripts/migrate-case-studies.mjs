// One-time move of case studies to the simplified schema: image rows (single / pair / grid)
// and story sections. Forced aspect ratios become visible Sanity crops. Drafts are migrated too.
// Preview: npm run migrate:case-studies -- --dry-run   Apply: npm run migrate:case-studies
import {mkdir, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {getCliClient} from 'sanity/cli'
import {normalizeProject} from './render.mjs'
import {root} from './content.mjs'
const legacy = ['comingSoon', 'headline', 'lead', 'date', 'appearance', 'coverImage', 'gallery', 'outcomeHeading', 'outcome', 'nextProject', 'seoDescription']
const client = getCliClient({apiVersion: '2026-10-01'}).withConfig({useCdn: false, perspective: 'raw'})
const docs = await client.fetch('*[_type == "caseStudy"]')
const pending = docs.filter(doc => !doc.images || legacy.some(key => key in doc))
await mkdir(path.join(root, '.context'), {recursive: true})
await writeFile(path.join(root, '.context/case-studies-backup.json'), JSON.stringify(docs, null, 2))
const changes = pending.map(doc => {
  const next = normalizeProject(doc)
  return {id: doc._id, rev: doc._rev, set: {images: next.images, sections: next.sections, summary: next.summary, ...(next.intro ? {intro: next.intro} : {})}, unset: legacy.filter(key => key in doc)}
})
await writeFile(path.join(root, '.context/case-studies-migration.json'), JSON.stringify(changes, null, 2))
for (const change of changes) console.log(`${change.id}: ${change.set.images.map(row => `${row.layout}×${row.images.length}`).join(', ') || 'no images'}; ${change.set.sections.length} sections; removing ${change.unset.join(', ')}`)
if (process.argv.includes('--dry-run')) console.log(`\nDry run: ${changes.length} documents would change. Backup and plan saved in .context/.`)
else if (changes.length) {
  const tx = client.transaction()
  for (const change of changes) tx.patch(change.id, patch => patch.ifRevisionId(change.rev).set(change.set).unset(change.unset))
  await tx.commit()
  console.log(`\nMigrated ${changes.length} documents. Backup saved in .context/case-studies-backup.json.`)
} else console.log('Nothing to migrate.')
