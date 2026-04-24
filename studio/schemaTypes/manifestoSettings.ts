import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'manifestoSettings',
  title: 'Manifesto Section',
  type: 'document',
  fields: [
    defineField({
      name: 'showManifesto',
      title: 'Show Manifesto Section',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle visibility of the 4-column poster section.',
    }),
    defineField({
      name: 'panel1TitleTop',
      title: 'Panel 1 - Top Title',
      type: 'string',
      description: 'Massive text on top of the green poster (e.g. SOUP SOUP)',
      initialValue: 'SOUP SOUP',
    }),
    defineField({
      name: 'panel1City',
      title: 'Panel 1 - City Text',
      type: 'string',
      initialValue: 'MEXICO CITY',
    }),
    defineField({
      name: 'panel1TitleBottom',
      title: 'Panel 1 - Bottom Title',
      type: 'string',
      initialValue: 'FIRST',
    }),
    defineField({
      name: 'panel2Image',
      title: 'Panel 2 - Background Image',
      type: 'image',
      description: 'Background image for the second poster',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'panel2Title',
      title: 'Panel 2 - Inset Title',
      type: 'string',
      initialValue: 'FIRST WE SOUP',
    }),
    defineField({
      name: 'panel2Mission',
      title: 'Panel 2 - Mission Text',
      type: 'text',
      initialValue: 'Our Mission is to nourish body and community with depth — in flavor, sourcing, and experience.',
    }),
    defineField({
      name: 'panel2CTA',
      title: 'Panel 2 - Button Text',
      type: 'string',
      initialValue: '¡APAPÁCHATE!',
    }),
    defineField({
      name: 'panel3Title',
      title: 'Panel 3 - Top Title',
      type: 'string',
      initialValue: '¡Apapáchate!',
    }),
    defineField({
      name: 'panel3Text',
      title: 'Panel 3 - Body Text',
      type: 'text',
      initialValue: 'Ondo is a soup-first brand in Mexico City, creating soulful, seasonal soups that blend tradition and innovation. Our Mission is to nourish body and community with depth — in flavor, sourcing, and experience.',
    }),
    defineField({
      name: 'panel3CTA',
      title: 'Panel 3 - Link Text',
      type: 'string',
      initialValue: 'LEARN MORE',
    }),
    defineField({
      name: 'panel4TextTop',
      title: 'Panel 4 - Top Text',
      type: 'text',
      initialValue: 'Ondo is a soup-first brand in Mexico City, creating soulful, seasonal soups that blend tradition and innovation. Our Mission is to nourish body and community with depth — in flavor, sourcing, and experience.',
    }),
    defineField({
      name: 'panel4CityLeft',
      title: 'Panel 4 - Middle Left Text',
      type: 'string',
      initialValue: 'SOUP FIRST',
    }),
    defineField({
      name: 'panel4CityRight',
      title: 'Panel 4 - Middle Right Text',
      type: 'string',
      initialValue: 'CDMX',
    }),
    defineField({
      name: 'panel4Title',
      title: 'Panel 4 - Massive Bottom Title',
      type: 'string',
      initialValue: 'IN SOUP WE TRUST',
    }),
  ],
})
