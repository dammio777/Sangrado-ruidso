// Compone el texto animado (capa transparente de overlay.html) sobre el video real y mezcla la música.
// Uso:  node src/render_enganche.js stills <variante> <t1> <t2> ...        -> out/stills_<variante>/t_XX.png (RGBA)
//       node src/render_enganche.js video  <variante> <base.mp4> <musica.wav> <salida.mp4> [fps=30]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(process.cwd());
(async () => {
  const [mode, variant, ...args] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('[pageerror]', e.message));
  await page.goto('file://' + path.join(ROOT, 'src', 'overlay.html') + '?v=' + variant);
  await page.evaluate(() => window.ready);
  const canvas = await page.$('#c');
  const shot = async t => { await page.evaluate(t => window.seek(t), t); return canvas.screenshot({ type: 'png', omitBackground: true }); };
  if (mode === 'stills') {
    const dir = path.join(ROOT, 'out', 'stills_' + variant); fs.mkdirSync(dir, { recursive: true });
    for (const a of args) fs.writeFileSync(path.join(dir, `t_${parseFloat(a).toFixed(2)}.png`), await shot(parseFloat(a)));
  } else {
    const [base, audio, out, fpsArg] = args; const fps = parseInt(fpsArg || '30', 10);
    const dur = await page.evaluate(() => window.DURATION), N = Math.round(dur * fps);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-i', base, '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-', '-i', audio,
      '-filter_complex', '[1:v]scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuva420p[ov];[0:v][ov]overlay=0:0:format=yuv420:shortest=1[v]',
      '-map', '[v]', '-map', '2:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', '-r', String(fps),
      '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-t', dur.toFixed(3), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < N; i++) {
      const buf = await shot(i / fps);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
    console.log('done', out, dur.toFixed(2) + 's');
  }
  await browser.close();
})();
