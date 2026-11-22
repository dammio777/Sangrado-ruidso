// Renderizador común de los videos de Aero Burger (Playwright + ffmpeg).
// Uso:
//   node src/render.js stills 0.3 1.0 ...      -> out/stills/t_XX.png
//   node src/render.js video [fps]              -> out/$OUT (video_noaudio.mp4 por defecto)
// Variables de entorno:
//   PAGE=archivo.html (index.html)   THEME=dark|light|mesa (?theme=)   OUT=nombre.mp4
//   LOSSLESS=1 (capturas PNG)   CRF=15   TIMESCALE=1.35 (todo 35 % más lento: animación, cortes y video)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(process.cwd());
const URL = 'file://' + path.join(ROOT, 'src', process.env.PAGE || 'index.html') + (process.env.THEME ? '?theme=' + process.env.THEME : '');
const TS = parseFloat(process.env.TIMESCALE || '1');

(async () => {
  const [mode, ...args] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('[pageerror]', e.message));
  await page.goto(URL);
  await page.evaluate(() => window.ready);
  const canvas = await page.$('#c');
  fs.mkdirSync(path.join(ROOT, 'out', 'stills'), { recursive: true });
  if (mode === 'stills') {
    for (const a of args) {
      const t = parseFloat(a);   // tiempo del video final (ya escalado)
      await page.evaluate(t => window.seek(t), t / TS);
      await canvas.screenshot({ path: path.join(ROOT, 'out', 'stills', `t_${t.toFixed(2)}.png`) });
    }
  } else {
    const fps = parseInt(args[0] || '60', 10);
    const dur = await page.evaluate(() => window.DURATION);
    const N = Math.round(dur * TS * fps);
    const out = path.join(ROOT, 'out', process.env.OUT || 'video_noaudio.mp4');
    const FMT = process.env.LOSSLESS ? 'png' : 'jpeg';
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', FMT === 'png' ? 'png' : 'mjpeg', '-i', '-',
      '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', process.env.CRF || '15', '-tune', 'film', '-profile:v', 'high',
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
      '-r', String(fps), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = 0; i < N; i++) {
      await page.evaluate(t => window.seek(t), i / fps / TS);
      const buf = FMT === 'png' ? await canvas.screenshot({ type: 'png' }) : await canvas.screenshot({ type: 'jpeg', quality: 96 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 240 === 0) console.log(`frame ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('done', out, `${(N / fps).toFixed(2)}s`);
  }
  await browser.close();
})();
