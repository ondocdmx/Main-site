import { defineType, defineField } from 'sanity'

export const aboutSettings = defineType({
  name: 'aboutSettings',
  title: 'About Section Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'aboutTitle',
      title: 'About Section Title',
      type: 'string',
      initialValue: 'Ondo is a soup-first\\nbrand in Mexico City',
    }),
    defineField({
      name: 'aboutHeader',
      title: 'About Section Header',
      type: 'string',
      initialValue: 'ABOUT',
    }),
    defineField({
      name: 'aboutSub',
      title: 'About Section Subtitle',
      type: 'text',
      initialValue: 'Ondo is a soup-first brand in Mexico City, creating soulful, seasonal soups that blend tradition and innovation. Our Mission is to nourish body and community with depth — in flavor, sourcing, and experience.',
    }),
    defineField({
      name: 'aboutLink',
      title: 'About Link Text',
      type: 'string',
      initialValue: 'LEARN MORE',
    }),
    defineField({
      name: 'aboutCTA',
      title: 'About CTA Button',
      type: 'string',
      initialValue: '¡APAPÁCHATE!',
    }),
  ]
})
