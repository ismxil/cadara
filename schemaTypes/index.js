import {defineType, defineField} from 'sanity'
const required = Rule => Rule.required()
const text = (name, title, isRequired = false) => defineField({name, title, type: 'text', rows: 3, ...(isRequired ? {validation: required} : {})})
const string = (name, title, isRequired = false) => defineField({name, title, type: 'string', ...(isRequired ? {validation: required} : {})})
const paragraphs = (name, title) => defineField({name, title, type: 'array', of: [{type: 'text', rows: 4}]})
const externalUrl = (name, title) => defineField({name, title, type: 'url', validation: Rule => Rule.uri({scheme: ['http', 'https']})})
const slug = (source, reserved = []) => defineField({name: 'slug', type: 'slug', title: 'URL slug', options: {source}, validation: Rule => Rule.required().custom(value =>
  !value?.current || (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) && !reserved.includes(value.current)) ? true : 'Use lowercase letters, numbers, and hyphens; this slug must not be a reserved page name.')})
const width = defineField({name: 'width', title: 'Layout width', type: 'string', options: {list: [{title: 'Full width', value: 'full'}, {title: 'Half width', value: 'half'}]}, initialValue: 'full', validation: required})
const contentImage = defineType({name: 'contentImage', title: 'Image', type: 'image', options: {hotspot: true}, fields: [string('alt', 'Alternative text', true)]})
const galleryImage = defineType({name: 'galleryImage', title: 'Gallery image', type: 'object', fields: [
  defineField({name: 'image', type: 'contentImage', validation: required}), width,
  defineField({name: 'aspectRatio', title: 'Aspect ratio (width / height)', type: 'number', initialValue: 16 / 9, validation: Rule => Rule.positive()}),
  defineField({name: 'fit', title: 'Image fit', type: 'string', options: {list: ['cover', 'contain']}, initialValue: 'cover'}),
], preview: {select: {title: 'image.alt', media: 'image'}}})
const galleryText = defineType({name: 'galleryText', title: 'Gallery text', type: 'object', fields: [string('heading', 'Heading', true), paragraphs('paragraphs', 'Paragraphs'), width], preview: {select: {title: 'heading'}}})
const caseStudy = defineType({name: 'caseStudy', title: 'Case study', type: 'document', fields: [
  string('title', 'Client / project name', true), slug('title', ['work', 'offer']), text('summary', 'Card description', true),
  defineField({name: 'cardImage', title: 'Card image', type: 'contentImage', validation: required}),
  defineField({name: 'order', title: 'Display order', type: 'number', initialValue: 0}),
  defineField({name: 'featured', title: 'Show on homepage', type: 'boolean', initialValue: true}),
  defineField({name: 'comingSoon', title: 'Coming soon (card only)', type: 'boolean', initialValue: false}),
  text('headline', 'Case study headline'),
  defineField({name: 'services', type: 'array', of: [{type: 'string'}]}),
  defineField({name: 'date', title: 'Project date', type: 'date'}),
  string('duration', 'Project duration (instead of date)'),
  paragraphs('intro', 'Introduction paragraphs'), externalUrl('website', 'Company website'),
  defineField({name: 'coverImage', title: 'Hero image', type: 'contentImage', validation: Rule => Rule.custom((value, context) => context.parent?.comingSoon || value?.asset ? true : 'Add a hero image for a complete case study.')}),
  defineField({name: 'appearance', title: 'Existing project styling', type: 'string', options: {list: ['default', 'lemfi', 'foma', 'cadana', 'gomoney', 'mezovest']}, initialValue: 'default'}),
  defineField({name: 'gallery', title: 'Gallery (drag to reorder)', type: 'array', of: [{type: 'galleryImage'}, {type: 'galleryText'}]}),
  string('outcomeHeading', 'Closing section heading'), paragraphs('outcome', 'Closing paragraphs'),
  defineField({name: 'nextProject', title: 'Next project', type: 'reference', to: [{type: 'caseStudy'}]}),
  text('seoDescription', 'Search description'),
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
      string('name', 'Client name', true), string('year', 'Year / label'),
      defineField({name: 'services', title: 'Service tags', type: 'array', of: [{type: 'string'}]}),
      defineField({name: 'project', title: 'Case study (optional)', type: 'reference', to: [{type: 'caseStudy'}]}),
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
export const schemaTypes = [contentImage, galleryImage, galleryText, richText, caseStudy, insight, studioPage]
