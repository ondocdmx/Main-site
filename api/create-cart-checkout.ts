import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import productsContent from '../src/content/products.json' with { type: 'json' };
import { priceCart } from '../src/commerce/priceCart.js';
import { COMMERCE } from '../src/commerce/config.js';
import { deliveryLabel, findSlot, isPostalInZone, nextDeliveryDate } from '../src/commerce/delivery.js';
import { PREVIEW_LIVE_KEY_ERROR, bulkCouponId, isLiveKeyOnPreview, stripeProductId } from './_lib/catalog.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

const productsById = new Map(productsContent.map(p => [p._id, p]));
// Sopas que entran en el cupón del 20%: todas las individuales que se venden en el carrito.
const soupsForCoupon = productsContent.filter(p => !(p as any).isBox && !p.onlySubscriptions);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (isLiveKeyOnPreview()) {
    res.status(500).json({ error: PREVIEW_LIVE_KEY_ERROR });
    return;
  }

  const { origin, items, deliverySlot, deliveryPostal, deliveryDate } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'items is required' });
    return;
  }

  // El navegador solo manda qué sopas y cuántas: precios, descuento y envío se calculan aquí.
  const cartItems: { product: (typeof productsContent)[number]; quantity: number }[] = [];
  for (const item of items as { id: string; quantity: number }[]) {
    const product = productsById.get(item?.id);
    if (!product || product.soldOut || product.onlySubscriptions || !product.stripePriceId) {
      res.status(400).json({ error: `Producto no disponible: ${item?.id}` });
      return;
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
      res.status(400).json({ error: `Cantidad inválida: ${item.id}` });
      return;
    }
    cartItems.push({ product, quantity: item.quantity });
  }

  // Entrega: el servidor vuelve a comprobar franja, código postal y fecha (la del navegador puede ser vieja).
  const slot = findSlot(deliverySlot);
  if (!slot) {
    res.status(400).json({ error: 'Elige una franja de entrega.' });
    return;
  }
  const postal = String(deliveryPostal || '');
  if (!isPostalInZone(postal)) {
    res.status(400).json({ error: 'Aún no entregamos en ese código postal.' });
    return;
  }
  const date = nextDeliveryDate();
  if (deliveryDate && deliveryDate !== date) {
    // Pasó el corte con la página abierta: el carrito muestra la nueva fecha y el cliente vuelve a pagar.
    res.status(409).json({ error: 'delivery_date_changed', deliveryDate: date });
    return;
  }

  const pricing = priceCart(cartItems);

  const frontendUrl = origin || process.env.FRONTEND_URL || 'http://localhost:3000';

  const metadata = {
    delivery_type: 'home_delivery',
    delivery_date: date,
    delivery_slot: slot.id,
    delivery_postal: postal,
    discount_type: pricing.discountType || '',
    free_shipping_reason: pricing.freeShippingReason || '',
  };

  try {
    // Cada línea lleva el precio calculado aquí (priceCart, desde products.json) y apunta al
    // Product de Stripe de esa sopa, para que las ventas sigan sumando por sopa en los reportes.
    const line_items = await Promise.all(pricing.lines.map(async line => {
      const product = productsById.get(line.productId)!;
      return {
        price_data: { currency: 'mxn', unit_amount: line.unitPrice, product: await stripeProductId(stripe, product) },
        quantity: line.quantity,
      };
    }));

    const sessionParams: any = {
      mode: 'payment',
      locale: 'es-419',
      // Apple Pay y Google Pay salen solos con 'card' si están activos en el Dashboard de Stripe.
      payment_method_types: COMMERCE.oxxoEnabled ? ['card', 'oxxo'] : ['card'],
      ...(COMMERCE.oxxoEnabled ? { payment_method_options: { oxxo: { expires_after_days: COMMERCE.oxxoExpiresAfterDays } } } : {}),
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ['MX'] },
      // El envío va como opción de envío de Stripe ($50 o $0) con el día y la franja: el resumen de
      // Stripe coincide con el carrito, y los cupones no lo descuentan.
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: pricing.shipping, currency: 'mxn' },
          display_name: deliveryLabel(date, slot),
        },
      }],
      line_items,
      success_url: `${frontendUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: frontendUrl,
      metadata,
      payment_intent_data: { metadata },
    };

    if (pricing.discountType === 'bulk') {
      // 20% por volumen: cupón creado por el servidor, solo para las sopas individuales.
      // Stripe no permite `discounts` + `allow_promotion_codes` en la misma sesión.
      sessionParams.discounts = [{ coupon: await bulkCouponId(stripe, soupsForCoupon, pricing.discountPercent) }];
    } else {
      // Sin 20%: el cliente puede escribir ONDOFIRST en Stripe (Stripe revisa que sea su primer pedido).
      // Se quita en la Fase 4, cuando el 10% de bienvenida lo aplique el servidor.
      sessionParams.allow_promotion_codes = true;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    // Aviso si Stripe calcula distinto que el carrito (no debería: los importes salen de priceCart).
    if (session.amount_total != null && session.amount_total !== pricing.total) {
      console.warn(`Total distinto: Stripe ${session.amount_total} vs carrito ${pricing.total} (sesión ${session.id})`);
    }
    res.json({ url: session.url });
  } catch (err: any) {
    console.error('create-cart-checkout:', err?.message);
    res.status(500).json({ error: 'No pudimos abrir el pago. Inténtalo de nuevo.' });
  }
}
