import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'ONDO',

  projectId: 's3nnv28f',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.documentTypeListItem('product').title('Products'),
            S.documentTypeListItem('productTag').title('Product Tags'),
            S.divider(),
            S.listItem()
              .title('Site Settings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.listItem()
              .title('Hero Section')
              .child(S.document().schemaType('heroSettings').documentId('heroSettings')),
            S.listItem()
              .title('Products Settings')
              .child(S.document().schemaType('productSettings').documentId('productSettings')),
            S.listItem()
              .title('Process Section')
              .child(S.document().schemaType('processSettings').documentId('processSettings')),
            S.listItem()
              .title('About Section')
              .child(S.document().schemaType('aboutSettings').documentId('aboutSettings')),
            S.listItem()
              .title('Manifesto Section')
              .child(S.document().schemaType('manifestoSettings').documentId('manifestoSettings')),
            S.listItem()
              .title('Footer')
              .child(S.document().schemaType('footerSettings').documentId('footerSettings')),
            S.divider(),
            S.listItem()
              .title('Subscription Popup')
              .child(S.document().schemaType('popupSettings').documentId('popupSettings')),
            S.listItem()
              .title('Subscription Funnel')
              .child(S.document().schemaType('funnelSettings').documentId('funnelSettings')),
            S.divider(),
            S.listItem()
              .title('Delivery Zones')
              .child(S.document().schemaType('deliveryZones').documentId('deliveryZones')),
            S.documentTypeListItem('deliveryLead').title('Delivery Leads'),
          ])
    }),
    visionTool()
  ],

  schema: {
    types: schemaTypes,
  },
})
