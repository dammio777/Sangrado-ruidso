// Renderiza las 2 láminas del carrusel: node src/render.js  -> out/estoy_a_esto_1.png / _2.png (1080x1350, x2 opcional con SCALE=2)
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const sc = parseInt(process.env.SCALE || '1', 10), browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: sc });
  page.on('pageerror', e => console.error('[pageerror]', e.message)); page.on('console', m => m.type() === 'error' && console.error('[console]', m.text()));
  for (const s of (process.argv[2] || '1,2').split(',')) {
    await page.goto('file://' + path.resolve('src/hand.html') + '?s=' + s); await page.evaluate(() => window.ready);
    await (await page.$('#c')).screenshot({ path: `out/estoy_a_esto_${s}.png` }); console.log('lámina', s);
  }
  await browser.close();
})();
