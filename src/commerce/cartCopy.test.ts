import { describe, expect, it } from 'vitest';
import { blockerMessage, cartTitle, checkoutBlocker, formatMXN, progressMessage } from './cartCopy.js';
import { priceCart, type PricedProduct } from './priceCart.js';

const veg: PricedProduct = { _id: 'veg', price: 125 };
const box: PricedProduct = { _id: 'box', price: 600, isBox: true };
const cart = (soups: number, boxes = 0) => priceCart([
  ...(soups ? [{ product: veg, quantity: soups }] : []),
  ...(boxes ? [{ product: box, quantity: boxes }] : []),
]);

describe('formatMXN', () => {
  it('sin centavos cuando es exacto, con separador de miles', () => {
    expect(formatMXN(45000)).toBe('$450');
    expect(formatMXN(106000)).toBe('$1,060');
    expect(formatMXN(38750)).toBe('$387.50');
  });
});

describe('cartTitle', () => {
  it('sopas, caja y mezcla', () => {
    expect(cartTitle(cart(3))).toBe('Tu carrito · 3 sopas');
    expect(cartTitle(cart(1))).toBe('Tu carrito · 1 sopa');
    expect(cartTitle(cart(0, 1))).toBe('Tu carrito · 1 caja');
    expect(cartTitle(cart(2, 1))).toBe('Tu carrito · 1 caja y 2 sopas');
    expect(cartTitle(cart(0))).toBe('Tu carrito · 0 sopas');
  });
});

describe('progressMessage', () => {
  it('sin envío gratis aún', () => {
    expect(progressMessage(cart(4))).toBe('Te faltan 3 sopas para envío gratis');
    expect(progressMessage(cart(6))).toBe('Te falta 1 sopa para envío gratis');
  });
  it('con envío gratis, camino al 20%', () => {
    expect(progressMessage(cart(8))).toBe('Ya tienes envío gratis. Te faltan 2 para 20% menos');
    expect(progressMessage(cart(9))).toBe('Ya tienes envío gratis. Te falta 1 para 20% menos');
  });
  it('envío gratis y 20%', () => {
    expect(progressMessage(cart(10))).toBe('Tienes envío gratis y 20% menos');
  });
  it('con caja', () => {
    expect(progressMessage(cart(2, 1))).toBe('Tu caja incluye envío gratis. Te faltan 7 para 20% menos');
    expect(progressMessage(cart(9, 1))).toBe('Tienes envío gratis y 20% menos');
  });
});

describe('checkoutBlocker', () => {
  it('explica qué falta', () => {
    expect(checkoutBlocker({ slot: null, postalValid: false, postalInZone: false })).toBe('slotAndPostal');
    expect(checkoutBlocker({ slot: 'slot_9_13', postalValid: false, postalInZone: false })).toBe('postal');
    expect(checkoutBlocker({ slot: null, postalValid: true, postalInZone: true })).toBe('slot');
    expect(checkoutBlocker({ slot: 'slot_9_13', postalValid: true, postalInZone: false })).toBe('outOfZone');
    expect(checkoutBlocker({ slot: 'slot_9_13', postalValid: true, postalInZone: true })).toBeNull();
    expect(blockerMessage('slot')).toBe('Elige una franja de entrega para continuar');
  });
});
