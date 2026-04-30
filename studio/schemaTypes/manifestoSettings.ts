import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'manifestoSettings',
  title: 'Manifesto Section',
  type: 'document',
  groups: [
    { name: 'general', title: 'General' },
    { name: 'panel1', title: 'Panel 1 — Club CTA' },
    { name: 'panel2', title: 'Panel 2 — Lo que incluye' },
    { name: 'panel3', title: 'Panel 3 — Founders + Aspiracional' },
    { name: 'panel4', title: 'Panel 4 — Misión / Quote' },
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
      description: 'Toggle visibility of the 4-column poster section.',
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
      type: 'string',
      initialValue: 'EL CLUB · MEMBRESÍA',
      group: 'panel1',
    }),
    defineField({
      name: 'panel1TitleLine1',
      title: 'Title Line 1',
      type: 'string',
      initialValue: 'EL\nCLUB',
      description: 'Use line breaks (\\n) to split into multiple lines.',
      group: 'panel1',
    }),
    defineField({
      name: 'panel1TitleLine2',
      title: 'Title Line 2 (accent color)',
      type: 'string',
      initialValue: 'ONDO.',
      group: 'panel1',
    }),
    defineField({
      name: 'panel1Subheadline',
      title: 'Subheadline HTML',
      type: 'text',
      initialValue: 'Échate un clavado a la soupscripción de Ondo.',
      description: 'Subheadline text below the title.',
      group: 'panel1',
    }),
    defineField({
      name: 'panel1SubAccentWord',
      title: 'Accent Word in Subheadline',
      type: 'string',
      initialValue: 'soupscripción',
      description: 'This word in the subheadline will be highlighted with the accent color.',
      group: 'panel1',
    }),
    defineField({
      name: 'panel1Tagline',
      title: 'Tagline (italic)',
      type: 'text',
      initialValue: 'Para los que saben que una buena sopa cambia el día.',
      group: 'panel1',
    }),
    defineField({
      name: 'panel1CTAText',
      title: 'CTA Button Text',
      type: 'string',
      initialValue: 'ÚNETE AL CLUB',
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
      type: 'string',
      initialValue: 'LO QUE INCLUYE',
      group: 'panel2',
    }),
    defineField({
      name: 'panel2HeadlinePrimary',
      title: 'Headline (primary color)',
      type: 'string',
      initialValue: 'Todo lo que necesitas.',
      group: 'panel2',
    }),
    defineField({
      name: 'panel2HeadlineAccent',
      title: 'Headline (accent color)',
      type: 'string',
      initialValue: 'Nada que no.',
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
        preview: { select: { title: 'title' } },
        fields: [
          defineField({ name: 'title', title: 'Benefit Title', type: 'string' }),
          defineField({ name: 'subtitle', title: 'Benefit Subtitle', type: 'string' }),
        ],
      }],
    }),

    // ── PANEL 3 — Founders + Orange Aspirational ──────────────────────
    defineField({
      name: 'panel3TopBgColor',
      title: 'Top Card — Background Color',
      type: 'string',
      initialValue: '#2d4a1e',
      group: 'panel3',
    }),
    defineField({
      name: 'panel3Eyebrow',
      title: 'Top Card — Eyebrow Text',
      type: 'string',
      initialValue: 'QUIÉNES SOMOS',
      group: 'panel3',
    }),
    defineField({
      name: 'panel3FounderInitials',
      title: 'Founder Initials (comma separated)',
      type: 'string',
      initialValue: 'A,O',
      description: 'Comma separated initials. Each one becomes an avatar circle.',
      group: 'panel3',
    }),
    defineField({
      name: 'panel3FounderName',
      title: 'Founder Name(s)',
      type: 'string',
      initialValue: 'Ana & Omar',
      group: 'panel3',
    }),
    defineField({
      name: 'panel3FounderRole',
      title: 'Founder Role/Location',
      type: 'string',
      initialValue: 'Cofundadores · Ondo · Roma CDMX',
      group: 'panel3',
    }),
    defineField({
      name: 'panel3OrangeBg',
      title: 'Bottom Card — Background Color',
      type: 'string',
      initialValue: '#e8632a',
      group: 'panel3',
    }),
    defineField({
      name: 'panel3OrangeEyebrow',
      title: 'Bottom Card — Eyebrow Text',
      type: 'string',
      initialValue: 'TU MEMBRESÍA',
      group: 'panel3',
    }),
    defineField({
      name: 'panel3OrangeHeadline',
      title: 'Bottom Card — Headline',
      type: 'string',
      initialValue: 'Tú decides el cómo y el cuándo.',
      group: 'panel3',
    }),

    // ── PANEL 4 — Mission / Quote ─────────────────────────────────────
    defineField({
      name: 'panel4TextColor',
      title: 'Accent Color',
      type: 'string',
      initialValue: '#5b9538',
      group: 'panel4',
    }),
    defineField({
      name: 'panel4Eyebrow',
      title: 'Eyebrow Text',
      type: 'string',
      initialValue: 'NUESTRA MISIÓN',
      group: 'panel4',
    }),
    defineField({
      name: 'panel4Quote',
      title: 'Quote Text',
      type: 'text',
      initialValue: '"Hacemos estas sopas porque creemos que comer bien no debería ser complicado."',
      group: 'panel4',
    }),
    defineField({
      name: 'panel4QuoteAuthor',
      title: 'Quote Author',
      type: 'string',
      initialValue: '— Ana & Omar',
      group: 'panel4',
    }),
    defineField({
      name: 'panel4CTAText',
      title: 'CTA Button Text',
      type: 'string',
      initialValue: 'CONÓCENOS',
      group: 'panel4',
    }),
    defineField({
      name: 'panel4CTALink',
      title: 'CTA Button Link (optional)',
      type: 'string',
      initialValue: '#about',
      description: 'Anchor or URL for the CTA. Default: #about',
      group: 'panel4',
    }),
    defineField({
      name: 'panel4CityLeft',
      title: 'Bottom Left Label',
      type: 'translationRecord',
      group: 'panel4',
    }),
    defineField({
      name: 'panel4CityRight',
      title: 'Bottom Right Label',
      type: 'translationRecord',
      group: 'panel4',
    }),
  ],
})
