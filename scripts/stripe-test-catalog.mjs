#!/usr/bin/env node
// Crea en Stripe MODO TEST un Product por cada sopa de src/content/products.json y escribe su ID
// en `stripeTestProductId`. Sin esto el carrito no puede cobrar en modo test (las Preview de Vercel).
//
//   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-test-catalog.mjs
//
// Se puede correr las veces que haga falta: busca cada sopa por metadata.ondo_id y solo crea las que
// faltan (al añadir una sopa nueva, córrelo otra vez). Se niega a correr con una clave live.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Stripe from 'stripe';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'src/content/products.json');

const key = process.env.STRIPE_SECRET_KEY || '';
if (!/^(sk|rk)_test_/.test(key)) {
  console.error('Usa una clave de MODO TEST (sk_test_…). Este script nunca toca el catálogo live.');
  process.exit(1);
}
const stripe = new Stripe(key, { apiVersion: '2024-06-20' });

const text = await readFile(FILE, 'utf8');
const products = JSON.parse(text);

// Products de test que ya existen, por ondo_id
const existing = new Map();
for await (const p of stripe.products.list({ limit: 100 })) {
  if (p.metadata?.ondo_id) existing.set(p.metadata.ondo_id, p.id);
}

const ids = [];
for (const p of products) {
  let id = existing.get(p._id);
  if (!id) {
    const created = await stripe.products.create({
      name: p.title?.es || p.slug,
      metadata: { ondo_id: p._id, slug: p.slug },
    });
    id = created.id;
    console.log(`creado   ${p.slug} → ${id}`);
  } else {
    console.log(`existe   ${p.slug} → ${id}`);
  }
  ids.push(id);
}

// Escribe/actualiza "stripeTestProductId" justo después de "stripePriceId", sin reformatear el archivo.
let i = -1;
const lines = text.split('\n');
const out = [];
for (const line of lines) {
  if (/^    "stripeTestProductId": /.test(line)) continue;
  out.push(line);
  if (/^    "stripePriceId": /.test(line)) {
    i += 1;
    out.push(`    "stripeTestProductId": "${ids[i]}",`);
  }
}
if (i !== products.length - 1) {
  console.error(`No se encontró "stripePriceId" en todas las sopas (${i + 1}/${products.length}). No se escribió nada.`);
  process.exit(1);
}
JSON.parse(out.join('\n')); // sigue siendo JSON válido
await writeFile(FILE, out.join('\n'));
console.log(`\nListo: ${products.length} sopas con stripeTestProductId en src/content/products.json`);
