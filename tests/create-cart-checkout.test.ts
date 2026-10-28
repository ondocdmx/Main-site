// Prueba el servidor del carrito sin llamar a Stripe: se intercepta la sesión que crearía.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const create = vi.fn();
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({ checkout: { sessions: { create } } })),
}));

const { default: handler } = await import('../api/create-cart-checkout');
const { COMMERCE } = await import('../src/commerce/config');

const VEG = 'gk8n1Y45KbppZEAYCEfG7O'; // mega-verde, $125
const BOX = '8ceb6e4e-f0ba-4c24-a9f4-32899bd3ebd2'; // ondo-box, $600
const SUBS_ONLY = '426a504e-5a54-4615-b7a3-298fd51de371'; // chowder, solo suscripción

async function call(body: any) {
  const res: any = { statusCode: 200, body: null };
  res.status = (c: number) => { res.statusCode = c; return res; };
  res.json = (b: any) => { res.body = b; return res; };
  await handler({ method: 'POST', body } as any, res);
  return res;
}

beforeEach(() => {
  create.mockReset();
  create.mockImplementation(async (p: any) => ({ id: 'cs_test', url: 'https://stripe.test', amount_total: null, params: p }));
});

describe('api/create-cart-checkout', () => {
  it('3 sopas: cobra envío y deja el campo de código', async () => {
    const res = await call({ items: [{ id: VEG, quantity: 3 }] });
    expect(res.statusCode).toBe(200);
    const p = create.mock.calls[0][0];
    expect(p.line_items).toContainEqual({ price: COMMERCE.shippingStripePriceId, quantity: 1 });
    expect(p.allow_promotion_codes).toBe(true);
    expect(p.discounts).toBeUndefined();
  });

  it('7 sopas: sin línea de envío', async () => {
    await call({ items: [{ id: VEG, quantity: 7 }] });
    const p = create.mock.calls[0][0];
    expect(p.line_items).toHaveLength(1);
    expect(p.payment_intent_data.metadata.free_shipping_reason).toBe('minSoups');
  });

  it('caja sola: sin envío', async () => {
    await call({ items: [{ id: BOX, quantity: 1 }] });
    expect(create.mock.calls[0][0].line_items).toHaveLength(1);
  });

  it('10 sopas: cupón del 20%, sin campo de código', async () => {
    await call({ items: [{ id: VEG, quantity: 10 }] });
    const p = create.mock.calls[0][0];
    expect(p.discounts).toEqual([{ coupon: COMMERCE.bulkDiscountCouponId }]);
    expect(p.allow_promotion_codes).toBeUndefined();
  });

  it('ignora precios y cupones que mande el navegador', async () => {
    await call({ items: [{ id: VEG, quantity: 2 }], couponId: 'HACK', cartItems: [{ productId: 'price_x', quantity: 1 }] });
    const p = create.mock.calls[0][0];
    expect(p.discounts).toBeUndefined();
    expect(p.line_items.map((l: any) => l.price)).not.toContain('price_x');
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
