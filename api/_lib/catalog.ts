// Catálogo de Stripe para el carrito: a qué Product de Stripe apunta cada sopa y el cupón del 20%.
// Vercel no publica los archivos de api/ que empiezan con "_": esto no es una ruta.
import { createHash } from 'node:crypto';
import type Stripe from 'stripe';

export interface CatalogProduct {
  _id: string;
  slug: string;
  stripePriceId?: string;
  stripeTestProductId?: string;
  isBox?: boolean;
}

export const isTestMode = (key = process.env.STRIPE_SECRET_KEY || '') => /^(sk|rk)_test_/.test(key);

const productCache = new Map<string, Promise<string>>();

// Live: el Product sale del Price ID que ya está en products.json (las ventas siguen sumando por sopa).
// Test: Stripe en modo test tiene su propio catálogo; los IDs los escribe scripts/stripe-test-catalog.mjs.
export function stripeProductId(stripe: Stripe, product: CatalogProduct): Promise<string> {
  if (isTestMode()) {
    if (!product.stripeTestProductId) {
      return Promise.reject(new Error(`Falta stripeTestProductId para ${product.slug}: corre scripts/stripe-test-catalog.mjs`));
    }
    return Promise.resolve(product.stripeTestProductId);
  }
  if (!product.stripePriceId) return Promise.reject(new Error(`Falta stripePriceId para ${product.slug}`));
  const key = product.stripePriceId;
  if (!productCache.has(key)) {
    const lookup = stripe.prices.retrieve(key).then(price =>
      typeof price.product === 'string' ? price.product : price.product.id,
    );
    lookup.catch(() => productCache.delete(key)); // un error no se queda en caché
    productCache.set(key, lookup);
  }
  return productCache.get(key)!;
}

const couponCache = new Set<string>();

// Crea el cupón si no existe. El ID depende de su contenido: si cambia la lista de sopas o el %,
// sale un cupón nuevo (los cupones de Stripe no se pueden editar).
export async function ensureCoupon(stripe: Stripe, id: string, params: Stripe.CouponCreateParams): Promise<string> {
  if (couponCache.has(id)) return id;
  try {
    await stripe.coupons.retrieve(id);
  } catch (err: any) {
    if (err?.statusCode !== 404 && err?.code !== 'resource_missing') throw err;
    try {
      await stripe.coupons.create({ ...params, id });
    } catch (createErr: any) {
      if (createErr?.code !== 'resource_already_exists') throw createErr; // otra instancia lo creó a la vez
    }
  }
  couponCache.add(id);
  return id;
}

// 20% por volumen: aplica a todas las sopas individuales y nunca a la caja ni al envío
// (los cupones no tocan las opciones de envío). Al añadir una sopa nueva, el cupón se rehace solo.
export async function bulkCouponId(stripe: Stripe, soups: CatalogProduct[], percent: number): Promise<string> {
  const productIds = [...new Set(await Promise.all(soups.filter(p => !p.isBox).map(p => stripeProductId(stripe, p))))].sort();
  const hash = createHash('sha256').update(`${percent}|${productIds.join(',')}`).digest('hex').slice(0, 10);
  return ensureCoupon(stripe, `ondo_bulk_${percent}_${hash}`, {
    percent_off: percent,
    duration: 'once',
    name: `${percent}% desde 10 sopas`,
    applies_to: { products: productIds },
  });
}

// Solo para tests: vacía las cachés entre casos.
export function resetCatalogCache() {
  productCache.clear();
  couponCache.clear();
}
