import { describe, expect, it } from 'vitest';
import { blockerMessage, boxShippingNote, cartCountLabel, cartTitle, deliveryPromise, offerLine, checkoutBlocker, formatMXN, progressMessage } from './cartCopy.js';
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
  it('barra del carrito: sin "Tu carrito", también en inglés', () => {
    expect(cartCountLabel(cart(2, 1))).toBe('1 caja y 2 sopas');
    expect(cartCountLabel(cart(1), 'en')).toBe('1 soup');
  });
});

describe('progressMessage', () => {
  it('lejos del envío gratis: cuánto falta en pesos', () => {
    expect(progressMessage(cart(3))).toBe('Te faltan $350 para envío gratis');
  });
  it('a 1 sopa del envío gratis', () => {
    expect(progressMessage(cart(5))).toBe('Agrega 1 sopa más y tu envío es gratis');
    expect(progressMessage(cart(0, 1))).toBe('Agrega 1 sopa más y tu envío es gratis');
  });
  it('con envío gratis, camino al 20%', () => {
    expect(progressMessage(cart(8))).toBe('Ya tienes envío gratis. Te faltan 2 para 20% menos');
    expect(progressMessage(cart(9))).toBe('Ya tienes envío gratis. Te falta 1 para 20% menos');
    expect(progressMessage(cart(2, 1))).toBe('Ya tienes envío gratis. Te faltan 7 para 20% menos');
  });
  it('envío gratis y 20%', () => {
    expect(progressMessage(cart(10))).toBe('Tienes envío gratis y 20% menos');
    expect(progressMessage(cart(9, 1))).toBe('Tienes envío gratis y 20% menos');
  });
});

describe('boxShippingNote', () => {
  it('caja de $600: le falta 1 sopa para el envío gratis', () => {
    expect(boxShippingNote(60000)).toBe('+ envío, o gratis si agregas 1 sopa');
    expect(boxShippingNote(60000, 'en')).toBe('+ shipping, or free if you add 1 soup');
  });
  it('si la caja sola llega al mínimo, no hay nota', () => {
    expect(boxShippingNote(80000)).toBe('');
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

describe('ficha de producto', () => {
  it('corte y fecha de entrega', () => {
    expect(deliveryPromise('2026-11-02')).toBe('Pide antes del domingo 23:59 y llega el lunes 2 de noviembre');
    expect(deliveryPromise('2026-11-02', 'en')).toBe('Order by Sunday 23:59 and it arrives Monday, November 2');
  });
  it('línea de ofertas desde settings.json', () => {
    expect(offerLine()).toBe('Envío gratis desde $725 · 20% menos desde 10 sopas');
    expect(offerLine('en')).toBe('Free shipping from $725 · 20% off from 10 soups');
  });
});
