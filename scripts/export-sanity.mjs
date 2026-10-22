#!/usr/bin/env node
// Exportación única del contenido de Sanity (proyecto s3nnv28f, dataset production) al repo.
// Lee el dataset público sin token, con las mismas queries que usaba fetchData() en src/App.tsx.
//
//   node scripts/export-sanity.mjs [--leads <ruta.csv>]
//
// Escribe src/content/{settings,products,tags,deliveryZones}.json y descarga las imágenes
// usadas a public/images/cms/*.webp (800 o 1600 px, ver FULL_WIDTH_SETTINGS) (reemplaza cada objeto de imagen por su ruta en texto).
// Con --leads exporta los deliveryLead a un CSV. Los leads son datos personales: la ruta
// debe estar FUERA del repo (es público); el script se niega a escribirlos dentro.
//
// Tras la migración Sanity deja de existir: este script queda solo como referencia.

import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://s3nnv28f.api.sanity.io/v2024-04-24/data/query/production';
const CDN = 'https://cdn.sanity.io/images/s3nnv28f/production';
const CONTENT_DIR = path.join(ROOT, 'src/content');
const IMG_DIR = path.join(ROOT, 'public/images/cms');
const IMG_PUBLIC = '/images/cms';

// Copiada tal cual de src/App.tsx (antes de la migración)
const PRODUCTS_QUERY = `*[_type == "product"] | order(order asc) {
  _id,
  "slug": slug.current,
  title,
  purchaseType,
  price,
  ingredients,
  // Tolerancia histórica: el campo del schema llegó a llamarse stripeProductId.
  // Se acepta cualquiera de los dos; coalesce evita "precio no configurado".
  "stripePriceId": coalesce(stripePriceId, stripeProductId),
  onlySubscriptions,
  excludeFromFunnel,
  soldOut,
  description,
  tagline,
  bgColor,
  image,
  hoverImage,
  images,
  "tags": tags[]->{ _id, name, slug, icon, color }
}`;

// Mismo orden de spread que fetchData()
const SETTINGS_IDS = [
  'siteSettings', 'productSettings', 'processSettings', 'manifestoSettings', 'popupSettings',
  'heroSettings', 'aboutSettings', 'funnelSettings', 'footerSettings',
];

export async function query(groq) {
  const res = await fetch(`${API}?query=${encodeURIComponent(groq)}`);
  if (!res.ok) throw new Error(`Sanity ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.error) throw new Error(JSON.stringify(json.error));
  return json.result;
}

// Campos internos de Sanity que no se guardan en los JSON
const INTERNAL = new Set(['_rev', '_createdAt', '_updatedAt', '_system', '_key']);

const isImage = (v) => v && typeof v === 'object' && v.asset && typeof v.asset._ref === 'string';

const slugify = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'img';

// Ancho de exportación = el que servía la web con Sanity: estos ajustes iban a tamaño completo
// (urlFor().url()) -> 1600 px; el resto pasaba por resolveImage (urlFor().width(800)) -> 800 px.
const FULL_WIDTH_SETTINGS = new Set(['heroImages', 'step1Image', 'step2Image', 'step3Image', 'panel3IllustrationImage', 'footerLogo']);

// image-abc123-1200x800-jpg -> URL del CDN con el mismo recorte (crop) que aplicaba @sanity/image-url
function cdnUrl(img, width) {
  const [, id, dims, ext] = img.asset._ref.split('-');
  const [w, h] = dims.split('x').map(Number);
  const params = new URLSearchParams({ w: String(width), fm: 'webp', q: '80' });
  const c = img.crop;
  if (c && (c.left || c.right || c.top || c.bottom)) {
    const left = Math.round(c.left * w), top = Math.round(c.top * h);
    const cw = Math.round(w - c.right * w - left), ch = Math.round(h - c.bottom * h - top);
    params.set('rect', `${left},${top},${cw},${ch}`);
  }
  return `${CDN}/${id}-${dims}.${ext}?${params}`;
}

const downloaded = new Map(); // clave (asset+crop) -> ruta pública
const usedNames = new Set();

async function saveImage(img, name, width) {
  const url = cdnUrl(img, width);
  if (downloaded.has(url)) return downloaded.get(url);
  let base = slugify(name), file = `${base}.webp`, n = 2;
  while (usedNames.has(file)) file = `${base}-${n++}.webp`;
  usedNames.add(file);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Imagen ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(path.join(IMG_DIR, file), buf);
  const publicPath = `${IMG_PUBLIC}/${file}`;
  downloaded.set(url, publicPath);
  console.log(`  ${publicPath}  (${Math.round(buf.length / 1024)} KB)`);
  return publicPath;
}

// Recorre el valor: imágenes -> ruta local, quita campos internos (y _type salvo en raíz de producto)
async function transform(value, name, { keepId = false, width = 800 } = {}) {
  if (Array.isArray(value)) {
    const out = [];
    for (let i = 0; i < value.length; i++) out.push(await transform(value[i], `${name}-${i + 1}`, { keepId: true, width }));
    return out;
  }
  if (isImage(value)) return saveImage(value, name, width);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (INTERNAL.has(k) || k === '_type' || (k === '_id' && !keepId)) continue;
      out[k] = await transform(v, `${name}-${k}`, { keepId: true, width });
    }
    return out;
  }
  return value;
}

const toJson = (v) => JSON.stringify(v, null, 2) + '\n';

async function exportContent() {
  await rm(IMG_DIR, { recursive: true, force: true });
  await mkdir(IMG_DIR, { recursive: true });
  await mkdir(CONTENT_DIR, { recursive: true });

  const docs = await Promise.all(SETTINGS_IDS.map((id) => query(`*[_id == "${id}"][0]`)));
  const [tags, zones, products] = await Promise.all([
    query('*[_type == "productTag"] | order(order asc)'),
    query('*[_type == "deliveryZones"][0]'),
    query(PRODUCTS_QUERY),
  ]);

  console.log('Imágenes de ajustes:');
  const merged = Object.assign({}, ...docs.map((d) => d || {}));
  const settings = {};
  for (const [k, v] of Object.entries(merged)) {
    if (INTERNAL.has(k) || k === '_type' || k === '_id') continue;
    settings[k] = await transform(v, k, { width: FULL_WIDTH_SETTINGS.has(k) ? 1600 : 800 });
  }

  console.log('Imágenes de productos:');
  const outProducts = [];
  for (const p of products) {
    const { _id, ...rest } = p;
    outProducts.push({ _id, ...(await transform(rest, p.slug || _id)) });
  }

  // Los tags conservan _id (se usan como key en el filtro)
  const outTags = [];
  for (const t of tags) {
    const { _id, ...rest } = t;
    outTags.push({ _id, ...(await transform(rest, `tag-${t.slug?.current || _id}`)) });
  }
  const outZones = zones ? await transform(zones, 'zones') : null;

  await writeFile(path.join(CONTENT_DIR, 'settings.json'), toJson(settings));
  await writeFile(path.join(CONTENT_DIR, 'products.json'), toJson(outProducts));
  await writeFile(path.join(CONTENT_DIR, 'tags.json'), toJson(outTags));
  await writeFile(path.join(CONTENT_DIR, 'deliveryZones.json'), toJson(outZones));
  console.log(`\nOK: ${Object.keys(settings).length} ajustes, ${outProducts.length} productos, ${outTags.length} tags, ${downloaded.size} imágenes`);
}

async function exportLeads(csvPath) {
  const abs = path.resolve(csvPath);
  if (abs.startsWith(ROOT + path.sep)) throw new Error('Los leads son datos personales: escribe el CSV FUERA del repo.');
  const leads = await query('*[_type == "deliveryLead"] | order(createdAt asc) { createdAt, postalCode, address, isServiceable, email }');
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [['createdAt', 'postalCode', 'address', 'isServiceable', 'email'].join(',')]
    .concat(leads.map((l) => [l.createdAt, l.postalCode, l.address, l.isServiceable, l.email].map(cell).join(',')));
  await writeFile(abs, rows.join('\n') + '\n');
  console.log(`Leads: ${leads.length} -> ${abs}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const i = process.argv.indexOf('--leads');
  if (i > -1) await exportLeads(process.argv[i + 1]);
  else await exportContent();
}
