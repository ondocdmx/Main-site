import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const TOKEN = process.env.SANITY_TOKEN || 'skW1NVMws1VEzE6fwzJANvcseU7geHWmJNE5NVUxneq7tHkKbYAlKmATtk85RPMre7QCPjTrANW8DNTiSwEarQ9tKM9kZDhX1ewviHNrKhJxKXNY6jW9TPPWyD4Ly58RUUoRsBmqUBRe3nD2w6vaQE582C56OjwRcBLCs3hHIsjQyYpZRQ9x'

const client = createClient({
  projectId: 's3nnv28f',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-04-24',
  token: TOKEN,
})

const IMAGES_DIR = path.join(__dirname, 'public', 'images')

// ── Helpers ──────────────────────────────────────────────────────────────────

const imageCache = {}

async function uploadImage(filename) {
  if (imageCache[filename]) return imageCache[filename]
  const fullPath = path.join(IMAGES_DIR, filename)
  if (!fs.existsSync(fullPath)) {
    console.warn(`  ⚠️  Image not found: ${fullPath}`)
    return null
  }
  const stream = fs.createReadStream(fullPath)
  console.log(`  ⬆️  Uploading ${filename}...`)
  const asset = await client.assets.upload('image', stream, { filename })
  console.log(`  ✅ Uploaded ${filename} → ${asset._id}`)
  const ref = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
  imageCache[filename] = ref
  return ref
}

async function upsertSingleton(doc) {
  const existing = await client.fetch(`*[_type == $type][0]._id`, { type: doc._type })
  if (existing) {
    console.log(`  ✔️  ${doc._type} ya existe — actualizando...`)
    const { _type, ...rest } = doc
    await client.patch(existing).set(rest).commit()
    console.log(`  ✅ ${doc._type} actualizado`)
  } else {
    await client.create(doc)
    console.log(`  ✅ ${doc._type} creado`)
  }
}

// ── Tags ─────────────────────────────────────────────────────────────────────

const TAGS_DATA = [
  { name: { es: 'Vegetariano', en: 'Vegetarian' }, slug: { _type: 'slug', current: 'vegetariano' }, icon: '🥦', color: 'bg-ondo-green', order: 1 },
  { name: { es: 'Caliente', en: 'Hot' },           slug: { _type: 'slug', current: 'caliente' },    icon: '🔥', color: 'bg-red-500',        order: 2 },
  { name: { es: 'Frío', en: 'Cold' },              slug: { _type: 'slug', current: 'frio' },        icon: '❄️', color: 'bg-sky-400',        order: 3 },
  { name: { es: 'Vegano', en: 'Vegan' },           slug: { _type: 'slug', current: 'vegano' },      icon: '🌿', color: 'bg-ondo-light-green', order: 4 },
]

async function createTags() {
  console.log('\n📌 Tags...')
  const tagIds = {}
  for (const tag of TAGS_DATA) {
    const existing = await client.fetch(
      `*[_type == "productTag" && slug.current == $slug][0]._id`,
      { slug: tag.slug.current }
    )
    if (existing) {
      console.log(`  ✔️  Tag "${tag.name.es}" ya existe`)
      tagIds[tag.slug.current] = existing
    } else {
      const created = await client.create({ _type: 'productTag', ...tag })
      console.log(`  ✅ Tag "${tag.name.es}" creado`)
      tagIds[tag.slug.current] = created._id
    }
  }
  return tagIds
}

// ── Products ─────────────────────────────────────────────────────────────────

function buildProductsData(tagIds) {
  return [
    {
      title: { es: 'Crema de Elote', en: 'Corn Cream Soup' },
      purchaseType: 'subscription',
      price: 89,
      tagline: { es: 'Dulce y ahumado, como debe ser.', en: 'Sweet and smoky, as it should be.' },
      description: { es: 'Crema suave de elote asado con un toque de chile poblano y crema mexicana. Reconfortante y lista en 5 minutos.', en: 'Smooth roasted corn cream with poblano chile and Mexican crema. Comforting and ready in 5 minutes.' },
      bgColor: 'bg-amber-50', imageFile: 'ondo-113.JPG', hoverImageFile: 'ondo-051.JPG', tagSlugs: ['vegetariano'], order: 1,
    },
    {
      title: { es: 'Pozole Rojo', en: 'Red Pozole' },
      purchaseType: 'subscription',
      price: 115,
      tagline: { es: 'La fiesta en tu mesa.', en: 'The party at your table.' },
      description: { es: 'Caldo rojo intenso con maíz cacahuazintle, chile guajillo y todo el sabor de la tradición mexicana.', en: 'Intense red broth with hominy corn, guajillo chile and all the flavor of Mexican tradition.' },
      bgColor: 'bg-red-50', imageFile: 'ondo-070.JPG', hoverImageFile: 'ondo-113.JPG', tagSlugs: ['caliente'], order: 2,
    },
    {
      title: { es: 'Sopa de Lima Yucateca', en: 'Yucatan Lime Soup' },
      purchaseType: 'subscription',
      price: 99,
      tagline: { es: 'El sur en cada sorbo.', en: 'The south in every sip.' },
      description: { es: 'Caldo ligero con pollo deshebrado, chile xcatic, lima yucateca y tortilla crujiente.', en: 'Light broth with shredded chicken, xcatic chile, Yucatan lime and crispy tortilla.' },
      bgColor: 'bg-lime-50', imageFile: 'ondo-051.JPG', hoverImageFile: 'ondo-070.JPG', tagSlugs: ['caliente'], order: 3,
    },
    {
      title: { es: 'Gazpacho Verde', en: 'Green Gazpacho' },
      purchaseType: 'single',
      price: 79,
      tagline: { es: 'Frío y lleno de vida.', en: 'Cold and full of life.' },
      description: { es: 'Pepino, aguacate, espinaca y limón batidos en frío. Perfecto para el verano.', en: 'Cucumber, avocado, spinach and lemon blended cold. Perfect for summer.' },
      bgColor: 'bg-green-50', imageFile: 'green-soup.png', hoverImageFile: 'green-soup.png', tagSlugs: ['vegano', 'frio'], order: 4,
    },
    {
      title: { es: 'Caldo Tlalpeño', en: 'Tlalpeño Broth' },
      purchaseType: 'single',
      price: 105,
      tagline: { es: 'Humo, garbanzo y corazón.', en: 'Smoke, chickpea and heart.' },
      description: { es: 'Caldo de pollo ahumado con garbanzos, chile chipotle, epazote y ejotes. Un clásico chilango con alma.', en: 'Smoked chicken broth with chickpeas, chipotle chile and green beans. A soulful classic.' },
      bgColor: 'bg-orange-50', imageFile: 'ondo-070.JPG', hoverImageFile: 'ondo-113.JPG', tagSlugs: ['caliente'], order: 5,
    },
    {
      title: { es: 'Vichyssoise de Huitlacoche', en: 'Huitlacoche Vichyssoise' },
      purchaseType: 'single',
      price: 125,
      tagline: { es: 'Lujo mexicano frío.', en: 'Cold Mexican luxury.' },
      description: { es: 'Crema fría de papa y poro realzada con el intenso sabor terroso del huitlacoche.', en: 'Cold cream of potato and leek elevated with the intense earthy flavor of huitlacoche.' },
      bgColor: 'bg-stone-100', imageFile: 'ondo-051.JPG', hoverImageFile: 'green-soup.png', tagSlugs: ['vegano', 'frio'], order: 6,
    },
  ].map(p => ({ ...p, tagRefs: p.tagSlugs.map(s => ({ _type: 'reference', _ref: tagIds[s], _key: s })) }))
}

async function createProducts(tagIds) {
  console.log('\n🥣 Productos...')
  const uniqueImages = [...new Set(buildProductsData(tagIds).flatMap(p => [p.imageFile, p.hoverImageFile]))]
  for (const file of uniqueImages) await uploadImage(file)

  for (const product of buildProductsData(tagIds)) {
    const existing = await client.fetch(`*[_type == "product" && title.es == $title][0]._id`, { title: product.title.es })
    if (existing) {
      console.log(`  ✔️  Producto "${product.title.es}" ya existe`)
      continue
    }
    await client.create({
      _type: 'product',
      title: product.title,
      purchaseType: product.purchaseType,
      price: product.price,
      tagline: product.tagline,
      description: product.description,
      bgColor: product.bgColor,
      image: imageCache[product.imageFile],
      hoverImage: imageCache[product.hoverImageFile],
      tags: product.tagRefs,
      order: product.order,
    })
    console.log(`  ✅ Producto "${product.title.es}" creado`)
  }
}

// ── Settings Documents ────────────────────────────────────────────────────────

async function createAllSettings() {
  console.log('\n⚙️  Settings...')

  // siteSettings — plain strings used directly by getSetting()
  await upsertSingleton({
    _type: 'siteSettings',
    bannerText: 'APAPÁCHATE | ENVÍO GRATIS EN 12+ CARTONES',
    midBannerText: '¡Aprovecha un regalo con tu primer pedido usando código: ONDOFIRST!',
    navShop: 'TIENDA',
    navSubs: 'SUSCRIPCIÓN',
    navSteps: 'CÓMO FUNCIONA',
    navAbout: 'NOSOTROS',
    emptyCart: 'Tu carrito está vacío',
    subtotal: 'Subtotal',
    checkout: 'Ir a pagar',
  })

  // heroSettings — translationRecord fields
  await upsertSingleton({
    _type: 'heroSettings',
    showHero: true,
    heroTitle: { es: 'FIRST WE SOUP', en: 'FIRST WE SOUP' },
    heroSub: {
      es: 'Nuestra misión es nutrir cuerpo y comunidad con profundidad — en sabor, origen y experiencia.',
      en: 'Our Mission is to nourish body and community with depth — in flavor, sourcing, and experience.',
    },
    heroCTA: { es: '¡APAPÁCHATE!', en: '¡APAPÁCHATE!' },
  })

  // productSettings — mix of strings and translationRecord
  await upsertSingleton({
    _type: 'productSettings',
    showProducts: true,
    globalSubscriptionDiscount: 20,
    filtersTitle: 'Filtros',
    filterBundle: 'Vegetariano',
    filterNew: 'Frío',
    filterBestseller: 'Caliente',
    filterVegan: 'Vegano',
    sortBy: 'Ordenar por',
    subscribeTab: 'Suscripción',
    singleTab: 'Una sola compra',
    clubBannerTitle: {
      es: 'Únete al club y obtén un 20% descuento',
      en: 'Join the club and get 20% off',
    },
    clubBannerCTA: { es: '¡LO QUIERO!', en: 'I WANT IT!' },
  })

  // processSettings — plain strings (ES only; EN falls back to t object)
  await upsertSingleton({
    _type: 'processSettings',
    showSteps: true,
    stepsTitle: 'La cena es así de fácil',
    step1Title: '1. Elige tus sopas',
    step1Desc: 'Navega y elige de nuestras recetas curadas desde nuestra tienda.',
    step2Title: '2. Recibe fresco',
    step2Desc: 'Ingredientes frescos entregados en la puerta de tu casa.',
    step3Title: '3. Disfruta con confianza',
    step3Desc: 'Sigue simples instrucciones y disfruta deliciosos platillos caseros sin estrés.',
  })

  // aboutSettings — plain strings
  await upsertSingleton({
    _type: 'aboutSettings',
    aboutTitle: 'Nutrición para un\nmundo acelerado.',
    aboutHeader: 'ABOUT',
    aboutSub: 'In soup we trust. Nuestra misión es nutrir cuerpo y comunidad con profundidad — en sabor, origen y experiencia.',
    aboutLink: 'LEARN MORE',
    aboutCTA: '¡APAPÁCHATE!',
  })

  // manifestoSettings — translationRecord + colors + images
  const panel2Img = await uploadImage('ondo-113.JPG')
  const panel3Img = await uploadImage('green-geo.png')

  await upsertSingleton({
    _type: 'manifestoSettings',
    showManifesto: true,
    panel1BgColor: '#6ca53a',
    panel1TextColor1: '#f1f3b0',
    panel1TextColor2: '#bfe46b',
    panel1TitleTop: { es: 'SOUP\nSOUP', en: 'SOUP\nSOUP' },
    panel1City: { es: 'el club', en: 'the club' },
    panel1TitleBottom: { es: 'FIRST', en: 'FIRST' },
    panel2Image: panel2Img,
    panel2Color: '#6ca53a',
    panel2Title: { es: 'ÚNETE AL CLUB', en: 'JOIN THE CLUB' },
    panel2Mission: {
      es: 'Sopas artesanales de temporada, en tu puerta cada semana. Suscríbete y ahorra 20% de por vida.',
      en: 'Seasonal artisan soups at your door every week. Subscribe and save 20% for life.',
    },
    panel2CTA: { es: '¡QUIERO UNIRME!', en: 'I WANT TO JOIN!' },
    panel3Title: { es: '20% OFF.\nPARA SIEMPRE.', en: '20% OFF.\nFOREVER.' },
    panel3Text: {
      es: 'Los socios del Club Ondo reciben sopas artesanales de temporada cada semana con 20% de descuento permanente, envío incluido y acceso anticipado a recetas exclusivas.\n\nMás de 500 personas ya se apapachan. ¿Te unes?',
      en: 'Ondo Club members receive seasonal artisan soups every week with a permanent 20% discount, free shipping included, and early access to exclusive recipes.\n\nMore than 500 people are already on board. Will you join?',
    },
    panel3CTA: { es: 'ÚNETE AHORA', en: 'JOIN NOW' },
    panel3Image: panel3Img,
    panel4TextColor: '#5b9538',
    panel4TextTop: {
      es: 'Sin contratos largos. Sin compromiso. Cancela cuando quieras.\n\nPero una vez que lo pruebes, ya no vas a querer parar.',
      en: 'No long contracts. No commitment. Cancel whenever you want.\n\nBut once you try it, you won\'t want to stop.',
    },
    panel4CityLeft: { es: 'SOUP FIRST', en: 'SOUP FIRST' },
    panel4CityRight: { es: 'CDMX', en: 'CDMX' },
    panel4Title: { es: 'IN SOUP WE TRUST', en: 'IN SOUP WE TRUST' },
  })

  // popupSettings
  await upsertSingleton({
    _type: 'popupSettings',
    enabled: true,
    buttonText: { es: '¡Suscríbete!', en: 'Subscribe!' },
    popupTitle: { es: '¿Cada cuánto te apapachamos?', en: 'How often should we pamper you?' },
    popupMessage: { es: 'Selecciona tu frecuencia preferida para ahorrar un 20%.', en: 'Select your preferred frequency to save 20%.' },
    popupCTA: { es: 'RECIBIR MI 20%', en: 'GET MY 20% OFF' },
  })
}

// ── Run ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Migración completa a Sanity...')
  console.log('   Proyecto: s3nnv28f | Dataset: production\n')

  try {
    const tagIds = await createTags()
    await createProducts(tagIds)
    await createAllSettings()
    console.log('\n🎉 Migración completada exitosamente!')
  } catch (err) {
    console.error('\n❌ Error:', err.message)
    process.exit(1)
  }
}

main()
