# Traspaso del proyecto ONDO — acceso y puesta en marcha

Este documento es para el momento de entregar el proyecto: qué accesos hay
que dar, en qué orden, y cómo arrancar a desarrollar el primer día.

> **Importante:** los documentos y el código se entregan con la carpeta del
> proyecto, pero las cuentas y permisos de abajo **hay que cederlos
> manualmente** — nadie puede hacerlo por ti. Sin esto, el nuevo
> desarrollador (humano o IA) no puede trabajar.

---

## 1. Qué hay que traspasar (7 accesos)

| # | Servicio | Qué ceder | Dónde se hace |
|---|---|---|---|
| 1 | **GitHub** | Propiedad del repo `ondocdmx/Main-site` (o admin al dueño) | Repo → Settings → Transfer ownership |
| 2 | **Vercel** | Propiedad del proyecto (hospedaje y deploys) | Proyecto → Settings → General → Transfer project. Las variables de entorno viajan con el proyecto: revisarlas tras transferir |
| 3 | **Sanity** | **No se cede**: el contenido ya vive en el repo (`src/content/`). El proyecto Sanity del desarrollador anterior se borra cuando la migración esté en producción y verificada (ver `docs/CONTEXTO-CLAUDE-DUENO.md` §6) | — |
| 4 | **Stripe** | La cuenta ya es del negocio; verificar que el dueño tiene acceso de admin | dashboard.stripe.com → Settings → Team |
| 5 | **Dominio** `ondoclub.com` | Acceso al registrador donde se compró | DNS apunta a Vercel — no tocar sin saber |
| 6 | **Google Analytics** | Admin de la propiedad GA4 | analytics.google.com → Admin → gestión de accesos |
| 7 | **Secretos** (`.env`) | Los valores de abajo, por gestor de contraseñas | **Nunca** por chat o email en claro |

---

## 2. Valores de `.env` (desarrollo local)

| Variable | De dónde sale |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys. Para pruebas usar la `sk_test_...` |
| `GOOGLE_SHEETS_WEBHOOK_URL` | URL del Apps Script (Google Sheets) que recibe el formulario "¿Qué sopa amas más?" y los leads de zona de reparto. Opcional en local |
| `GOOGLE_SHEETS_DELIVERY_WEBHOOK_URL` | Opcional: hoja aparte para los leads de zona de reparto. Si no existe, van a `GOOGLE_SHEETS_WEBHOOK_URL` con `source: "Zona de reparto"` |
| `FRONTEND_URL` | `http://localhost:3000` en local |
| `PORT` | Puerto del server local opcional (3001) |

## 3. Variables en Vercel (producción)

- `STRIPE_SECRET_KEY` — la **live** (`sk_live_...`)
- `FRONTEND_URL` — `https://www.ondoclub.com`
- `GOOGLE_SHEETS_WEBHOOK_URL` — Apps Script de Google Sheets (formulario de
  sopas + leads de zona de reparto). Opcional: `GOOGLE_SHEETS_DELIVERY_WEBHOOK_URL`
  para mandar los leads de zona a otra hoja.
- Tras la migración se **borran** `VITE_SANITY_PROJECT_ID`,
  `VITE_SANITY_DATASET` y `VITE_SANITY_WRITE_TOKEN` (ya no se usan).

---

## 4. Puesta en marcha día 1 (para el desarrollador o su Claude)

Requisitos: Node 20+.

```bash
git clone https://github.com/ondocdmx/Main-site.git ondo && cd ondo
npm install
cp .env.example .env    # rellenar con los valores de la sección 2
npm run dev             # web en http://localhost:3000
```

Flujo de trabajo diario:

1. Editar código → `npm run lint` (typecheck) → `npm run build` si quieres
   validar de verdad.
2. Commit: minúsculas, español, una línea describiendo el cambio.
3. `git push origin main` → **Vercel despliega solo** (1-2 min).
4. Cambios de contenido (textos, sopas, fotos, zonas de reparto): se editan
   los JSON de `src/content/` y las fotos de `public/images/cms/`, y se
   publican igual que el código (commit + push).

El mapa completo del proyecto está en `AGENTS.md` (léelo primero).

---

## 5. Verificación post-traspaso (15 minutos)

1. **Web**: hacer un push de prueba → vercel.com/dashboard muestra deploy
   "Ready" y `ondoclub.com` carga bien.
2. **Contenido**: cambiar un texto en `src/content/settings.json`, push, y
   verlo reflejado en la web.
3. **Pago**: en local con la `sk_test_...`, completar una compra con la
   tarjeta de test `4242 4242 4242 4242` (cualquier fecha futura) → llega
   al checkout de Stripe.
4. **Analítica**: entrar a la web y aparecer en GA4 → Informes en tiempo
   real.

---

## 6. Seguridad

- `sk_live_...` y tokens: solo por gestor de contraseñas.
- Si se rota la llave de Stripe: actualizar `.env` local + Vercel + redeploy.
- Cualquier variable `VITE_*` acaba en el código del navegador: nunca poner
  ahí nada secreto.
- Los tokens de Sanity que existieron (incluido el que estuvo escrito en
  `migrate-to-sanity.mjs`, visible en el historial del repo público) deben
  revocarse al borrar el proyecto Sanity.
