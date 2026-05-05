/**
 * Migration script: populate English translations for all settings documents.
 *
 * Usage:
 *   SANITY_TOKEN=<your-write-token> node scripts/migrate-i18n.mjs
 *
 * Get the token from sanity.io → project s3nnv28f → API → Tokens → Editor role.
 */

import { createClient } from '@sanity/client'

const TOKEN = process.env.SANITY_TOKEN
if (!TOKEN) {
  console.error('ERROR: Set SANITY_TOKEN env variable before running this script.')
  console.error('  SANITY_TOKEN=sk... node scripts/migrate-i18n.mjs')
  process.exit(1)
}

const client = createClient({
  projectId: 's3nnv28f',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-04-24',
  token: TOKEN,
})

function wrap(current, en) {
  if (!current || typeof current === 'object') return null
  return { _type: 'translationRecord', es: current, en }
}

async function migrateDoc(docId, fieldMap) {
  const doc = await client.fetch(`*[_id == $id][0]`, { id: docId })
  if (!doc) {
    console.log(`  ⚠  Document not found: ${docId} (open it in Sanity Studio to create it)`)
    return
  }
  const patch = {}
  for (const [field, enValue] of Object.entries(fieldMap)) {
    const current = doc[field]
    if (!current) {
      patch[field] = { es: enValue, en: enValue }
      console.log(`    + ${field}: not set → initialized`)
    } else if (typeof current === 'object') {
      console.log(`    — ${field}: already migrated, skipping`)
    } else {
      patch[field] = { es: current, en: enValue }
      console.log(`    ✓ ${field}: wrapped with en translation`)
    }
  }
  if (Object.keys(patch).length === 0) {
    console.log(`    (nothing to update)`)
    return
  }
  await client.patch(docId).set(patch).commit()
  console.log(`  ✅ Committed ${Object.keys(patch).length} fields\n`)
}

// ── TRANSLATIONS BASED ON ACTUAL SANITY CONTENT ──────────────────────────────

// processSettings — Spanish content currently in Sanity
const PROCESS_FIELDS = {
  stepsTitle: 'Our Process',           // current es: "OUR WHOLE PROCESS :)" (was English)
  step1Title: '1. From the field',     // current es: "1. Desde el huerto"
  step1Desc:  'We source organic, high-quality ingredients',
  step2Title: '2. Professional & creative preparation', // current: "2. Elaboración profesional y creativa"
  step2Desc:  'Our chefs create unique recipes inspired by international and local culinary traditions',
  step3Title: '3. Enjoy with confidence',  // current: "3. Disfruta con confianza"
  step3Desc:  'Thaw and enjoy delicious soups that nourish and restore',
}

// manifestoSettings — Spanish content currently in Sanity
const MANIFESTO_FIELDS = {
  panel1Eyebrow:       'THE ONDO CLUB',             // current: "El CLUB ONDO"
  panel1TitleLine1:    'The SOUPSCRIPTION',          // current: "La SOUPSCRIPCIÓN"
  panel1TitleLine2:    'ONDO',
  panel1Subheadline:   "Dive into Ondo's soupscription.",  // current: "Échate un clavado a la soupscripción de Ondo."
  panel1SubAccentWord: 'soupscription',              // current: "SOUPSCRIPCIÓN"
  panel1Tagline:       'The best, always in your fridge.', // current: "De lo mejor, siempre en tu refri."
  panel1CTAText:       'SUBSCRIBE!',                // current: "¡SOUPSCRÍBEME!"
  panel2Eyebrow:       "WHAT IT'S ABOUT",           // current: "DE LO QUE SE TRATA"
  panel2HeadlinePrimary: 'The benefits.',            // current: "Los beneficios."
  panel2HeadlineAccent: 'Beyond delicious.',         // current: "Mas allá de lo delicioso."
  panel3Eyebrow:       'WHO WE ARE',                // current: "QUIÉNES SOMOS"
  panel3FounderRole:   'Co-founders · Ondo',        // current: "Cofundadores · Ondo"
  panel3OrangeEyebrow: 'YOU DECIDE',                // current: "TU DECIDES"
  panel3OrangeHeadline:'WHENEVER YOU WANT IT MOST.',// current: "CUANDO TU LO QUIERAS MAS."
  panel4Eyebrow:       'OUR MISSION',               // current: "NUESTRA MISIÓN"
  panel4Quote:         '"We make these soups because we believe eating well shouldn\'t be complicated."',
  panel4CTAText:       'LEARN MORE',                // current: "CONÓCENOS"
}

// siteSettings, productSettings, aboutSettings — not yet in Sanity (will be set to defaults)
const SITE_FIELDS = {
  bannerText:    'APAPÁCHATE | FREE SHIPPING 12+ CARTONS',
  midBannerText: 'Get a free gift with your first order using code: ONDOFIRST!',
  navShop:       'SHOP',
  navSubs:       'SUBSCRIPTION',
  navSteps:      'HOW IT WORKS',
  navAbout:      'ABOUT',
  emptyCart:     'Your cart is empty',
  subtotal:      'Subtotal',
  checkout:      'Go to checkout',
}

const PRODUCT_FIELDS = {
  filtersTitle:     'Filters',
  filterBundle:     'Vegetarian',
  filterNew:        'Cold',
  filterBestseller: 'Hot',
  filterVegan:      'Vegan',
  sortBy:           'Sort by',
  subscribeTab:     'Subscription',
  singleTab:        'Single Purchase',
}

const ABOUT_FIELDS = {
  aboutTitle:  'Nutrition for a\nrushed world.',
  aboutHeader: 'ABOUT',
  aboutSub:    'Ondo is a soup-first brand in Mexico City, creating soulful, seasonal soups that blend tradition and innovation. Our Mission is to nourish body and community with depth — in flavor, sourcing, and experience.',
  aboutLink:   'LEARN MORE',
  aboutCTA:    '¡APAPÁCHATE!',
}

// English translations for benefits based on actual Sanity data
const MIGRATED_BENEFITS = [
  { _key: 'b1', _type: 'benefitItem', es: 'Increíbles descuentos',  en: 'Incredible discounts',    subtitleEs: 'Obtén hasta 50% en pedidos',             subtitleEn: 'Get up to 50% off on orders' },
  { _key: 'b2', _type: 'benefitItem', es: 'Beta taster',             en: 'Beta taster',              subtitleEs: 'Prueba recetas nuevas en producción',    subtitleEn: 'Try new recipes in development' },
  { _key: 'b3', _type: 'benefitItem', es: "Soup founders' club",     en: "Soup founders' club",      subtitleEs: 'Apoya y dale forma a Ondo',              subtitleEn: 'Support and shape Ondo' },
  { _key: 'b4', _type: 'benefitItem', es: 'Entrega gratis',          en: 'Free delivery',            subtitleEs: 'La entrega va por nuestra cuenta',       subtitleEn: 'Delivery is on us' },
  { _key: '8d7acc652f44', _type: 'benefitItem', es: 'Club member perks', en: 'Club member perks',   subtitleEs: 'Swag, perks y cositas ricas',            subtitleEn: 'Swag, perks and tasty treats' },
]

// ── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌊 ONDO i18n Migration — populating English translations\n')

  console.log('📄 processSettings (exists in Sanity)')
  await migrateDoc('processSettings', PROCESS_FIELDS)

  console.log('📄 manifestoSettings (exists in Sanity)')
  await migrateDoc('manifestoSettings', MANIFESTO_FIELDS)

  // Migrate benefits array with bilingual structure
  console.log('  ↳ Migrating panel2Benefits array...')
  const manifesto = await client.fetch(`*[_id == "manifestoSettings"][0]{ panel2Benefits }`)
  if (manifesto?.panel2Benefits?.length && typeof manifesto.panel2Benefits[0].title === 'string') {
    await client.patch('manifestoSettings').set({ panel2Benefits: MIGRATED_BENEFITS }).commit()
    console.log('  ✅ panel2Benefits migrated to bilingual format\n')
  } else {
    console.log('  — panel2Benefits already in new format or empty, skipping\n')
  }

  console.log('📄 siteSettings (not yet in Sanity — will be set with defaults)')
  // For docs that don't exist, we create them with the default bilingual values
  const siteDoc = await client.fetch(`*[_id == "siteSettings"][0]`)
  if (!siteDoc) {
    const patch = {}
    for (const [k, en] of Object.entries(SITE_FIELDS)) {
      patch[k] = { es: k === 'bannerText' ? 'APAPÁCHATE | ENVÍO GRATIS EN 12+ CARTONES'
                     : k === 'midBannerText' ? '¡Aprovecha un regalo con tu primer pedido usando código: ONDOFIRST!'
                     : k === 'navShop' ? 'TIENDA'
                     : k === 'navSubs' ? 'SUSCRIPCIÓN'
                     : k === 'navSteps' ? 'CÓMO FUNCIONA'
                     : k === 'navAbout' ? 'NOSOTROS'
                     : k === 'emptyCart' ? 'Tu carrito está vacío'
                     : k === 'subtotal' ? 'Subtotal'
                     : 'Ir a pagar', en }
    }
    await client.createIfNotExists({ _id: 'siteSettings', _type: 'siteSettings' })
    await client.patch('siteSettings').set(patch).commit()
    console.log('  ✅ siteSettings created with bilingual defaults\n')
  } else {
    await migrateDoc('siteSettings', SITE_FIELDS)
  }

  console.log('📄 productSettings (not yet in Sanity — will be set with defaults)')
  const prodDoc = await client.fetch(`*[_id == "productSettings"][0]`)
  if (!prodDoc) {
    const patch = {}
    for (const [k, en] of Object.entries(PRODUCT_FIELDS)) {
      const esMap = { filtersTitle: 'Filtros', filterBundle: 'Vegetariano', filterNew: 'Frío', filterBestseller: 'Caliente', filterVegan: 'Vegano', sortBy: 'Ordenar por', subscribeTab: 'Suscripción', singleTab: 'Una sola compra' }
      patch[k] = { es: esMap[k], en }
    }
    await client.createIfNotExists({ _id: 'productSettings', _type: 'productSettings' })
    await client.patch('productSettings').set(patch).commit()
    console.log('  ✅ productSettings created with bilingual defaults\n')
  } else {
    await migrateDoc('productSettings', PRODUCT_FIELDS)
  }

  console.log('📄 aboutSettings (not yet in Sanity — will be set with defaults)')
  const aboutDoc = await client.fetch(`*[_id == "aboutSettings"][0]`)
  if (!aboutDoc) {
    const esMap = {
      aboutTitle: 'Nutrición para un\nmundo acelerado.',
      aboutHeader: 'ABOUT',
      aboutSub: 'Ondo es una marca soup-first en Ciudad de México, creando sopas con alma, de temporada, que mezclan tradición e innovación. Nuestra misión es nutrir cuerpo y comunidad con profundidad — en sabor, origen y experiencia.',
      aboutLink: 'LEARN MORE',
      aboutCTA: '¡APAPÁCHATE!',
    }
    const patch = {}
    for (const [k, en] of Object.entries(ABOUT_FIELDS)) {
      patch[k] = { es: esMap[k], en }
    }
    await client.createIfNotExists({ _id: 'aboutSettings', _type: 'aboutSettings' })
    await client.patch('aboutSettings').set(patch).commit()
    console.log('  ✅ aboutSettings created with bilingual defaults\n')
  } else {
    await migrateDoc('aboutSettings', ABOUT_FIELDS)
  }

  console.log('✅ Migration complete!\n')
  console.log('Next steps:')
  console.log('  1. Open Sanity Studio and review/adjust the English text')
  console.log('  2. For docs just created, update the Spanish (es) fields with your real content\n')
}

main().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
