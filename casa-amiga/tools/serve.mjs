// Servidor estático mínimo: dist/ primero, luego assets/ (cuadros y config generados).
// POST /frame/<w> → escribe los bytes RGBA crudos en el stdin del ffmpeg del worker <w>.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.css': 'text/css' };

export function serve(sinks = new Map()) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    if (req.method === 'POST' && url.pathname.startsWith('/frame/')) {
      const sink = sinks.get(url.pathname.slice(7));
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => {
        const b = Buffer.concat(chunks);
        const ok = sink ? sink(b, Number(url.searchParams.get('i') ?? -1)) : Promise.resolve();
        Promise.resolve(ok).then(() => { res.writeHead(204); res.end(); });
      });
      return;
    }
    let p = decodeURIComponent(url.pathname);
    if (p === '/') p = '/index.html';
    for (const base of [path.join(ROOT, 'dist'), path.join(ROOT, 'assets')]) {
      const f = path.join(base, p);
      if (f.startsWith(base) && fs.existsSync(f) && fs.statSync(f).isFile()) {
        res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'max-age=3600' });
        fs.createReadStream(f).pipe(res);
        return;
      }
    }
    res.writeHead(404); res.end();
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}
