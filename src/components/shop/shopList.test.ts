import { describe, expect, it } from 'vitest';
import { shopList, type ShopFilter } from './shopList.js';
import products from '../../content/products.json' with { type: 'json' };
import settings from '../../content/settings.json' with { type: 'json' };

const filters = settings.shopFilters as ShopFilter[];
const filter = (id: string) => filters.find(f => f.id === id);
const slugs = (r: { items: { slug: string }[] }) => r.items.map(p => p.slug);
const all = products as any[];

describe('shopList', () => {
  it('Todas: la caja aparte y las de solo suscriptores al final', () => {
    const r = shopList(all, filter('todas'), 'featured');
    expect(r.box?.slug).toBe('ondo-box');
    expect(r.items).toHaveLength(all.length - 1);
    expect(r.items.at(-1)?.onlySubscriptions).toBe(true);
  });

  it('Vegetariana incluye las veganas; Vegana no incluye las vegetarianas', () => {
    const veg = slugs(shopList(all, filter('vegetariana'), 'featured'));
    const vegan = slugs(shopList(all, filter('vegana'), 'featured'));
    expect(veg).toEqual(expect.arrayContaining(vegan));
    expect(veg).toContain('coliflor-avellanada');
    expect(vegan).not.toContain('coliflor-avellanada');
    expect(vegan).toContain('mega-verde');
  });

  it('Proteína Animal = carne o pescado; con filtro no sale la caja', () => {
    const r = shopList(all, filter('proteina-animal'), 'featured');
    expect(r.box).toBeNull();
    expect(slugs(r)).toEqual(expect.arrayContaining(['garbanzo-y-rabo', 'chowder-bacalao']));
    expect(slugs(r)).not.toContain('mega-verde');
  });

  it('Picante = solo las de chile (dahl y gazpacho son "especiadas", no picantes)', () => {
    expect(slugs(shopList(all, filter('picante'), 'featured')).sort()).toEqual(['salchispatzle', 'sopa-tlalpena']);
  });

  it('ordenar por precio respeta "solo suscriptores al final"', () => {
    const asc = shopList(all, filter('todas'), 'priceAsc').items;
    const sellable = asc.filter(p => !p.onlySubscriptions).map(p => p.price);
    expect(sellable).toEqual([...sellable].sort((a, b) => a - b));
    expect(asc.at(-1)?.onlySubscriptions).toBe(true);
    const desc = shopList(all, filter('todas'), 'priceDesc').items.filter(p => !p.onlySubscriptions).map(p => p.price);
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  it('cada tag que usan los filtros existe en tags.json', async () => {
    const tags = (await import('../../content/tags.json')).default.map((t: any) => t.slug.current);
    for (const f of filters) for (const t of f.tags) expect(tags).toContain(t);
  });
});

describe('caja', () => {
  it('cada sopa de boxContents existe y tiene alérgenos propios', () => {
    const box = all.find(p => p.isBox);
    expect(box.boxContents).toHaveLength(box.soupsInBox);
    for (const slug of box.boxContents) {
      const soup = all.find(p => p.slug === slug);
      expect(soup, slug).toBeTruthy();
      expect(soup.allergens?.es).toBeTruthy();
    }
  });
});
