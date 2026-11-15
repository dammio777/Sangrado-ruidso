// Uso:
//   node src/render.js stills 0.3 1.0 2.0 ...   -> out/stills/t_XX.png
//   node src/render.js video [fps]               -> out/video_noaudio.mp4
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const URL = 'file://' + path.join(ROOT, 'src', 'index.html') + (process.env.THEME ? '?theme=' + process.env.THEME : '');

(async () => {
  const [mode, ...args] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => console.error('[pageerror]', e.message));
  await page.goto(URL);
  await page.evaluate(() => window.ready);
  const canvas = await page.$('#c');
  fs.mkdirSync(path.join(ROOT, 'out', 'stills'), { recursive: true });

  if (mode === 'stills') {
    for (const a of args) {
      const t = parseFloat(a);
      await page.evaluate(t => window.seek(t), t);
      await canvas.screenshot({ path: path.join(ROOT, 'out', 'stills', `t_${t.toFixed(2)}.png`) });
    }
  } else {
    const fps = parseInt(args[0] || '60', 10);
    const dur = await page.evaluate(() => window.DURATION);
    const N = Math.round(dur * fps);
    const out = path.join(ROOT, 'out', process.env.OUT || 'video_noaudio.mp4');
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', '-r', String(fps), '-movflags', '+faststart', out],
      { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = 0; i < N; i++) {
      const t = i / fps;
      await page.evaluate(t => window.seek(t), t);
      const buf = await canvas.screenshot({ type: 'jpeg', quality: 96 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 120 === 0) console.log(`frame ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('done', out);
  }
  await browser.close();
})();
