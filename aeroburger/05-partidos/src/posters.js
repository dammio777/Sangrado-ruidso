// Exporta los 4 afiches a PNG: node src/posters.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'); fs.mkdirSync(path.join(ROOT, 'out', 'afiches'), { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const NAMES = { '1': 'Mineiro-Boca', '2': 'Caldas-Nacional', '3': 'Nacional-Medellin' };
  for (const m of (process.argv[2] || '1,2').split(',')) for (const f of ['feed', 'story']) {
    const h = f === 'feed' ? 1350 : 1920;
    const p = await b.newPage({ viewport: { width: 1080, height: h }, deviceScaleFactor: 1 });
    p.on('pageerror', e => console.error(e.message));
    await p.goto('file://' + path.join(ROOT, 'src', 'poster.html') + `?m=${m}&f=${f}`); await p.evaluate(() => window.ready);
    const name = `${NAMES[m]}_${f === 'feed' ? 'publicacion' : 'historia'}.png`;
    await (await p.$('#c')).screenshot({ path: path.join(ROOT, 'out', 'afiches', 'AeroBurger_' + name) }); await p.close(); console.log(name);
  }
  await b.close();
})();
