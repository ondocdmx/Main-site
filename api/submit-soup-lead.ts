import type { VercelRequest, VercelResponse } from '@vercel/node';
import { saveLeadToGithub, postToSheets } from './_lib/leads.js';

// Formulario "¿Qué sopa amas más?" -> repo privado de leads (GitHub) + Google Sheets.
// Basta con que uno de los dos destinos lo guarde para responder ok.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { soupIdea, email } = req.body || {};

  if (!email) {
    res.status(400).json({ error: 'email is required' });
    return;
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  const [githubOk, sheetsOk] = await Promise.all([
    saveLeadToGithub({
      tipo: 'sopa-deseada',
      email: String(email).slice(0, 200),
      sopa: String(soupIdea || '').slice(0, 500),
    }),
    webhookUrl
      ? postToSheets(webhookUrl, {
          soupIdea: soupIdea || '',
          email,
          timestamp: new Date().toISOString(),
          source: '¿Qué sopa amas más?',
        })
      : Promise.resolve(false),
  ]);

  if (!githubOk && !sheetsOk) {
    res.status(500).json({ error: 'lead not saved (GitHub y Google Sheets no disponibles)' });
    return;
  }
  res.json({ ok: true });
}
