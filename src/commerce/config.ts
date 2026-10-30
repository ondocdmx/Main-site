// Reglas de negocio del carrito, leídas de los JSON de src/content/ (no hay otro archivo de config).
// Importes en centavos MXN. Lo usan la web (App.tsx) y el servidor (api/create-cart-checkout.ts).
import settings from '../content/settings.json' with { type: 'json' };
import deliveryZones from '../content/deliveryZones.json' with { type: 'json' };
import products from '../content/products.json' with { type: 'json' };

export interface DeliverySlot {
  id: string;
  start: string;
  end: string;
  label: string;
}

export interface CommerceConfig {
  shippingFee: number;
  freeShippingMinAmount: number; // subtotal antes de descuentos
  boxShipsFree?: boolean; // un pedido con caja no paga envío (decisión del dueño, 30 oct 2026)
  cheapestSoupPrice: number; // sopa individual más barata a la venta (para "agrega 1 sopa más")
  bulkDiscountMinItems: number;
  bulkDiscountPercent: number;
  welcomeCode: string;
  welcomePercent: number;
  allowedPostalCodes: string[];
  deliveryDays: string[];
  deliverySlots: DeliverySlot[];
  // Corte: `daysBefore` días antes de cada día de entrega, a la hora `time` (hora de `timeZone`).
  orderCutoff: { daysBefore: number; time: string; timeZone: string };
  whatsappNumber: string;
  cartPaymentMethods: string[];
  // OXXO: encenderlo solo con OXXO activo en Stripe y el webhook funcionando (docs/checkout.md).
  oxxoEnabled: boolean;
  oxxoExpiresAfterDays: number;
  reviewEmail: string;
}

export const toCents = (pesos: number): number => Math.round(pesos * 100);

export const COMMERCE: CommerceConfig = {
  shippingFee: toCents(settings.shippingPrice),
  freeShippingMinAmount: toCents(settings.freeShippingMinAmount),
  boxShipsFree: settings.boxShipsFree === true,
  cheapestSoupPrice: Math.min(...products
    .filter(p => !(p as any).isBox && !p.soldOut && !p.onlySubscriptions)
    .map(p => toCents(p.price))),
  // Descuento por volumen: un solo escalón (cartDiscount2*). Percent vacío/0 = desactivado.
  // El cupón de Stripe lo crea el servidor (api/_lib/catalog.ts).
  bulkDiscountMinItems: settings.cartDiscount2Min,
  bulkDiscountPercent: Number(settings.cartDiscount2Percent) || 0,
  welcomeCode: settings.welcomeCode,
  welcomePercent: settings.welcomePercent,
  allowedPostalCodes: deliveryZones.allowedPostalCodes,
  deliveryDays: settings.deliveryDays,
  deliverySlots: settings.deliverySlots,
  orderCutoff: settings.orderCutoff,
  whatsappNumber: settings.whatsappNumber,
  cartPaymentMethods: settings.cartPaymentMethods,
  oxxoEnabled: settings.oxxoEnabled,
  oxxoExpiresAfterDays: settings.oxxoExpiresAfterDays,
  reviewEmail: settings.reviewEmail,
};
