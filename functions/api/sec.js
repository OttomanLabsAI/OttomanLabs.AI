/* Cloudflare Pages Function: the site's own EDGAR relay.
   Browsers can't declare the User-Agent the SEC asks for, and sec.gov
   sends no CORS headers — so the pyBuffet ledger calls /api/sec?url=…
   on this domain and the hop to the SEC happens here, with the site's
   identity declared. Locked to SEC hosts only. */

const ALLOWED_HOSTS = new Set(['www.sec.gov', 'data.sec.gov']);
const IDENTITY = 'web@ottomanlabs.ai';

export async function onRequestGet({ request }) {
  const raw = new URL(request.url).searchParams.get('url') || '';
  let target;
  try { target = new URL(raw); } catch (e) { return err('Bad url parameter.', 400); }
  if (target.protocol !== 'https:' || !ALLOWED_HOSTS.has(target.hostname)) {
    return err('Only SEC hosts are relayed.', 403);
  }
  try {
    const r = await fetch(target.toString(), {
      headers: { 'User-Agent': IDENTITY, 'Accept': 'application/json,*/*' },
      cf: { cacheTtl: 300, cacheEverything: true }
    });
    const h = new Headers();
    h.set('Content-Type', r.headers.get('Content-Type') || 'application/json');
    h.set('Access-Control-Allow-Origin', '*');
    h.set('Cache-Control', 'public, max-age=300');
    return new Response(r.body, { status: r.status, headers: h });
  } catch (e) {
    return err('Could not reach the SEC — try again in a moment.', 502);
  }
}

function err(msg, status) {
  return new Response(JSON.stringify({ ok: false, msg: msg }), {
    status: status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
