import {defineType, defineField} from 'sanity'
const required = Rule => Rule.required()
const text = (name, title, isRequired = false) => defineField({name, title, type: 'text', rows: 3, ...(isRequired ? {validation: required} : {})})
const string = (name, title, isRequired = false) => defineField({name, title, type: 'string', ...(isRequired ? {validation: required} : {})})
const paragraphs = (name, title) => defineField({name, title, type: 'array', of: [{type: 'text', rows: 4}]})
const externalUrl = (name, title) => defineField({name, title, type: 'url', validation: Rule => Rule.uri({scheme: ['http', 'https']})})
const slug = (source, reserved = []) => defineField({name: 'slug', type: 'slug', title: 'URL slug', options: {source}, validation: Rule => Rule.required().custom(value =>
  !value?.current || (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) && !reserved.includes(value.current)) ? true : 'Use lowercase letters, numbers, and hyphens; this slug must not be a reserved page name.')})
const contentImage = defineType({name: 'contentImage', title: 'Image', type: 'image', options: {hotspot: true}, fields: [string('alt', 'Alternative text', true)]})
export const imageLayouts = [{title: 'Single (full width)', value: 'single'}, {title: 'Pair (side by side)', value: 'pair'}, {title: 'Grid (three across)', value: 'grid'}]
const layoutCounts = {single: [1, 1], pair: [1, 2], grid: [3, Infinity]}
// One row of case-study images. The layout decides the arrangement; crop each image in place to adjust framing.
const imageRow = defineType({name: 'imageRow', title: 'Images', type: 'object', fields: [
  defineField({name: 'layout', title: 'Layout', type: 'string', options: {list: imageLayouts, layout: 'radio', direction: 'horizontal'}, initialValue: 'single', validation: required}),
  defineField({name: 'images', title: 'Images', type: 'array', of: [{type: 'contentImage'}], options: {layout: 'grid'}, validation: Rule => Rule.required().min(1).custom((images, context) => {
    const [min, max] = layoutCounts[context.parent?.layout] || [1, Infinity]
    const count = images?.length || 0
    if (count > max) return `${context.parent.layout === 'single' ? 'A single' : 'A pair'} holds ${max} image${max > 1 ? 's' : ''}. Add another row for the rest.`
    if (count && count < min) return 'A grid needs at least three images. Use a pair or single instead.'
    return true
  })}),
], preview: {select: {layout: 'layout', images: 'images', media: 'images.0'}, prepare: ({layout, images, media}) => {
  const count = Object.keys(images || {}).length
  return {title: (imageLayouts.find(item => item.value === layout) || imageLayouts[0]).title, subtitle: `${count} image${count === 1 ? '' : 's'}`, media}
}}})
const storySection = defineType({name: 'storySection', title: 'Story section', type: 'object', fields: [string('heading', 'Heading', true), paragraphs('paragraphs', 'Paragraphs')], preview: {select: {title: 'heading', subtitle: 'paragraphs.0'}}})
const caseStudy = defineType({name: 'caseStudy', title: 'Case study', type: 'document', fields: [
  string('title', 'Project name', true), slug('title', ['work', 'offer']),
  defineField({name: 'summary', title: 'Short description', type: 'text', rows: 2, description: 'One sentence. Shown under "See more" and used for search and link previews.', validation: required}),
  defineField({name: 'cardImage', title: 'Homepage card image', type: 'contentImage', validation: required}),
  defineField({name: 'featured', title: 'Show on homepage', type: 'boolean', initialValue: true}),
  defineField({name: 'order', title: 'Display order', type: 'number', description: 'Lower numbers appear first.', initialValue: 0}),
  defineField({name: 'intro', title: 'Introduction', type: 'array', of: [{type: 'text', rows: 4}], description: 'The first paragraph shows on the page; the rest appear under "See more".'}),
  defineField({name: 'sections', title: 'Story sections', type: 'array', of: [{type: 'storySection'}], description: 'Headed sections under "See more", e.g. Objective, Outcome.'}),
  defineField({name: 'services', type: 'array', of: [{type: 'string'}], options: {layout: 'tags'}}),
  string('duration', 'Duration', false),
  externalUrl('website', 'Company website'),
  defineField({name: 'images', title: 'Images', type: 'array', of: [{type: 'imageRow'}], description: 'Drag to reorder. The first image is the hero. Choose single, pair or grid for each row.', validation: Rule => Rule.required().min(1)}),
], preview: {select: {title: 'title', media: 'cardImage', subtitle: 'summary'}}})
const richText = defineType({name: 'richText', title: 'Article body', type: 'array', of: [
  {type: 'block', styles: [{title: 'Paragraph', value: 'normal'}, {title: 'Heading', value: 'h2'}, {title: 'Subheading', value: 'h3'}, {title: 'Quote', value: 'blockquote'}],
    marks: {decorators: [{title: 'Bold', value: 'strong'}, {title: 'Italic', value: 'em'}], annotations: [{name: 'link', type: 'object', fields: [externalUrl('href', 'URL')]}]}},
  {type: 'contentImage'},
]})
export const insightCategories = ['Opinion', 'Design', 'Strategy', 'Studio news']
const insight = defineType({name: 'insight', title: 'Insight', type: 'document', fields: [
  string('title', 'Title', true), slug('title', ['index']), text('excerpt', 'Excerpt', true),
  defineField({name: 'category', type: 'string', options: {list: insightCategories}, initialValue: 'Opinion', validation: required}),
  defineField({name: 'tags', type: 'array', of: [{type: 'string'}], options: {layout: 'tags'}}),
  defineField({name: 'coverImage', title: 'Cover image', type: 'contentImage'}), string('coverCaption', 'Cover caption or credit'),
  string('author', 'Author'), string('authorRole', 'Author role'), defineField({name: 'authorImage', title: 'Author photo', type: 'contentImage'}),
  defineField({name: 'publishedAt', title: 'Publication date', type: 'date', validation: required}),
  defineField({name: 'body', type: 'richText', validation: Rule => Rule.required().min(1)}), text('seoDescription', 'Search description'),
], preview: {select: {title: 'title', media: 'coverImage', subtitle: 'category'}}})
const studioPage = defineType({name: 'studioPage', title: 'Studio', type: 'document', fields: [
  defineField({name: 'home', title: 'Homepage', type: 'object', description: 'Optional overrides for the new homepage. Empty fields use the Figma design copy.', fields: [
    text('headline', 'Headline'), paragraphs('intro', 'Introduction paragraphs'),
    defineField({name: 'contactEmail', title: 'Homepage contact email', type: 'string', validation: Rule => Rule.email()}),
    text('teamCopy', 'Team description'),
    defineField({name: 'engagements', title: 'Past engagements', type: 'array', of: [{type: 'object', name: 'engagement', fields: [
      string('name', 'Client name', true), string('year', 'Year / label'), externalUrl('website', 'Company website (external URL)'),
      defineField({name: 'disabled', title: 'Disable link (grey out)', type: 'boolean', initialValue: false}),
      defineField({name: 'services', title: 'Service tags', type: 'array', of: [{type: 'string'}]}),
      defineField({name: 'project', title: 'Use company website from project (optional)', type: 'reference', to: [{type: 'caseStudy'}]}),
    ], preview: {select: {title: 'name', subtitle: 'year'}}}]}),
    defineField({name: 'socials', title: 'Homepage social links', type: 'array', of: [{type: 'object', name: 'homeSocialLink', fields: [string('title', 'Label', true), externalUrl('url', 'URL')]}]}),
    text('seoDescription', 'Search description'),
  ]}),
  text('headline', 'Legacy homepage headline', true), text('workHeadline', 'Work page headline', true), text('statement', 'Studio statement', true),
  string('servicesHeading', 'Services heading', true), text('servicesTagline', 'Services page tagline'),
  defineField({name: 'services', type: 'array', of: [{type: 'object', name: 'service', fields: [string('title', 'Title', true), text('description', 'Description', true), defineField({name: 'icon', type: 'string', options: {list: ['strategy', 'design', 'build']}})]}]}),
  defineField({name: 'contactEmail', type: 'string', validation: Rule => Rule.required().email()}),
  defineField({name: 'socials', title: 'Social links', type: 'array', of: [{type: 'object', name: 'socialLink', fields: [string('title', 'Label', true), externalUrl('url', 'URL')]}]}),
]})
export const schemaTypes = [contentImage, imageRow, storySection, richText, caseStudy, insight, studioPage]
