// Qué muestra la tienda y en qué orden. Puro, para poder probarlo (shopList.test.ts).
// Filtros en settings.json → shopFilters: cada filtro es una lista de tags (basta con tener uno).

export type SortKey = 'featured' | 'priceAsc' | 'priceDesc';
export type ShopFilter = { id: string; tags: string[]; name: { es: string; en: string } };

type Product = {
  _id: string;
  price: number;
  featuredRank?: number;
  isBox?: boolean;
  onlySubscriptions?: boolean | null;
  tags?: { slug?: { current?: string } }[] | null;
};

const hasAnyTag = (p: Product, tags: string[]) =>
  (p.tags || []).some(t => tags.includes(t?.slug?.current || ''));

// La caja va aparte (tarjeta propia, primero) y solo sin filtro: mezcla sopas de todo tipo.
// Las "solo suscriptores" siempre al final, ordenes como ordenes.
export function shopList<P extends Product>(products: P[], filter: ShopFilter | undefined, sort: SortKey): { box: P | null; items: P[] } {
  const filterTags = filter?.tags || [];
  const box = filterTags.length === 0 ? products.find(p => p.isBox) ?? null : null;
  const soups = products.filter(p => !p.isBox && (filterTags.length === 0 || hasAnyTag(p, filterTags)));
  const rank = (p: P) => p.featuredRank ?? products.indexOf(p);
  const compare = (a: P, b: P) =>
    sort === 'priceAsc' ? a.price - b.price || rank(a) - rank(b)
    : sort === 'priceDesc' ? b.price - a.price || rank(a) - rank(b)
    : rank(a) - rank(b);
  const items = [...soups].sort((a, b) => Number(!!a.onlySubscriptions) - Number(!!b.onlySubscriptions) || compare(a, b));
  return { box, items };
}

// Carrito: "Agrega otra sopa", fotos con scroll lateral. Aparece con menos de 4 sopas distintas y se va con 5;
// con 4 se queda solo si ya se veía (`wasShown`), para que no parpadee al quitar o agregar una.
// Sugiere hasta `max` sopas que no están en el carrito, en el orden "Destacadas" (sin caja, agotadas ni solo suscriptores).
export function cartSuggestions<P extends Product & { soldOut?: boolean | null }>(
  products: P[], cartIds: string[], wasShown: boolean, max = 5,
): { show: boolean; items: P[] } {
  const inCart = new Set(cartIds);
  const distinctSoups = products.filter(p => !p.isBox && inCart.has(p._id)).length;
  const show = cartIds.length > 0 && (distinctSoups < 4 || (distinctSoups === 4 && wasShown));
  if (!show) return { show, items: [] };
  const rank = (p: P) => p.featuredRank ?? products.indexOf(p);
  const items = products
    .filter(p => !p.isBox && !p.soldOut && !p.onlySubscriptions && !inCart.has(p._id))
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, max);
  return { show: items.length > 0, items };
}
