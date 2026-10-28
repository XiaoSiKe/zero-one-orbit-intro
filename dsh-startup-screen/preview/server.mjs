import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const port = Number(process.env.PORT || 4178);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
};

const server = createServer(async (req, res) => {
  const fail = (status, message) => {
    res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(req.method === 'HEAD' ? undefined : message);
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    fail(405, 'Method not allowed');
    return;
  }
  let pathname;
  try { pathname = decodeURIComponent((req.url || '/').split('?')[0]); }
  catch { fail(400, 'Invalid URL'); return; }
  const segments = pathname.split('/');
  if (!pathname.startsWith('/') || pathname.includes('\\') || pathname.includes('\0') || segments.some(part => part === '..' || part.toLowerCase() === '.git')) {
    fail(403, 'Forbidden'); return;
  }
  if (pathname === '/' || pathname === '/preview/index.html') {
    res.writeHead(302, { Location: '/preview/rixin.html' }); res.end(); return;
  }
  if (pathname === '/dsh-startup/splash.js') pathname = '/lib/splash.js';
  else if (pathname === '/dsh-startup/splash.css') pathname = '/lib/splash.css';
  else if (/^\/dsh-startup\/asset\/(?:[a-z0-9._-]+\.mp3|rixin-logo\.jpg)$/i.test(pathname)) pathname = '/lib/assets/' + pathname.split('/').pop();
  try {
    const candidate = resolve(root, '.' + pathname);
    if (!candidate.startsWith(root + sep)) { fail(403, 'Forbidden'); return; }
    const file = await realpath(candidate);
    if (!file.startsWith(root + sep)) { fail(403, 'Forbidden'); return; }
    const info = await stat(file);
    if (!info.isFile()) { fail(404, 'Not found'); return; }
    res.writeHead(200, {
      'Content-Type': types[extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    if (req.method === 'HEAD') { res.end(); return; }
    createReadStream(file).on('error', () => res.destroy()).pipe(res);
  } catch { fail(404, 'Not found'); }
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `端口 ${port} 已被占用。可直接打开已有预览，或用 PORT=其他端口启动。` : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`零一·环轨启序｜零一 AI 日新社：http://127.0.0.1:${server.address().port}/preview/rixin.html`));
