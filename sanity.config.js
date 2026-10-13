import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes/index.js'
const singleton = 'studioPage'
export default defineConfig({
  name: 'cadara', title: 'Cadara', projectId: 'o47ti8nx', dataset: 'production',
  plugins: [structureTool({structure: S => S.list().title('Cadara content').items([
    S.documentTypeListItem('caseStudy').title('Case studies'),
    S.documentTypeListItem('insight').title('Insights'),
    S.listItem().title('Studio').child(S.document().schemaType(singleton).documentId('studioPage')),
  ])})],
  schema: {types: schemaTypes, templates: templates => templates.filter(t => t.schemaType !== singleton)},
  document: {actions: (actions, context) => context.schemaType === singleton
    ? actions.filter(a => !['delete', 'duplicate', 'unpublish'].includes(a.action)) : actions},
})
