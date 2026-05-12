import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { soupIdea, email } = req.body;

  if (!email) {
    res.status(400).json({ error: 'email is required' });
    return;
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    res.status(500).json({ error: 'GOOGLE_SHEETS_WEBHOOK_URL not configured' });
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        soupIdea: soupIdea || '',
        email,
        timestamp: new Date().toISOString(),
        source: '¿Qué sopa amas más?',
      }),
    });
    res.json({ ok: true });
  } catch (err: any) {
    console.error('Google Sheets webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}
