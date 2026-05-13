import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
});

app.post('/api/create-cart-checkout', async (req, res) => {
  const {
    origin, cartItems, couponId,
    deliverySlot, deliveryPhone, deliveryEmail, deliveryAddress, deliveryPostal,
    shippingProductId, isPickup,
  } = req.body;

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    res.status(400).json({ error: 'cartItems is required' });
    return;
  }

  const frontendUrl = origin || process.env.FRONTEND_URL || 'http://localhost:3000';

  console.log('CART ITEMS RECEIVED:', JSON.stringify(cartItems, null, 2));
  console.log('shippingProductId:', shippingProductId, 'isPickup:', isPickup);

  const line_items: any[] = cartItems.map((item: { productId: string; quantity: number }) => ({
    price: item.productId,
    quantity: item.quantity,
  }));

  console.log('LINE ITEMS TO STRIPE:', JSON.stringify(line_items, null, 2));

  if (!isPickup && shippingProductId) {
    line_items.push({ price: shippingProductId, quantity: 1 });
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
    console.error('Stripe cart error:', err?.message);
    res.status(500).json({ error: err?.message || 'Stripe error' });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
  const {
    origin, productId, frequency, quantity,
    selectedSoups, letOndoChoose, contingencies,
    deliverySlot, deliveryAddress, deliveryPostal,
  } = req.body;

  if (!productId) {
    res.status(400).json({ error: 'productId is required' });
    return;
  }

  const frontendUrl = origin || process.env.FRONTEND_URL || 'http://localhost:3000';

  const soupsValue = Array.isArray(selectedSoups)
    ? selectedSoups.join(' | ').slice(0, 490)
    : '';

  const metadata = {
    frequency: frequency || '',
    soups_per_delivery: String(quantity || ''),
    let_ondo_choose: String(letOndoChoose || false),
    selected_soups: soupsValue,
    contingencies: (contingencies || '').slice(0, 490),
    delivery_slot: deliverySlot || '',
    delivery_address: (deliveryAddress || '').slice(0, 490),
    delivery_postal: deliveryPostal || '',
  };

  try {
    const price = await stripe.prices.retrieve(productId);
    const isRecurring = price.type === 'recurring';

    const session = await stripe.checkout.sessions.create({
      mode: isRecurring ? 'subscription' : 'payment',
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ['MX'] },
      line_items: [{ price: productId, quantity: 1 }],
      ...(isRecurring
        ? { subscription_data: { metadata } }
        : { payment_intent_data: { metadata } }
      ),
      success_url: `${frontendUrl}?subscription=success`,
      cancel_url: frontendUrl,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe subscription error:', err?.message);
    res.status(500).json({ error: err?.message || 'Stripe error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ONDO API server running on http://localhost:${PORT}`);
});
