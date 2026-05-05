import {defineField, defineType} from 'sanity'

export const manifestoSettings = defineType({
  name: 'manifestoSettings',
  title: 'Manifesto Section',
  type: 'document',
  groups: [
    { name: 'general', title: 'General' },
    { name: 'panel1', title: 'Panel 1 — Club CTA' },
    { name: 'panel2', title: 'Panel 2 — Lo que incluye' },
    { name: 'panel3', title: 'Panel 3 — Quiénes Somos / Tú Decides' },
  ],
  preview: {
    prepare() {
      return {
        title: 'Manifesto Section Settings'
      }
    }
  },
  fields: [
    // ── GENERAL ────────────────────────────────────────────────────────
    defineField({
      name: 'showManifesto',
      title: 'Show Manifesto Section',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle visibility of the 3-column poster section.',
      group: 'general',
    }),

    // ── PANEL 1 — Club CTA ────────────────────────────────────────────
    defineField({
      name: 'panel1BgColor',
      title: 'Background Color',
      type: 'string',
      initialValue: '#6ca53a',
      group: 'panel1',
    }),
    defineField({
      name: 'panel1TextColor1',
      title: 'Primary Text Color',
      type: 'string',
      initialValue: '#f1f3b0',
      group: 'panel1',
    }),
    defineField({
      name: 'panel1TextColor2',
      title: 'Accent Text Color',
      type: 'string',
      initialValue: '#e8632a',
      group: 'panel1',
    }),
    defineField({
      name: 'panel1Eyebrow',
      title: 'Eyebrow Text',
      type: 'translationRecord',
      group: 'panel1',
    }),
    defineField({
      name: 'panel1TitleLine1',
      title: 'Title Line 1',
      type: 'translationRecord',
      description: 'Use line breaks (\\n) to split into multiple lines.',
      group: 'panel1',
    }),
    defineField({
      name: 'panel1TitleLine2',
      title: 'Title Line 2 (accent color)',
      type: 'translationRecord',
      group: 'panel1',
    }),
    defineField({
      name: 'panel1Subheadline',
      title: 'Subheadline',
      type: 'translationRecord',
      description: 'Subheadline text below the title.',
      group: 'panel1',
    }),
    defineField({
      name: 'panel1SubAccentWord',
      title: 'Accent Word in Subheadline',
      type: 'translationRecord',
      description: 'The word in the subheadline to highlight in accent color. Must match exactly the word in the subheadline (per language).',
      group: 'panel1',
    }),
    defineField({
      name: 'panel1Tagline',
      title: 'Tagline (italic)',
      type: 'translationRecord',
      group: 'panel1',
    }),
    defineField({
      name: 'panel1CTAText',
      title: 'CTA Button Text',
      type: 'translationRecord',
      group: 'panel1',
    }),

    // ── PANEL 2 — Lo que incluye ──────────────────────────────────────
    defineField({
      name: 'panel2BgColor',
      title: 'Background Color',
      type: 'string',
      initialValue: '#2d4a1e',
      group: 'panel2',
    }),
    defineField({
      name: 'panel2Eyebrow',
      title: 'Eyebrow Text',
      type: 'translationRecord',
      group: 'panel2',
    }),
    defineField({
      name: 'panel2HeadlinePrimary',
      title: 'Headline (primary color)',
      type: 'translationRecord',
      group: 'panel2',
    }),
    defineField({
      name: 'panel2HeadlineAccent',
      title: 'Headline (accent color)',
      type: 'translationRecord',
      group: 'panel2',
    }),
    defineField({
      name: 'panel2Benefits',
      title: 'Benefits List',
      type: 'array',
      group: 'panel2',
      of: [{
        type: 'object',
        name: 'benefitItem',
        preview: { select: { title: 'es' } },
        fields: [
          defineField({ name: 'es', title: 'Título (Español)', type: 'string' }),
          defineField({ name: 'en', title: 'Title (English)', type: 'string' }),
          defineField({ name: 'subtitleEs', title: 'Subtítulo (Español)', type: 'string' }),
          defineField({ name: 'subtitleEn', title: 'Subtitle (English)', type: 'string' }),
        ],
      }],
    }),

    // ── PANEL 3 — Quiénes Somos / Tú Decides ─────────────────────────
    // Top card
    defineField({
      name: 'panel3OrangeBg',
      title: 'Top Card — Background Color',
      type: 'string',
      initialValue: '#e8632a',
      group: 'panel3',
    }),
    defineField({
      name: 'panel3Eyebrow',
      title: 'Top Card — Eyebrow (e.g. QUIÉNES SOMOS)',
      type: 'translationRecord',
      group: 'panel3',
    }),
    defineField({
      name: 'panel3IllustrationImage',
      title: 'Top Card — Illustration Image',
      type: 'image',
      description: 'Illustration shown in the center of the orange card. Falls back to the default illustration if empty.',
      group: 'panel3',
    }),
    defineField({
      name: 'panel4Quote',
      title: 'Top Card — Quote Text',
      type: 'translationRecord',
      group: 'panel3',
    }),
    defineField({
      name: 'panel4QuoteAuthor',
      title: 'Top Card — Quote Author',
      type: 'string',
      initialValue: '— Ana & Omar',
      group: 'panel3',
    }),
    // Bottom card
    defineField({
      name: 'panel3BottomTextColor',
      title: 'Bottom Card — Text & Button Color',
      type: 'string',
      initialValue: '#1a2e0f',
      description: 'Dark color used for headline, description text, and CTA button background.',
      group: 'panel3',
    }),
    defineField({
      name: 'panel3OrangeEyebrow',
      title: 'Bottom Card — Eyebrow (e.g. TÚ DECIDES)',
      type: 'translationRecord',
      group: 'panel3',
    }),
    defineField({
      name: 'panel3OrangeHeadline',
      title: 'Bottom Card — Headline',
      type: 'translationRecord',
      group: 'panel3',
    }),
    defineField({
      name: 'panel3Description',
      title: 'Bottom Card — Description Text',
      type: 'translationRecord',
      group: 'panel3',
    }),
    defineField({
      name: 'panel4CTAText',
      title: 'Bottom Card — CTA Button Text',
      type: 'translationRecord',
      group: 'panel3',
    }),
    defineField({
      name: 'panel4CTALink',
      title: 'Bottom Card — CTA Link (optional, leave empty to open subscription funnel)',
      type: 'string',
      description: 'Anchor or URL. Leave empty to open the subscription funnel.',
      group: 'panel3',
    }),
  ],
})
