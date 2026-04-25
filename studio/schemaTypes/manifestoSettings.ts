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
      name: 'panel1BgColor',
      title: 'Panel 1 - Background Color',
      type: 'string',
      initialValue: '#6ca53a',
    }),
    defineField({
      name: 'panel1TextColor1',
      title: 'Panel 1 - Text Color 1 (Top)',
      type: 'string',
      initialValue: '#f1f3b0',
    }),
    defineField({
      name: 'panel1TextColor2',
      title: 'Panel 1 - Text Color 2 (Bottom/Logo)',
      type: 'string',
      initialValue: '#bfe46b',
    }),
    defineField({
      name: 'panel1TitleTop',
      title: 'Panel 1 - Top Title',
      type: 'translationRecord',
    }),
    defineField({
      name: 'panel1City',
      title: 'Panel 1 - City Text',
      type: 'translationRecord',
    }),
    defineField({
      name: 'panel1TitleBottom',
      title: 'Panel 1 - Bottom Title',
      type: 'translationRecord',
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
      name: 'panel2Color',
      title: 'Panel 2 - Accent Color',
      type: 'string',
      initialValue: '#6ca53a',
    }),
    defineField({
      name: 'panel2Title',
      title: 'Panel 2 - Inset Title',
      type: 'translationRecord',
    }),
    defineField({
      name: 'panel2Mission',
      title: 'Panel 2 - Mission Text',
      type: 'translationRecord',
    }),
    defineField({
      name: 'panel2CTA',
      title: 'Panel 2 - Button Text',
      type: 'translationRecord',
    }),
    defineField({
      name: 'panel3Title',
      title: 'Panel 3 - Top Title',
      type: 'translationRecord',
    }),
    defineField({
      name: 'panel3Text',
      title: 'Panel 3 - Body Text',
      type: 'translationRecord',
    }),
    defineField({
      name: 'panel3CTA',
      title: 'Panel 3 - Link Text',
      type: 'translationRecord',
    }),
    defineField({
      name: 'panel3Image',
      title: 'Panel 3 - Bottom Graphic Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'panel4TextColor',
      title: 'Panel 4 - Accent Color',
      type: 'string',
      initialValue: '#5b9538',
    }),
    defineField({
      name: 'panel4TextTop',
      title: 'Panel 4 - Top Text',
      type: 'translationRecord',
    }),
    defineField({
      name: 'panel4CityLeft',
      title: 'Panel 4 - Middle Left Text',
      type: 'translationRecord',
    }),
    defineField({
      name: 'panel4CityRight',
      title: 'Panel 4 - Middle Right Text',
      type: 'translationRecord',
    }),
    defineField({
      name: 'panel4Title',
      title: 'Panel 4 - Massive Bottom Title',
      type: 'translationRecord',
    }),
  ],
})
