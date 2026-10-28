// Prueba el servidor del carrito sin llamar a Stripe: se intercepta la sesión que crearía.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const create = vi.fn();
const pricesRetrieve = vi.fn();
const couponsRetrieve = vi.fn();
const couponsCreate = vi.fn();
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    checkout: { sessions: { create } },
    prices: { retrieve: pricesRetrieve },
    coupons: { retrieve: couponsRetrieve, create: couponsCreate },
  })),
}));

const { default: handler } = await import('../api/create-cart-checkout');
const { COMMERCE } = await import('../src/commerce/config');
const { nextDeliveryDate } = await import('../src/commerce/delivery');
const { resetCatalogCache } = await import('../api/_lib/catalog');
const products = (await import('../src/content/products.json')).default as any[];

const VEG = 'gk8n1Y45KbppZEAYCEfG7O'; // mega-verde, $125
const BOX = '8ceb6e4e-f0ba-4c24-a9f4-32899bd3ebd2'; // ondo-box, $600
const SUBS_ONLY = '426a504e-5a54-4615-b7a3-298fd51de371'; // chowder, solo suscripción
const delivery = { deliverySlot: 'slot_9_13', deliveryPostal: '06700' };

async function call(body: any) {
  const res: any = { statusCode: 200, body: null };
  res.status = (c: number) => { res.statusCode = c; return res; };
  res.json = (b: any) => { res.body = b; return res; };
  await handler({ method: 'POST', body: { ...delivery, ...body } } as any, res);
  return res;
}
const params = () => create.mock.calls[0][0];
const shippingAmount = () => params().shipping_options[0].shipping_rate_data.fixed_amount.amount;

beforeEach(() => {
  resetCatalogCache();
  COMMERCE.oxxoEnabled = false;
  delete process.env.STRIPE_SECRET_KEY;
  create.mockReset();
  create.mockImplementation(async () => ({ id: 'cs_test', url: 'https://stripe.test', amount_total: null }));
  // Live: cada Price ID de products.json pertenece a un Product "prod_<price>"
  pricesRetrieve.mockReset();
  pricesRetrieve.mockImplementation(async (id: string) => ({ id, product: `prod_${id}` }));
  couponsRetrieve.mockReset();
  couponsRetrieve.mockRejectedValue(Object.assign(new Error('No such coupon'), { statusCode: 404, code: 'resource_missing' }));
  couponsCreate.mockReset();
  couponsCreate.mockImplementation(async (p: any) => p);
});

describe('api/create-cart-checkout', () => {
  it('Stripe en español, solo tarjeta, dirección en México', async () => {
    await call({ items: [{ id: VEG, quantity: 3 }] });
    const p = params();
    expect(p.locale).toBe('es-419');
    expect(p.payment_method_types).toEqual(['card']);
    expect(p.payment_method_options).toBeUndefined();
    expect(p.shipping_address_collection).toEqual({ allowed_countries: ['MX'] });
  });

  it('con OXXO encendido: tarjeta + OXXO, ficha de 1 día', async () => {
    COMMERCE.oxxoEnabled = true;
    await call({ items: [{ id: VEG, quantity: 3 }] });
    expect(params().payment_method_types).toEqual(['card', 'oxxo']);
    expect(params().payment_method_options).toEqual({ oxxo: { expires_after_days: 1 } });
  });

  it('cada línea lleva el precio de products.json y el Product de Stripe de esa sopa', async () => {
    await call({ items: [{ id: VEG, quantity: 3 }, { id: BOX, quantity: 1 }] });
    const veg = products.find(p => p._id === VEG);
    const box = products.find(p => p._id === BOX);
    expect(params().line_items).toEqual([
      { price_data: { currency: 'mxn', unit_amount: 12500, product: `prod_${veg.stripePriceId}` }, quantity: 3 },
      { price_data: { currency: 'mxn', unit_amount: 60000, product: `prod_${box.stripePriceId}` }, quantity: 1 },
    ]);
  });

  it('modo test: usa stripeTestProductId y, si falta, no abre el pago', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    const veg = products.find(p => p._id === VEG);
    expect(veg.stripeTestProductId).toMatch(/^prod_/);
    await call({ items: [{ id: VEG, quantity: 1 }] });
    expect(params().line_items[0].price_data.product).toBe(veg.stripeTestProductId);
    expect(pricesRetrieve).not.toHaveBeenCalled();

    create.mockClear();
    const testId = veg.stripeTestProductId;
    delete veg.stripeTestProductId;
    try {
      const res = await call({ items: [{ id: VEG, quantity: 1 }] });
      expect(res.statusCode).toBe(500);
      expect(create).not.toHaveBeenCalled();
    } finally {
      veg.stripeTestProductId = testId;
    }
  });

  it('3 sopas: envío $50 como opción de envío con día y franja, y campo de código', async () => {
    const res = await call({ items: [{ id: VEG, quantity: 3 }] });
    expect(res.statusCode).toBe(200);
    const p = params();
    expect(shippingAmount()).toBe(5000);
    expect(p.shipping_options[0].shipping_rate_data.display_name).toMatch(/^Entrega lunes \d+ de \w+, 9–13 h$/);
    expect(p.line_items).toHaveLength(1);
    expect(p.line_items.some((l: any) => l.price_data.unit_amount === 5000)).toBe(false); // el envío no es una línea
    expect(p.allow_promotion_codes).toBe(true);
    expect(p.discounts).toBeUndefined();
  });

  it('6 vegetarianas ($750): envío $0', async () => {
    await call({ items: [{ id: VEG, quantity: 6 }] });
    expect(shippingAmount()).toBe(0);
    expect(params().metadata.free_shipping_reason).toBe('minAmount');
  });

  it('caja sola ($600): envío $50; caja + 1 sopa ($725): $0', async () => {
    await call({ items: [{ id: BOX, quantity: 1 }] });
    expect(shippingAmount()).toBe(5000);
    create.mockClear();
    await call({ items: [{ id: BOX, quantity: 1 }, { id: VEG, quantity: 1 }] });
    expect(shippingAmount()).toBe(0);
  });

  it('10 sopas: el servidor crea el cupón del 20% (solo sopas, sin la caja) y lo aplica', async () => {
    await call({ items: [{ id: VEG, quantity: 10 }] });
    const p = params();
    const coupon = couponsCreate.mock.calls[0][0];
    expect(coupon).toMatchObject({ percent_off: 20, duration: 'once' });
    expect(coupon.id).toMatch(/^ondo_bulk_20_[0-9a-f]{10}$/);
    const box = products.find(x => x._id === BOX);
    const soups = products.filter(x => !x.isBox && !x.onlySubscriptions);
    expect(coupon.applies_to.products).toHaveLength(new Set(soups.map(x => x.stripePriceId)).size);
    expect(coupon.applies_to.products).not.toContain(`prod_${box.stripePriceId}`);
    expect(p.discounts).toEqual([{ coupon: coupon.id }]);
    expect(p.allow_promotion_codes).toBeUndefined();
    expect(p.metadata.discount_type).toBe('bulk');
  });

  it('el cupón del 20% ya existe: no se vuelve a crear; mismo catálogo = mismo ID', async () => {
    await call({ items: [{ id: VEG, quantity: 10 }] });
    const firstId = couponsCreate.mock.calls[0][0].id;
    resetCatalogCache();
    couponsRetrieve.mockResolvedValue({ id: firstId });
    couponsCreate.mockClear();
    create.mockClear();
    await call({ items: [{ id: VEG, quantity: 12 }] });
    expect(couponsCreate).not.toHaveBeenCalled();
    expect(params().discounts).toEqual([{ coupon: firstId }]);
  });

  it('guarda fecha, franja, CP y descuento en la sesión y en el pago', async () => {
    await call({ items: [{ id: VEG, quantity: 2 }] });
    const p = params();
    expect(p.metadata).toMatchObject({
      delivery_date: nextDeliveryDate(), delivery_slot: 'slot_9_13', delivery_postal: '06700', discount_type: '',
    });
    expect(p.payment_intent_data.metadata).toEqual(p.metadata);
  });

  it('ignora precios y cupones que mande el navegador', async () => {
    await call({ items: [{ id: VEG, quantity: 2 }], couponId: 'HACK', cartItems: [{ productId: 'price_x', quantity: 1 }] });
    const p = params();
    expect(p.discounts).toBeUndefined();
    expect(p.line_items.map((l: any) => l.price)).not.toContain('price_x');
  });

  it('rechaza franja inválida, CP fuera de zona o mal escrito', async () => {
    expect((await call({ items: [{ id: VEG, quantity: 1 }], deliverySlot: 'slot_x' })).statusCode).toBe(400);
    expect((await call({ items: [{ id: VEG, quantity: 1 }], deliverySlot: undefined })).statusCode).toBe(400);
    expect((await call({ items: [{ id: VEG, quantity: 1 }], deliveryPostal: '01000' })).statusCode).toBe(400);
    expect((await call({ items: [{ id: VEG, quantity: 1 }], deliveryPostal: '067' })).statusCode).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it('si la fecha del navegador ya pasó el corte, devuelve la nueva fecha sin cobrar', async () => {
    const res = await call({ items: [{ id: VEG, quantity: 1 }], deliveryDate: '2020-01-06' });
    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ error: 'delivery_date_changed', deliveryDate: nextDeliveryDate() });
    expect(create).not.toHaveBeenCalled();
  });

  it('rechaza productos desconocidos, solo-suscripción y cantidades inválidas', async () => {
    expect((await call({ items: [{ id: 'nope', quantity: 1 }] })).statusCode).toBe(400);
    expect((await call({ items: [{ id: SUBS_ONLY, quantity: 1 }] })).statusCode).toBe(400);
    expect((await call({ items: [{ id: VEG, quantity: 0 }] })).statusCode).toBe(400);
    expect((await call({ items: [{ id: VEG, quantity: 2.5 }] })).statusCode).toBe(400);
    expect((await call({ items: [] })).statusCode).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });
});
