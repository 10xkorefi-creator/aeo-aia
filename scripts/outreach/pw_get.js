const { chromium } = require('playwright');
(async () => {
  const urls = process.argv.slice(2); const b = await chromium.launch(); const out = {};
  const ctx = await b.newContext({userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', viewport:{width:1366,height:900}});
  for (const u of urls) { const p = await ctx.newPage(); try { const r = await p.goto(u,{waitUntil:'domcontentloaded',timeout:30000}); await p.waitForTimeout(2500); out[u] = {status:r?r.status():0, html: await p.content()}; } catch(e){ out[u]={status:0,html:''}; } await p.close(); }
  await b.close(); process.stdout.write(JSON.stringify(out));
})();
