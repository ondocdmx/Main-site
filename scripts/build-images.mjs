// Fotos de las sopas para la web: versiones cuadradas en webp (400/800/1200 px) + un manifiesto
// (src/content/productImages.json) con las rutas, que leen la tienda y la ficha.
//
// Fuente de cada foto, en este orden:
//   1. public/images/soups/<slug>-<foto>.jpg|jpeg|png|webp  (las que sube el dueño; ver README de esa carpeta)
//   2. la foto que ya tiene la sopa en products.json (platedImage, image, images[])
// <foto> = plated (sopa servida), pack (bolsa), ingredients (ingredientes).
//
// Corre solo antes de `npm run dev` y `npm run build` (también en Vercel). Solo rehace las fotos cuya fuente cambió.
import { readFile, writeFile, mkdir, readdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const UPLOADS = path.join(PUBLIC, 'images/soups');
const OUT_DIR = path.join(UPLOADS, 'web');
const MANIFEST = path.join(ROOT, 'src/content/productImages.json');
const CACHE = path.join(OUT_DIR, 'cache.json'); // huella de cada fuente: solo se rehace lo que cambió
const WIDTHS = [400, 800, 1200];
const QUALITY = 72;
const EXTS = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG'];

const products = JSON.parse(await readFile(path.join(ROOT, 'src/content/products.json'), 'utf8'));
const uploads = new Set(await readdir(UPLOADS).catch(() => []));
await mkdir(OUT_DIR, { recursive: true });
const cache = JSON.parse(await readFile(CACHE, 'utf8').catch(() => '{}'));
const exists = (file) => access(file).then(() => true, () => false);
const uploaded = (slug, role) => {
  for (const ext of EXTS) if (uploads.has(`${slug}-${role}.${ext}`)) return path.join(UPLOADS, `${slug}-${role}.${ext}`);
  return null;
};
const fromJson = (src) => (src ? path.join(PUBLIC, src.replace(/^\//, '')) : null);

// Devuelve { src, srcset, width, height, og? } o null si no hay fuente.
const build = async (source, name) => {
  if (!source || !(await exists(source))) return null;
  const data = await readFile(source);
  const hash = createHash('sha1').update(data).update(`${QUALITY}|${WIDTHS}`).digest('hex');
  const meta = await sharp(data).metadata();
  const side = Math.min(meta.width, meta.height);
  const widths = WIDTHS.filter(w => w <= side);
  if (widths.length === 0) widths.push(side);
  const files = [];
  for (const w of widths) {
    const file = `${name}-${w}.webp`;
    const out = path.join(OUT_DIR, file);
    if (cache[file] !== hash || !(await exists(out))) {
      await sharp(data).rotate().resize(w, w, { fit: 'cover', position: 'centre' }).webp({ quality: QUALITY }).toFile(out);
      cache[file] = hash;
    }
    files.push({ w, url: `/images/soups/web/${file}` });
  }
  const largest = files[files.length - 1];
  // Foto para compartir (og:image): JPG 1200×630, el formato que mejor leen WhatsApp y Facebook.
  let og;
  if (name.endsWith('-plated')) {
    const file = `${name}-og.jpg`;
    if (cache[file] !== hash || !(await exists(path.join(OUT_DIR, file)))) {
      await sharp(data).rotate().resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 78, mozjpeg: true }).toFile(path.join(OUT_DIR, file));
      cache[file] = hash;
    }
    og = `/images/soups/web/${file}`;
  }
  return {
    src: (files.find(f => f.w === 800) || largest).url,
    srcset: files.map(f => `${f.url} ${f.w}w`).join(', '),
    width: largest.w,
    height: largest.w,
    ...(og ? { og } : {}),
  };
};

const manifest = {};
for (const p of products) {
  const entry = {
    plated: await build(uploaded(p.slug, 'plated') || fromJson(p.platedImage || p.hoverImage || p.image), `${p.slug}-plated`),
    pack: await build(uploaded(p.slug, 'pack') || fromJson(p.image), `${p.slug}-pack`),
    ingredients: await build(uploaded(p.slug, 'ingredients'), `${p.slug}-ingredients`),
    gallery: [],
  };
  for (const [i, src] of (p.images || []).entries()) {
    const img = await build(fromJson(src), `${p.slug}-gallery-${i + 1}`);
    if (img) entry.gallery.push(img);
  }
  manifest[p.slug] = entry;
}

await writeFile(CACHE, JSON.stringify(cache, null, 2) + '\n');
const json = JSON.stringify(manifest, null, 2) + '\n';
if ((await readFile(MANIFEST, 'utf8').catch(() => '')) !== json) await writeFile(MANIFEST, json);
console.log(`Fotos listas: ${products.length} productos → public/images/soups/web/`);
