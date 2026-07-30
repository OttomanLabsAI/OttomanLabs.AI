/* Cloudflare Worker entry — this site deploys as a Worker with static
   assets, not as Cloudflare Pages, so the Pages-only functions/ directory
   convention never runs here. This script is the /api/* layer: it hands
   the API routes to the same handlers the functions/ files export, and
   everything else to the static asset server. */

import * as sec from './functions/api/sec.js';
import * as subscribe from './functions/api/subscribe.js';

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;

    if (path === '/api/sec' && request.method === 'GET') {
      return sec.onRequestGet({ request });
    }
    if (path === '/api/subscribe') {
      if (request.method === 'GET') return subscribe.onRequestGet({ request });
      if (request.method === 'POST') return subscribe.onRequestPost({ request });
      return new Response(JSON.stringify({ ok: false, msg: 'Use GET or POST.' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Allow': 'GET, POST' }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
