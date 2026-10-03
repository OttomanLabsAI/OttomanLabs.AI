// Render an interview page and check it: every tab at desktop / tablet / phone, light and dark.
//   NODE_PATH=/opt/node22/lib/node_modules node shoot.js /abs/path/page.html OUTDIR
// Prints, per width and tab: page scroll width vs viewport (must match: no sideways scroll),
// panel visible, panel height; then whether arrow keys still move between tabs, whether
// "Expand all" opens every dropdown, and any page errors. Screenshots go to OUTDIR.
// Network is blocked except file:, data: and Google Fonts (the sandbox can't reach the rest).
const { chromium } = require('playwright');
const [page, OUT] = process.argv.slice(2);
if (!page || !OUT) { console.log('usage: node shoot.js /abs/page.html OUTDIR'); process.exit(1); }
require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [name, w, theme] of [['desk', 1440, 'light'], ['dark', 1440, 'dark'], ['tab', 820, 'light'], ['mob', 390, 'light']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    if (theme === 'dark') await ctx.addInitScript(() => { try { localStorage.setItem('ol-theme', 'dark'); } catch (e) {} });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.route('**/*', r => { const u = r.request().url(); (u.startsWith('file:') || u.startsWith('data:') || /fonts\.g/.test(u)) ? r.continue() : r.abort(); });
    await p.goto('file://' + page, { waitUntil: 'load' });
    const nl = await p.$('#nlClose'); if (nl && await nl.isVisible()) await nl.click();
    const tabs = await p.$$eval('[role="tab"]', ts => ts.map(t => [t.id, t.getAttribute('aria-controls')]));
    for (const [tid, pid] of tabs) {
      await p.click('#' + tid);
      await p.evaluate(pid => document.querySelectorAll('#' + pid + ' img').forEach(i => i.loading = 'eager'), pid);
      await p.waitForFunction(pid => [...document.querySelectorAll('#' + pid + ' img')].every(i => i.complete), pid);
      const r = await p.evaluate(pid => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
        visible: !document.getElementById(pid).hidden, h: document.getElementById(pid).offsetHeight }), pid);
      console.log(name, pid, JSON.stringify(r));
      await (await p.$('#' + pid)).screenshot({ path: `${OUT}/${name}-${pid}.png` });
    }
    await p.focus('#' + tabs[0][0]); await p.keyboard.press('ArrowRight');
    const keys = await p.evaluate(id => !document.getElementById(id).hidden, tabs[1][1]);
    await p.click('#' + tabs[0][0]);
    const all = await p.$('.jd-all'); let expand = 'n/a';
    if (all) { await all.click(); expand = await p.evaluate(() => [...document.querySelectorAll('.jd-list details')].every(d => d.open)); await all.click(); }
    console.log(name, 'arrow keys move tabs:', keys, '· expand all opens every point:', expand, '· page errors:', JSON.stringify(errs));
    await ctx.close();
  }
  await b.close();
})();
