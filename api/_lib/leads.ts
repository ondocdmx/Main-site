// Almacenamiento de leads (zona de reparto y "¿Qué sopa amas más?").
// Archivo con prefijo "_": Vercel no lo publica como endpoint, solo lo importan las funciones.
//
// Destino principal: un repo PRIVADO de GitHub (LEADS_GITHUB_REPO, ej. "ondocdmx/ondo-leads"),
// un CSV por mes en leads/AAAA-MM.csv. El repo de la web es público: los leads NUNCA van ahí.
// Así el dueño se los puede preguntar a su Claude, que ya está conectado a su GitHub.

export type LeadRow = {
  tipo: 'zona-reparto' | 'sopa-deseada';
  codigo_postal?: string;
  direccion?: string;
  en_zona?: boolean;
  email?: string;
  sopa?: string;
};

const COLUMNS = ['fecha', 'tipo', 'codigo_postal', 'direccion', 'en_zona', 'email', 'sopa'] as const;
const HEADER = COLUMNS.join(',') + '\n';

const csvCell = (v: unknown) => {
  const s = String(v ?? '').replace(/\r?\n/g, ' ');
  return /[",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Fecha y mes en hora de CDMX (el mes del archivo es el del negocio, no UTC)
const nowMx = () => {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Mexico_City',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(new Date()); // "2026-10-22 09:15:03"
  return { fecha: parts, mes: parts.slice(0, 7) };
};

export async function saveLeadToGithub(lead: LeadRow): Promise<boolean> {
  const token = process.env.LEADS_GITHUB_TOKEN;
  const repo = process.env.LEADS_GITHUB_REPO;
  if (!token || !repo) {
    console.warn('Leads: LEADS_GITHUB_TOKEN / LEADS_GITHUB_REPO no configurados, lead no guardado en GitHub');
    return false;
  }

  const { fecha, mes } = nowMx();
  const row = { fecha, ...lead, en_zona: lead.en_zona === undefined ? '' : lead.en_zona ? 'si' : 'no' } as Record<string, unknown>;
  const line = COLUMNS.map(c => csvCell(row[c])).join(',') + '\n';

  const url = `https://api.github.com/repos/${repo}/contents/leads/${mes}.csv`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'ondo-web-leads',
  };

  // Lectura + escritura con el sha del archivo; si dos leads llegan a la vez,
  // GitHub rechaza el segundo (409/422) y se reintenta con el contenido nuevo.
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const current = await fetch(url, { headers });
      let sha: string | undefined;
      let content = HEADER;
      if (current.ok) {
        const data: any = await current.json();
        sha = data.sha;
        content = Buffer.from(data.content, 'base64').toString('utf8');
        if (content && !content.endsWith('\n')) content += '\n';
      } else if (current.status !== 404) {
        console.error('Leads: error leyendo', current.status, await current.text());
        return false;
      }

      const put = await fetch(url, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `lead ${lead.tipo} ${fecha}`,
          content: Buffer.from(content + line, 'utf8').toString('base64'),
          ...(sha ? { sha } : {}),
        }),
      });
      if (put.ok) return true;
      if (put.status !== 409 && put.status !== 422) {
        console.error('Leads: error escribiendo', put.status, await put.text());
        return false;
      }
    } catch (err) {
      console.error('Leads: error de red', err);
    }
    await new Promise(r => setTimeout(r, 300 + Math.random() * 700));
  }
  console.error('Leads: no se pudo guardar tras varios intentos');
  return false;
}

// Envío a una hoja de Google (Apps Script Web App).
// Apps Script responde con un 302 y Node convierte POST→GET al seguir la redirección:
// se sigue a mano y se vuelve a hacer POST a la URL final.
export async function postToSheets(webhookUrl: string, payload: unknown): Promise<boolean> {
  try {
    const body = JSON.stringify(payload);
    const first = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      redirect: 'manual',
      body,
    });
    if (first.status === 301 || first.status === 302) {
      const redirectUrl = first.headers.get('location');
      if (redirectUrl) {
        await fetch(redirectUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      }
    }
    return true;
  } catch (err) {
    console.error('Google Sheets webhook error:', err);
    return false;
  }
}
