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
| 3 | **Sanity** | Rol Owner en el proyecto `s3nnv28f` | sanity.io/manage → Members → invitar |
| 4 | **Stripe** | La cuenta ya es del negocio; verificar que el dueño tiene acceso de admin | dashboard.stripe.com → Settings → Team |
| 5 | **Dominio** `ondoclub.com` | Acceso al registrador donde se compró | DNS apunta a Vercel — no tocar sin saber |
| 6 | **Google Analytics** | Admin de la propiedad GA4 | analytics.google.com → Admin → gestión de accesos |
| 7 | **Secretos** (`.env`) | Los valores de abajo, por gestor de contraseñas | **Nunca** por chat o email en claro |

Para publicar el panel de administración (`ondo.sanity.studio`) hace falta
además `npx sanity login` (una sola vez) con una cuenta con acceso al
proyecto Sanity.

---

## 2. Valores de `.env` (desarrollo local)

| Variable | De dónde sale |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys. Para pruebas usar la `sk_test_...` |
| `VITE_SANITY_WRITE_TOKEN` | sanity.io/manage → API → Tokens (solo permiso de crear `deliveryLead`). Sin él, la web funciona pero no guarda leads de zona de reparto |
| `FRONTEND_URL` | `http://localhost:3000` en local |
| `PORT` | Puerto del server local opcional (3001) |

## 3. Variables en Vercel (producción)

- `STRIPE_SECRET_KEY` — la **live** (`sk_live_...`)
- `FRONTEND_URL` — `https://www.ondoclub.com`

---

## 4. Puesta en marcha día 1 (para el desarrollador o su Claude)

Requisitos: Node 20+.

```bash
git clone https://github.com/ondocdmx/Main-site.git ondo && cd ondo
npm install
cp .env.example .env    # rellenar con los valores de la sección 2
npm run dev             # web en http://localhost:3000

# Panel de administración (local):
cd studio && npm install && npm run dev
# Publicar cambios del panel:
npm run deploy          # requiere `npx sanity login` antes (una vez)
```

Flujo de trabajo diario:

1. Editar código → `npm run lint` (typecheck) → `npm run build` si quieres
   validar de verdad.
2. Commit: minúsculas, español, una línea describiendo el cambio.
3. `git push origin main` → **Vercel despliega solo** (1-2 min).
4. Si se tocó el schema de Sanity (`studio/schemaTypes/`) → además
   `cd studio && npm run deploy`.
5. Cambios de contenido (textos, sopas, fotos) no requieren code: directo
   en `ondo.sanity.studio` + Publish.

El mapa completo del proyecto está en `AGENTS.md` (léelo primero).

---

## 5. Verificación post-traspaso (15 minutos)

1. **Web**: hacer un push de prueba → vercel.com/dashboard muestra deploy
   "Ready" y `ondoclub.com` carga bien.
2. **Panel**: abrir `ondo.sanity.studio`, cambiar un texto, Publish, verlo
   reflejado en la web.
3. **Pago**: en local con la `sk_test_...`, completar una compra con la
   tarjeta de test `4242 4242 4242 4242` (cualquier fecha futura) → llega
   al checkout de Stripe.
4. **Analítica**: entrar a la web y aparecer en GA4 → Informes en tiempo
   real.

---

## 6. Seguridad

- `sk_live_...` y tokens: solo por gestor de contraseñas.
- Si se rota la llave de Stripe: actualizar `.env` local + Vercel + redeploy.
- `VITE_SANITY_WRITE_TOKEN` viaja en el código del navegador por diseño
  (tiene permisos mínimos), pero no exhibirlo en docs públicas.
