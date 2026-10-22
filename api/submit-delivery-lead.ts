import type { VercelRequest, VercelResponse } from '@vercel/node';
import { saveLeadToGithub, postToSheets } from './_lib/leads.js';

// Leads de zona de reparto (validación de código postal) -> repo privado de leads (GitHub).
// Son datos personales: nunca van al repo público de la web.
// Opcional: GOOGLE_SHEETS_DELIVERY_WEBHOOK_URL los copia además a una hoja propia.
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

  // Recorte defensivo: el endpoint es público
  const clip = (v: unknown, max: number) => String(v ?? '').slice(0, max);
  const lead = {
    codigo_postal: clip(postalCode, 10),
    direccion: clip(address, 300),
    en_zona: !!isServiceable,
    email: clip(email, 200),
  };

  // Mientras el repo de leads no esté configurado, se sigue usando la hoja del
  // formulario de sopas (como antes) para no perder leads.
  const githubConfigured = !!(process.env.LEADS_GITHUB_TOKEN && process.env.LEADS_GITHUB_REPO);
  const sheetsUrl = process.env.GOOGLE_SHEETS_DELIVERY_WEBHOOK_URL
    || (githubConfigured ? undefined : process.env.GOOGLE_SHEETS_WEBHOOK_URL);

  const [githubOk, sheetsOk] = await Promise.all([
    saveLeadToGithub({ tipo: 'zona-reparto', ...lead }),
    sheetsUrl
      ? postToSheets(sheetsUrl, {
          postalCode: lead.codigo_postal,
          address: lead.direccion,
          isServiceable: lead.en_zona,
          email: lead.email,
          timestamp: new Date().toISOString(),
          source: 'Zona de reparto',
        })
      : Promise.resolve(false),
  ]);

  if (!githubOk && !sheetsOk) {
    res.status(500).json({ error: 'lead not saved (configurar LEADS_GITHUB_TOKEN y LEADS_GITHUB_REPO)' });
    return;
  }
  res.json({ ok: true });
}
