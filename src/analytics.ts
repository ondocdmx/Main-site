// ── Tracking ecommerce GA4 vía dataLayer (consumido por GTM) ──
// Snippet de GTM pendiente del Container ID de la agencia; mientras tanto
// todos los eventos quedan en window.dataLayer listos para ser leídos.

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const isDev = (import.meta as any).env?.DEV ?? false;
export const CURRENCY = 'MXN';

const UTMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const ATTR_KEY = 'ondo_attribution';
const SNAP_KEY = 'ondo_checkout_snapshot';
const SNAP_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2h

const safeGet = (key: string): string | null => {
  try { return sessionStorage.getItem(key); } catch { return null; }
};
const safeSet = (key: string, value: string) => {
  try { sessionStorage.setItem(key, value); } catch { /* noop */ }
};
const safeRemove = (key: string) => {
  try { sessionStorage.removeItem(key); } catch { /* noop */ }
};

// ── dataLayer ──
export const pushEvent = (event: string, data: Record<string, unknown> = {}) => {
  window.dataLayer = window.dataLayer || [];
  const payload = { event, ...data };
  window.dataLayer.push(payload);
  if (isDev) console.debug('[dataLayer]', payload);
};

// Item estándar GA4 a partir de un producto de Sanity
export const productToItem = (product: any, quantity = 1) => ({
  item_id: product?.slug || product?.stripePriceId || product?._id || 'desconocido',
  item_name: product?.title?.es || product?.title?.en || 'Producto',
  item_category: product?.purchaseType === 'subscription' ? 'Soupcripciones' : 'Sopas',
  price: Number(product?.price) || 0,
  quantity,
});

// Item para un plan de suscripción (no es un documento de producto)
export const planItem = (priceId: string, frequency: string, soups: number, amount: number) => ({
  item_id: priceId,
  item_name: `Soupcripción ${frequency} · ${soups} sopas`,
  item_category: 'Soupcripciones',
  price: Number(amount) || 0,
  quantity: 1,
});

type GA4Item = ReturnType<typeof productToItem>;

// Evento ecommerce estándar. `extra` puede sobrescribir value (p.ej. con descuento).
export const pushEcommerce = (
  event: string,
  items: GA4Item[],
  extra: Record<string, unknown> = {},
) => {
  const computed = items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0);
  const value = typeof extra.value === 'number' ? extra.value : Number(computed.toFixed(2));
  pushEvent(event, { ecommerce: { currency: CURRENCY, value, items, ...extra } });
};

// ── Atribución / UTMs ──
// Captura al aterrizar y persiste en sessionStorage: sobrevive a la navegación
// y al redirect de Stripe (mismo origen + misma pestaña).
export const captureAttribution = () => {
  const params = new URLSearchParams(window.location.search);
  const found: Record<string, string> = {};
  UTMS.forEach((k) => {
    const v = params.get(k);
    if (v) found[k] = v;
  });
  if (Object.keys(found).length > 0) {
    safeSet(ATTR_KEY, JSON.stringify({ ...getAttribution(), ...found, ts: Date.now() }));
  }
};

export const getAttribution = (): Record<string, unknown> => {
  try { return JSON.parse(safeGet(ATTR_KEY) || '{}'); } catch { return {}; }
};

// ── Snapshot de checkout (para reconstruir el purchase tras el redirect) ──
export const saveCheckoutSnapshot = (type: 'payment' | 'subscription', items: GA4Item[], value: number) => {
  safeSet(SNAP_KEY, JSON.stringify({ type, items, value, currency: CURRENCY, ts: Date.now() }));
};

export const readCheckoutSnapshot = (): { type: string; items: GA4Item[]; value: number } | null => {
  try {
    const raw = safeGet(SNAP_KEY);
    if (!raw) return null;
    const snap = JSON.parse(raw);
    if (!snap?.ts || Date.now() - snap.ts > SNAP_MAX_AGE_MS) return null;
    return snap;
  } catch { return null; }
};

// ── Purchase con guard anti-refresco ──
// transaction_id = session_id de Stripe (único por orden).
// Guard en sessionStorage: al refrescar la confirmación no se re-dispara.
export const firePurchaseOnce = (transactionId: string, type: string, items: GA4Item[], value: number) => {
  if (!transactionId || items.length === 0) {
    if (isDev) console.debug('[dataLayer] purchase omitido (sin transaction_id o sin items)');
    return;
  }
  const guardKey = `ondo_purchase_fired_${transactionId}`;
  if (safeGet(guardKey)) return;
  safeSet(guardKey, '1');
  pushEvent('purchase', {
    ecommerce: {
      transaction_id: transactionId,
      value: Number(value.toFixed(2)),
      currency: CURRENCY,
      items,
      checkout_type: type, // 'payment' | 'subscription'
      utm: getAttribution(),
    },
  });
  safeRemove(SNAP_KEY);
};
