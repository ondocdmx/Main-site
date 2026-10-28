// Servidor local para probar las funciones de `api/` sin desplegar (npm run server, puerto 3001).
// `npm run dev` (Vite, :3000) reenvía /api a este servidor. No hay lógica propia aquí:
// ejecuta los mismos archivos de `api/` que Vercel, para que lo que se prueba en local
// sea lo que corre en producción. En Vercel este archivo no se usa.
import 'dotenv/config'; // primero: las funciones de api/ leen las variables al importarse
import express from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import createCartCheckout from './api/create-cart-checkout';
import createCheckoutSession from './api/create-checkout-session';
import checkoutSummary from './api/checkout-summary';
import submitSoupLead from './api/submit-soup-lead';
import submitDeliveryLead from './api/submit-delivery-lead';

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;

const routes: Record<string, Handler> = {
  '/api/create-cart-checkout': createCartCheckout,
  '/api/create-checkout-session': createCheckoutSession,
  '/api/checkout-summary': checkoutSummary,
  '/api/submit-soup-lead': submitSoupLead,
  '/api/submit-delivery-lead': submitDeliveryLead,
};

const app = express();
app.use(express.json());

for (const [path, handler] of Object.entries(routes)) {
  // Express ya da req.method, req.body, res.status() y res.json(), que es lo que usan las funciones.
  app.all(path, (req, res) => handler(req as unknown as VercelRequest, res as unknown as VercelResponse));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ONDO API local en http://localhost:${PORT} (mismas funciones que api/ en Vercel)`);
});
