// Fotos de la home en webp ligeras (public/images/home/), recortadas al formato de cada sección.
// Se corre a mano si cambia una foto: `node scripts/build-home-images.mjs`. Los webp generados se suben al repo.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'public/images/home');
const QUALITY = 72;

// nombre → [origen, proporción ancho/alto, anchos, fondo (para fotos recortadas con transparencia)]
const IMAGES = {
  hero: ['public/images/cms/step3image.webp', 4 / 3, [640, 960, 1400]], // sopas servidas en tazones
  congelador: ['public/images/cms/heroimages-2.webp', 3 / 2, [640, 1000]],
  huerto: ['public/images/cms/step1image.webp', 4 / 3, [640, 1000]],
  especias: ['public/images/cms/step2image.webp', 4 / 3, [640, 1000]],
  fundadores: ['public/images/cms/panel3illustrationimage.webp', 3 / 2, [640, 1000], '#E8711F'],
};

fs.mkdirSync(OUT, { recursive: true });
for (const [name, [src, ratio, widths, background]] of Object.entries(IMAGES)) {
  for (const w of widths) {
    let img = sharp(path.join(ROOT, src)).rotate();
    if (background) img = img.flatten({ background });
    await img.resize(w, Math.round(w / ratio), { fit: 'cover', position: 'centre' })
      .webp({ quality: QUALITY })
      .toFile(path.join(OUT, `${name}-${w}.webp`));
  }
  console.log(name, widths.join('/'));
}
