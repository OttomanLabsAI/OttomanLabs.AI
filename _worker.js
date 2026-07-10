/* Cloudflare Pages advanced-mode worker.
   Serves /api/subscribe first-party (so ad-blockers never see a Mailchimp
   request) and hands every other request to the static site untouched.
   This file supersedes the functions/ directory when both are present. */

const MC_ENDPOINT = 'https://moneyafterdark.us17.list-manage.com/subscribe/post-json';
const MC_U = '9a95e7b3013f3d844b00eb3f0';
const MC_LIST = 'd15601aa5d';
const MC_FORM = '00cccae3f0';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/dashboard' || url.pathname === '/dashboard.html') {
      return Response.redirect(url.origin + '/gherkin', 301);
    }
    if (url.pathname === '/api/subscribe') {
      if (request.method === 'POST') return subscribe(request);
      if (request.method === 'GET') {
        return respond(false, 'The signup service is live — it answers to POSTs from the site’s signup forms.');
      }
      return respond(false, 'POST only.', 405);
    }
    return env.ASSETS.fetch(request);
  }
};

async function subscribe(request) {
  let email = '';
  try { email = String((await request.json()).email || '').trim(); } catch (e) {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return respond(false, 'That email address doesn’t look right.', 400);
  }
  const qs = new URLSearchParams({ u: MC_U, id: MC_LIST, f_id: MC_FORM, EMAIL: email, c: 'cb' });
  qs.set('b_' + MC_U + '_' + MC_LIST, '');   /* honeypot, empty like the real form */
  try {
    const r = await fetch(MC_ENDPOINT + '?' + qs.toString());
    const text = await r.text();
    /* post-json replies as JSONP: cb({"result":"success","msg":"..."}) */
    const m = text.match(/^\s*cb\((.*)\)\s*;?\s*$/s);
    const data = m ? JSON.parse(m[1]) : null;
    if (!data || !data.result) {
      return respond(false, 'Mailchimp gave an unexpected reply — try again in a moment.', 502);
    }
    const ok = data.result === 'success';
    return respond(ok, String(data.msg || (ok ? '' : 'Mailchimp rejected the signup without saying why.')));
  } catch (e) {
    return respond(false, 'Could not reach Mailchimp — try again in a moment.', 502);
  }
}

function respond(ok, msg, status = 200) {
  return new Response(JSON.stringify({ ok: ok, msg: msg }), {
    status: status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
