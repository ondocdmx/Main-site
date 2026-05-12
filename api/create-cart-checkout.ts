import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const {
    origin, cartItems, couponId,
    deliverySlot, deliveryPhone, deliveryEmail, deliveryAddress, deliveryPostal,
    shippingProductId, shippingPrice, isPickup,
  } = req.body;

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    res.status(400).json({ error: 'cartItems is required' });
    return;
  }

  const frontendUrl = origin || process.env.FRONTEND_URL || 'http://localhost:3000';

  const line_items: any[] = cartItems.map((item: { productId: string; price: number; quantity: number }) => ({
    price_data: {
      currency: 'mxn',
      product: item.productId,
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  if (!isPickup && shippingProductId && shippingPrice) {
    line_items.push({
      price_data: {
        currency: 'mxn',
        product: shippingProductId,
        unit_amount: Math.round(shippingPrice * 100),
      },
      quantity: 1,
    });
  }

  const sessionParams: any = {
    mode: 'payment',
    phone_number_collection: { enabled: true },
    shipping_address_collection: { allowed_countries: ['MX'] },
    line_items,
    ...(deliveryEmail ? { customer_email: deliveryEmail } : {}),
    success_url: `${frontendUrl}?payment=success`,
    cancel_url: frontendUrl,
    payment_intent_data: {
      receipt_email: deliveryEmail || undefined,
      metadata: {
        delivery_type: isPickup ? 'pickup' : 'home_delivery',
        delivery_slot: deliverySlot || '',
        delivery_phone: deliveryPhone || '',
        delivery_email: deliveryEmail || '',
        delivery_address: (deliveryAddress || '').slice(0, 500),
        delivery_postal: deliveryPostal || '',
      },
    },
  };

  if (couponId) {
    sessionParams.discounts = [{ coupon: couponId }];
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
