import type { VercelRequest, VercelResponse } from '@vercel/node';

// Leads de zona de reparto (validación de código postal) -> Google Sheets.
// Antes se guardaban en Sanity (deliveryLead). Son datos personales: solo van a la hoja.
// Usa GOOGLE_SHEETS_DELIVERY_WEBHOOK_URL si existe (hoja propia); si no, la misma
// GOOGLE_SHEETS_WEBHOOK_URL del formulario de sopas, distinguiendo por `source`.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { address, postalCode, isServiceable, email } = req.body || {};

  if (!postalCode) {
    res.status(400).json({ error: 'postalCode is required' });
    return;
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_DELIVERY_WEBHOOK_URL || process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    res.status(500).json({ error: 'GOOGLE_SHEETS_WEBHOOK_URL not configured' });
    return;
  }

  // Recorte defensivo: el endpoint es público
  const clip = (v: unknown, max: number) => String(v ?? '').slice(0, max);

  // El Apps Script de la hoja "Customer Database" solo escribe 4 columnas:
  // Timestamp (timestamp) · Email (email) · Sopa que ama (soupIdea) · Fuente (source).
  // El detalle del lead va en `soupIdea` para que quede legible sin tocar el script.
  const detail = [
    `CP ${clip(postalCode, 10)}`,
    isServiceable ? 'EN ZONA' : 'FUERA DE ZONA',
    clip(address, 300).replace(/\s+/g, ' ').trim(),
  ].filter(Boolean).join(' · ');

  const payload = JSON.stringify({
    soupIdea: detail,
    email: clip(email, 200),
    timestamp: new Date().toISOString(),
    source: 'Zona de reparto',
    // Campos sueltos por si algún día el script los guarda en columnas propias
    postalCode: clip(postalCode, 10),
    address: clip(address, 300),
    isServiceable: !!isServiceable,
  });

  try {
    // Apps Script Web Apps redirect (302) and Node.js converts POST→GET on redirect.
    // We follow the redirect manually and re-POST to the final URL.
    const firstResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'manual',
      body: payload,
    });

    if (firstResponse.status === 301 || firstResponse.status === 302) {
      const redirectUrl = firstResponse.headers.get('location');
      if (redirectUrl) {
        await fetch(redirectUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        });
      }
    }

    res.json({ ok: true });
  } catch (err: any) {
    console.error('Google Sheets webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}
