// Uso: node render.js preview t1,t2,...  -> PNGs en scratch/preview
//      node render.js video salida.mp4 [fps]  -> renderiza el video completo (sin audio)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

(async () => {
  const mode = process.argv[2];
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-web-security'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, process.env.PAGE || 'video.html'));
  await page.evaluate(async () => {
    for (const f of ['400 20px Inter', '600 20px Inter', '800 20px Inter', '400 20px Anton', '400 20px "Space Mono"', '700 20px "Space Mono"', '400 20px "Great Vibes"', '400 20px "Alfa Slab One"', '400 20px "Special Elite"', '400 20px "Libre Baskerville"', 'italic 400 20px "Libre Baskerville"', '700 20px "Libre Baskerville"']) await document.fonts.load(f);
    await document.fonts.ready;
  });
  await page.waitForTimeout(500);
  if (mode === 'preview') {
    const out = process.env.PREVIEW_DIR;
    fs.mkdirSync(out, { recursive: true });
    for (const t of process.argv[3].split(',').map(Number)) {
      await page.evaluate(t => window.render(t), t);
      await page.screenshot({ path: `${out}/t${t.toFixed(2)}.jpg`, type: 'jpeg', quality: 85 });
    }
  } else {
    const outFile = process.argv[3];
    const fps = Number(process.argv[4] || 30);
    const dur = await page.evaluate(() => window.DUR);
    const n = Math.round(dur * fps);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      await page.evaluate(t => window.render(t), i / fps);
      const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 60 === 0) console.log(`frame ${i}/${n} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
