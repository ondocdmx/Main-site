// Título y descripción de cada ficha (/sopas/<slug>) para buscadores y para compartir.
// Lo usan la ficha (en el navegador) y el build (vite.config.ts escribe dist/sopas/<slug>/index.html,
// porque WhatsApp y Facebook no ejecutan JavaScript). Puro: sin DOM.

export const SITE_URL = 'https://www.ondoclub.com';

export type PageMeta = { title: string; description: string; url: string; image: string; type?: 'product' | 'website' };

const text = (v: any, lang: 'es' | 'en') => (typeof v === 'string' ? v : v?.[lang] || v?.es || '').trim();
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const hasPlaceholder = (s: string) => /\[[^\]]*\]/.test(s);

function clip(s: string, max: number): string {
  const clean = s.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, clean.lastIndexOf(' ', max - 1)).replace(/[,.;:·—-]+$/, '') + '…';
}

export function productMeta(product: any, imageSrc: string | undefined, lang: 'es' | 'en' = 'es'): PageMeta {
  const name = capitalize(text(product.title, lang));
  const descriptor = text(product.descriptor, lang);
  const parts = [
    text(product.tagline, lang).replace(/\.$/, ''),
    hasPlaceholder(descriptor) ? '' : capitalize(descriptor),
    text(product.description, lang),
  ].filter(Boolean);
  return {
    title: lang === 'es' ? `${name} · Sopas Ondo a domicilio en CDMX` : `${name} · Ondo soups delivered in Mexico City`,
    description: clip(parts.join('. '), 160),
    url: `${SITE_URL}/sopas/${encodeURIComponent(product.slug)}`,
    image: imageSrc ? `${SITE_URL}${imageSrc}` : `${SITE_URL}/images/ondo-logo-orange.png`,
  };
}

// /tienda: el catálogo completo con filtros.
export function shopMeta(lang: 'es' | 'en' = 'es'): PageMeta {
  return {
    title: lang === 'es' ? 'Tienda · Sopas Ondo a domicilio en CDMX' : 'Shop · Ondo soups delivered in Mexico City',
    description: lang === 'es'
      ? 'Todas las sopas Ondo: veganas, vegetarianas y con proteína animal. Sopas de temporada congeladas, hechas en CDMX y entregadas a domicilio.'
      : 'Every Ondo soup: vegan, vegetarian and with animal protein. Seasonal frozen soups, made in Mexico City and delivered to your door.',
    url: `${SITE_URL}/tienda`,
    image: `${SITE_URL}/images/home/hero-1400.webp`,
    type: 'website',
  };
}

const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Reemplaza en el index.html del build las etiquetas de la home por las de la ficha.
export function applyMetaToHtml(html: string, meta: PageMeta): string {
  const t = escapeAttr(meta.title), d = escapeAttr(meta.description);
  const set = (attr: 'name' | 'property', key: string, value: string) => {
    const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
    html = re.test(html) ? html.replace(re, `$1${value}$2`) : html.replace('</head>', `  <meta ${attr}="${key}" content="${value}" />\n  </head>`);
  };
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`);
  // La foto del hero solo se precarga en la home.
  html = html.replace(/\s*<link [^>]*data-hero[^>]*>/, '');
  set('name', 'description', d);
  set('property', 'og:type', meta.type || 'product');
  set('property', 'og:title', t);
  set('property', 'og:description', d);
  set('property', 'og:image', meta.image);
  set('property', 'og:url', meta.url);
  set('name', 'twitter:title', t);
  set('name', 'twitter:description', d);
  set('name', 'twitter:image', meta.image);
  return html.replace('</head>', `  <link rel="canonical" href="${meta.url}" />\n  </head>`);
}
