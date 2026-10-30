import { describe, expect, it } from 'vitest';
import { cartSuggestions, shopList, type ShopFilter } from './shopList.js';
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

describe('cartSuggestions (carrito: agrega otra sopa)', () => {
  const soup = (id: string, featuredRank: number, extra = {}) => ({ _id: id, price: 125, featuredRank, ...extra });
  const catalog = [
    soup('box', 0, { isBox: true }), soup('a', 1), soup('b', 2), soup('c', 3), soup('d', 4), soup('e', 5),
    soup('f', 6), soup('g', 7), soup('agotada', 8, { soldOut: true }), soup('solo-subs', 9, { onlySubscriptions: true }),
  ];
  it('carrito vacío: no se muestra', () => {
    expect(cartSuggestions(catalog, [], false).show).toBe(false);
  });
  it('sugiere 5 que no están en el carrito, en orden destacadas, sin caja, agotadas ni solo suscriptores', () => {
    const r = cartSuggestions(catalog, ['box', 'b'], false);
    expect(r.show).toBe(true);
    expect(r.items.map(p => p._id)).toEqual(['a', 'c', 'd', 'e', 'f']);
  });
  it('aparece con menos de 4 sopas distintas, sigue con 4 si ya se veía y se va con 5', () => {
    expect(cartSuggestions(catalog, ['a', 'b', 'c'], false).show).toBe(true);
    expect(cartSuggestions(catalog, ['a', 'b', 'c', 'd'], false).show).toBe(false);
    expect(cartSuggestions(catalog, ['a', 'b', 'c', 'd'], true).show).toBe(true);
    expect(cartSuggestions(catalog, ['a', 'b', 'c', 'd', 'e'], true).show).toBe(false);
  });
  it('la caja no cuenta como sopa distinta', () => {
    expect(cartSuggestions(catalog, ['box', 'a', 'b', 'c'], false).show).toBe(true);
  });
});
