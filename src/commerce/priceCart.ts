// Motor de precios del carrito: la ÚNICA función que calcula subtotal, descuento, envío y total.
// Pura (sin red ni estado): la usan el carrito en el navegador y el servidor que crea el pago.
// Todo en centavos MXN.
import { COMMERCE, toCents, type CommerceConfig } from './config.js';

export interface PricedProduct {
  _id: string;
  price: number; // pesos, como en products.json
  isBox?: boolean;
}

export interface CartItem {
  product: PricedProduct;
  quantity: number;
}

export type DiscountType = 'bulk' | 'welcome' | null;
export type FreeShippingReason = 'minAmount' | 'box' | null;

export interface PricedLine {
  productId: string;
  quantity: number;
  unitPrice: number;
  lineSubtotal: number;
  lineDiscount: number;
  lineTotal: number;
}

export interface CartPricing {
  soupCount: number; // sopas individuales (sin cajas)
  itemCount: number; // artículos para el 20%: cada caja cuenta como 1
  lines: PricedLine[];
  subtotal: number;
  discountType: DiscountType;
  discountPercent: number;
  discountAmount: number;
  shipping: number;
  total: number;
  freeShippingReason: FreeShippingReason;
  amountToFreeShipping: number; // centavos que faltan (subtotal antes de descuentos)
  soupsToBulkDiscount: number;
}

// Porcentaje que recibe un producto según el descuento del pedido.
// El 20% por volumen nunca aplica a la caja (ya trae su descuento); la bienvenida sí.
export function discountPercentFor(product: PricedProduct, pricing: Pick<CartPricing, 'discountType' | 'discountPercent'>): number {
  if (pricing.discountType === 'bulk' && product.isBox) return 0;
  return pricing.discountType ? pricing.discountPercent : 0;
}

export function applyPercent(amount: number, percent: number): number {
  return amount - Math.round((amount * percent) / 100);
}

export function priceCart(
  items: CartItem[],
  options: { welcomeCode?: string } = {},
  config: CommerceConfig = COMMERCE,
): CartPricing {
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 0) {
      throw new Error(`Cantidad inválida para ${item.product._id}`);
    }
  }
  const filled = items.filter(item => item.quantity > 0);

  const soupCount = filled.reduce((n, i) => n + (i.product.isBox ? 0 : i.quantity), 0);
  const boxCount = filled.reduce((n, i) => n + (i.product.isBox ? i.quantity : 0), 0);
  const itemCount = soupCount + boxCount;

  // Un solo descuento por pedido: el 20% por volumen gana a la bienvenida.
  const bulkOn = config.bulkDiscountPercent > 0;
  const bulkApplies = bulkOn && itemCount >= config.bulkDiscountMinItems && soupCount > 0;
  const code = (options.welcomeCode || '').trim().toUpperCase();
  const welcomeApplies = !bulkApplies && itemCount > 0 && code !== '' && code === config.welcomeCode.toUpperCase();
  const discountType: DiscountType = bulkApplies ? 'bulk' : welcomeApplies ? 'welcome' : null;
  const discountPercent = bulkApplies ? config.bulkDiscountPercent : welcomeApplies ? config.welcomePercent : 0;

  const lines: PricedLine[] = filled.map(({ product, quantity }) => {
    const unitPrice = toCents(product.price);
    const lineSubtotal = unitPrice * quantity;
    const lineTotal = applyPercent(lineSubtotal, discountPercentFor(product, { discountType, discountPercent }));
    return { productId: product._id, quantity, unitPrice, lineSubtotal, lineDiscount: lineSubtotal - lineTotal, lineTotal };
  });

  const subtotal = lines.reduce((n, l) => n + l.lineSubtotal, 0);
  const discountAmount = lines.reduce((n, l) => n + l.lineDiscount, 0);

  // Envío gratis por monto, contado ANTES de descuentos: usar ONDOFIRST no quita el envío gratis.
  // Con boxShipsFree, cualquier pedido con caja tampoco paga envío.
  const freeShippingReason: FreeShippingReason =
    itemCount > 0 && subtotal >= config.freeShippingMinAmount ? 'minAmount'
    : boxCount > 0 && config.boxShipsFree ? 'box'
    : null;
  const shipping = itemCount === 0 || freeShippingReason ? 0 : config.shippingFee;

  return {
    soupCount,
    itemCount,
    lines,
    subtotal,
    discountType,
    discountPercent,
    discountAmount,
    shipping,
    total: subtotal - discountAmount + shipping,
    freeShippingReason,
    amountToFreeShipping: freeShippingReason ? 0 : Math.max(0, config.freeShippingMinAmount - subtotal),
    soupsToBulkDiscount: bulkOn ? Math.max(0, config.bulkDiscountMinItems - itemCount) : 0,
  };
}

export type CartNudge = { type: 'freeShipping' | 'bulk'; count: number } | null;

// Aviso en la tienda cuando falta poco para un beneficio: envío gratis cuando cualquier sopa
// cierra la diferencia (1 sopa de distancia); el 20% cuando falta 1 artículo.
export function cartNudge(pricing: CartPricing, config: CommerceConfig = COMMERCE): CartNudge {
  if (pricing.itemCount > 0 && pricing.amountToFreeShipping > 0 && pricing.amountToFreeShipping <= config.cheapestSoupPrice) {
    return { type: 'freeShipping', count: 1 };
  }
  if (pricing.soupsToBulkDiscount === 1) return { type: 'bulk', count: 1 };
  return null;
}
