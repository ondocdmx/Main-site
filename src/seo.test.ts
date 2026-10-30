import { describe, expect, it } from 'vitest';
import { applyMetaToHtml, productMeta } from './seo.js';
import products from './content/products.json' with { type: 'json' };

const megaVerde = (products as any[]).find(p => p.slug === 'mega-verde');

describe('productMeta', () => {
  it('título con el nombre, descripción ≤ 160 y URL absoluta', () => {
    const m = productMeta(megaVerde, '/images/soups/web/mega-verde-plated-800.webp');
    expect(m.title).toBe('Mega verde · Sopas Ondo a domicilio en CDMX');
    expect(m.description.length).toBeLessThanOrEqual(160);
    expect(m.url).toBe('https://www.ondoclub.com/sopas/mega-verde');
    expect(m.image).toBe('https://www.ondoclub.com/images/soups/web/mega-verde-plated-800.webp');
  });

  it('nunca pone placeholders en lo que ve Google', () => {
    for (const p of products as any[]) expect(productMeta(p, undefined).description).not.toMatch(/\[/);
  });
});

describe('applyMetaToHtml', () => {
  it('cambia título, descripción y og/twitter, y añade canonical', () => {
    const html = '<head><title>Home</title><meta name="description" content="home" /><meta property="og:title" content="home" /></head>';
    const out = applyMetaToHtml(html, { title: 'Sopa "rica"', description: 'Desc', url: 'https://x/sopas/a', image: 'https://x/a.webp' });
    expect(out).toContain('<title>Sopa &quot;rica&quot;</title>');
    expect(out).toContain('<meta name="description" content="Desc" />');
    expect(out).toContain('<meta property="og:title" content="Sopa &quot;rica&quot;" />');
    expect(out).toContain('<meta property="og:url" content="https://x/sopas/a" />');
    expect(out).toContain('<link rel="canonical" href="https://x/sopas/a" />');
  });
});
