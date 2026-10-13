import {readFile, mkdir, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {extractContent, root} from './content.mjs'
const docs = await extractContent()
const paths = new Set()
function collect(value) {
  if (!value || typeof value !== 'object') return
  if (value.localPath) paths.add(value.localPath)
  Object.values(value).forEach(collect)
}
docs.forEach(collect)
// Validate every source image before making any remote writes.
for (const file of paths) await readFile(path.join(root, file))
if (process.argv.includes('--dry-run')) {
  await mkdir(path.join(root, '.context'), {recursive: true})
  await writeFile(path.join(root, '.context/content-preview.json'), JSON.stringify(docs, null, 2))
  console.log(`Ready to import ${docs.length} documents and ${paths.size} images. Preview: .context/content-preview.json`)
} else {
  const {getCliClient} = await import('sanity/cli')
  const client = getCliClient({apiVersion: '2026-10-01'}).withConfig({useCdn: false, ...(process.env.SANITY_API_TOKEN ? {token: process.env.SANITY_API_TOKEN} : {})})
  const existingIds = new Set(await client.fetch('*[_id in $ids || _id in $draftIds]._id', {ids: docs.map(d => d._id), draftIds: docs.map(d => `drafts.${d._id}`)}))
  const uploads = new Map()
  async function upload(value) {
    if (!value || typeof value !== 'object') return value
    if (value.localPath) {
      const file = value.localPath
      if (!uploads.has(file)) uploads.set(file, await client.assets.upload('image', await readFile(path.join(root, file)), {filename: path.basename(file)}))
      const {localPath, ...image} = value
      return {...image, asset: {_type: 'reference', _ref: uploads.get(file)._id}}
    }
    if (Array.isArray(value)) return Promise.all(value.map(upload))
    return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([key, child]) => [key, await upload(child)])))
  }
  const pending = []
  for (const doc of docs) {
    if (existingIds.has(doc._id) || existingIds.has(`drafts.${doc._id}`)) {console.log(`Preserving existing ${doc._id}`); continue}
    pending.push(await upload(doc))
  }
  if (pending.length) {
    let transaction = client.transaction()
    for (const doc of pending) transaction = transaction.createIfNotExists(doc)
    await transaction.commit()
  }
  console.log(`Imported ${pending.length} documents; uploaded ${uploads.size} images. Existing content was preserved.`)
}
