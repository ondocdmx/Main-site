// Reglas de negocio del carrito, leídas de los JSON de src/content/ (no hay otro archivo de config).
// Importes en centavos MXN. Lo usan la web (App.tsx) y el servidor (api/create-cart-checkout.ts).
import settings from '../content/settings.json' with { type: 'json' };
import deliveryZones from '../content/deliveryZones.json' with { type: 'json' };

export interface DeliverySlot {
  id: string;
  start: string;
  end: string;
}

export interface CommerceConfig {
  shippingFee: number;
  shippingStripePriceId: string;
  freeShippingMinSoups: number;
  boxShipsFree: boolean;
  bulkDiscountMinItems: number;
  bulkDiscountPercent: number;
  bulkDiscountCouponId: string;
  welcomeCode: string;
  welcomePercent: number;
  allowedPostalCodes: string[];
  deliveryDays: string[];
  deliverySlots: DeliverySlot[];
  orderCutoff: { day: string; time: string; timeZone: string };
}

export const toCents = (pesos: number): number => Math.round(pesos * 100);

export const COMMERCE: CommerceConfig = {
  shippingFee: toCents(settings.shippingPrice),
  // Pese al nombre, shippingStripeProductId guarda el Price ID (price_…) del envío.
  shippingStripePriceId: settings.shippingStripeProductId,
  freeShippingMinSoups: settings.freeShippingMinSoups,
  boxShipsFree: settings.boxShipsFree,
  // Descuento por volumen: un solo escalón (cartDiscount2*). Percent vacío/0 = desactivado.
  bulkDiscountMinItems: settings.cartDiscount2Min,
  bulkDiscountPercent: Number(settings.cartDiscount2Percent) || 0,
  bulkDiscountCouponId: settings.cartDiscount2CouponId,
  welcomeCode: settings.welcomeCode,
  welcomePercent: settings.welcomePercent,
  allowedPostalCodes: deliveryZones.allowedPostalCodes,
  // Aún no conectados: el día, las franjas y el corte siguen fijos en App.tsx (Fase 3).
  deliveryDays: settings.deliveryDays,
  deliverySlots: settings.deliverySlots,
  orderCutoff: settings.orderCutoff,
};
