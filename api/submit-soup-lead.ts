import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@sanity/client';

const sanityWriteClient = createClient({
  projectId: 's3nnv28f',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-04-24',
  token: process.env.SANITY_WRITE_TOKEN,
});

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

  // Write to Sanity
  try {
    await sanityWriteClient.create({
      _type: 'soupRequest',
      soupIdea: soupIdea || '',
      email,
      createdAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Sanity write error:', err);
    res.status(500).json({ error: 'Failed to save lead: ' + err.message });
    return;
  }

  // Send to Google Sheets (best-effort, don't fail the request if this errors)
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (webhookUrl) {
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
    } catch (err) {
      console.error('Google Sheets webhook error:', err);
    }
  }

  res.json({ ok: true });
}
