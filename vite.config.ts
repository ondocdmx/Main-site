import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import {applyMetaToHtml, productMeta} from './src/seo';

// Escribe dist/sopas/<slug>/index.html con el título, la descripción y la foto de cada sopa:
// WhatsApp, Facebook y compañía no ejecutan JavaScript, así que necesitan estas etiquetas en el HTML.
function productPages(): Plugin {
  return {
    name: 'ondo-product-pages',
    apply: 'build',
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist');
      const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
      const products = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'src/content/products.json'), 'utf8'));
      const images = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'src/content/productImages.json'), 'utf8'));
      for (const p of products) {
        const dir = path.join(dist, 'sopas', p.slug);
        fs.mkdirSync(dir, {recursive: true});
        fs.writeFileSync(path.join(dir, 'index.html'), applyMetaToHtml(html, productMeta(p, images[p.slug]?.plated?.og || images[p.slug]?.plated?.src)));
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), productPages()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  };
});
