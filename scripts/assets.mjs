import path from 'node:path'
import sharp from 'sharp'
import {root} from './content.mjs'

// Keep source photography intact; ship sized WebP variants in the static build.
export async function optimizeStudioImages($, output) {
  await Promise.all($('.studio-media-placeholder--image img, .studio-team-image img').toArray().map(async el => {
    const img = $(el)
    const source = img.attr('src')
    const input = path.join(root, source)
    const {width, height} = await sharp(input).metadata()
    const portrait = img.parent().hasClass('studio-team-image')
    const maxWidth = Math.min(width, portrait ? 960 : 1600)
    const widths = [...new Set([320, 480, 960, maxWidth].filter(w => w <= maxWidth))].sort((a, b) => a - b)
    const stem = source.replace(/\.[^.]+$/, '')
    await Promise.all(widths.map(w => sharp(input).resize({width: w, withoutEnlargement: true}).webp({quality: 82}).toFile(path.join(output, `${stem}-${w}.webp`))))
    img.attr({
      src: `${stem}-${maxWidth}.webp`,
      srcset: widths.map(w => `${stem}-${w}.webp ${w}w`).join(', '),
      sizes: portrait ? '(max-width: 600px) 180px, 220px' : '(max-width: 900px) 100vw, 60vw',
      width, height, loading: 'lazy', decoding: 'async',
    })
  }))
}
