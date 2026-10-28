// Prueba el servidor del carrito sin llamar a Stripe: se intercepta la sesión que crearía.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const create = vi.fn();
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({ checkout: { sessions: { create } } })),
}));

const { default: handler } = await import('../api/create-cart-checkout');
const { COMMERCE } = await import('../src/commerce/config');
const { nextDeliveryDate } = await import('../src/commerce/delivery');

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
  create.mockReset();
  create.mockImplementation(async () => ({ id: 'cs_test', url: 'https://stripe.test', amount_total: null }));
});

describe('api/create-cart-checkout', () => {
  it('Stripe en español, solo tarjeta, dirección en México', async () => {
    await call({ items: [{ id: VEG, quantity: 3 }] });
    const p = params();
    expect(p.locale).toBe('es-419');
    expect(p.payment_method_types).toEqual(['card']);
    expect(p.shipping_address_collection).toEqual({ allowed_countries: ['MX'] });
  });

  it('3 sopas: envío $50 como opción de envío con día y franja, y campo de código', async () => {
    const res = await call({ items: [{ id: VEG, quantity: 3 }] });
    expect(res.statusCode).toBe(200);
    const p = params();
    expect(shippingAmount()).toBe(5000);
    expect(p.shipping_options[0].shipping_rate_data.display_name).toMatch(/^Entrega lunes \d+ de \w+, 9–13 h$/);
    expect(p.line_items).toHaveLength(1);
    expect(p.allow_promotion_codes).toBe(true);
    expect(p.discounts).toBeUndefined();
  });

  it('7 sopas y caja sola: envío $0', async () => {
    await call({ items: [{ id: VEG, quantity: 7 }] });
    expect(shippingAmount()).toBe(0);
    expect(params().metadata.free_shipping_reason).toBe('minSoups');
    create.mockClear();
    await call({ items: [{ id: BOX, quantity: 1 }] });
    expect(shippingAmount()).toBe(0);
  });

  it('10 sopas: cupón del 20%, sin campo de código', async () => {
    await call({ items: [{ id: VEG, quantity: 10 }] });
    const p = params();
    expect(p.discounts).toEqual([{ coupon: COMMERCE.bulkDiscountCouponId }]);
    expect(p.allow_promotion_codes).toBeUndefined();
    expect(p.metadata.discount_type).toBe('bulk');
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
