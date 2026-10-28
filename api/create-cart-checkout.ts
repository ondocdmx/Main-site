import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import productsContent from '../src/content/products.json' with { type: 'json' };
import { priceCart } from '../src/commerce/priceCart.js';
import { COMMERCE } from '../src/commerce/config.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

const productsById = new Map(productsContent.map(p => [p._id, p]));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const {
    origin, items,
    deliverySlot, deliveryPhone, deliveryEmail, deliveryAddress, deliveryPostal,
  } = req.body;

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

  const pricing = priceCart(cartItems);

  const frontendUrl = origin || process.env.FRONTEND_URL || 'http://localhost:3000';

  const line_items: any[] = cartItems.map(({ product, quantity }) => ({
    price: product.stripePriceId,
    quantity,
  }));

  // Ondo no hace recogida en tienda: el envío se cobra salvo que el pedido lo tenga gratis.
  if (pricing.shipping > 0) {
    line_items.push({ price: COMMERCE.shippingStripePriceId, quantity: 1 });
  }

  const sessionParams: any = {
    mode: 'payment',
    phone_number_collection: { enabled: true },
    shipping_address_collection: { allowed_countries: ['MX'] },
    line_items,
    ...(deliveryEmail ? { customer_email: deliveryEmail } : {}),
    success_url: `${frontendUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: frontendUrl,
    payment_intent_data: {
      receipt_email: deliveryEmail || undefined,
      metadata: {
        delivery_type: 'home_delivery',
        delivery_slot: deliverySlot || '',
        delivery_phone: deliveryPhone || '',
        delivery_email: deliveryEmail || '',
        delivery_address: (deliveryAddress || '').slice(0, 500),
        delivery_postal: deliveryPostal || '',
        free_shipping_reason: pricing.freeShippingReason || '',
      },
    },
  };

  if (pricing.discountType === 'bulk') {
    // Descuento por volumen: cupón de Stripe con las sopas individuales (no la caja).
    // Stripe no permite `discounts` + `allow_promotion_codes` en la misma sesión.
    sessionParams.discounts = [{ coupon: COMMERCE.bulkDiscountCouponId }];
  } else {
    // Sin descuento automático: el cliente puede escribir su código (ej: ONDOFIRST) en Stripe.
    sessionParams.allow_promotion_codes = true;
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    // Aviso si Stripe cobra distinto de lo que mostró el carrito (Price ID o cupón desalineado).
    if (session.amount_total != null && session.amount_total !== pricing.total) {
      console.warn(`Total distinto: Stripe ${session.amount_total} vs carrito ${pricing.total} (sesión ${session.id})`);
    }
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
