// Social share card for a page: the top 1200x630 of the page at 2x, saved to assets/og/og-<page>.png
// (index -> og-home.png). Run from anywhere:  NODE_PATH=/opt/node22/lib/node_modules node ogcap.js interviews
// Waits for the .brand wordmark and fonts, closes the newsletter pop-up, scrolls to the top.
const { chromium } = require('playwright');
const pages = process.argv.slice(2);
const ROOT = require('path').resolve(__dirname, '../../../..');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const pg of pages) {
    const p = await b.newPage({ viewport:{width:1200,height:630}, deviceScaleFactor:2 });
    await p.route('**', r => { const u = r.request().url();
      return (u.startsWith('file:')||u.startsWith('data:')||u.includes('fonts.googleapis.com')||u.includes('fonts.gstatic.com')) ? r.continue() : r.abort(); });
    p.on('pageerror', () => {});
    await p.goto('file://' + ROOT + '/' + pg + '.html', { waitUntil:'commit', timeout:60000 });
    await p.waitForSelector('.brand', { timeout:45000 }).catch(()=>{});
    await Promise.race([p.evaluate(() => document.fonts.ready), new Promise(r=>setTimeout(r,5000))]).catch(()=>{});
    await p.waitForTimeout(2000);
    const cl = await p.$('#nlClose'); if (cl) { await cl.click().catch(()=>{}); await p.waitForTimeout(250); }
    await p.evaluate(() => window.scrollTo(0,0)); await p.waitForTimeout(250);
    const info = await p.evaluate(() => { const el=document.querySelector('.brand');
      return { brand: el?el.textContent.trim().slice(0,18):'-', font: el?getComputedStyle(el).fontFamily.split(',')[0].replace(/['"]/g,''):'-' }; });
    const out = pg === 'index' ? 'og-home' : 'og-' + pg;
    await p.screenshot({ path: ROOT + '/assets/og/' + out + '.png' });
    console.log(out.padEnd(22), info.brand.padEnd(17), 'font:', info.font);
    await p.close();
  }
  await b.close();
})();
