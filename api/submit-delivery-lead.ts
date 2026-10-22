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

  const payload = JSON.stringify({
    postalCode: clip(postalCode, 10),
    address: clip(address, 300),
    isServiceable: !!isServiceable,
    email: clip(email, 200),
    timestamp: new Date().toISOString(),
    source: 'Zona de reparto',
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
