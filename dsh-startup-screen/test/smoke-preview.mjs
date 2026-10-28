import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { request } from 'node:http';
import { fileURLToPath } from 'node:url';

const child = spawn(process.execPath, [fileURLToPath(new URL('../preview/server.mjs', import.meta.url))], {
  env: { ...process.env, PORT: '0' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
const exited = once(child, 'exit');
let errors = '';
child.stderr.on('data', chunk => { errors += chunk; });
const timeout = setTimeout(() => child.kill(), 10000);

try {
  const origin = await new Promise((resolve, reject) => {
    let output = '';
    child.on('error', reject);
    child.on('exit', code => reject(new Error(`Preview exited ${code}: ${errors}`)));
    child.stdout.on('data', chunk => {
      output += chunk;
      const match = output.match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match) resolve(match[0]);
    });
  });
  async function call(path, method = 'GET') {
    return new Promise((resolve, reject) => {
      const req = request(origin, { method, path }, res => {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
      });
      req.on('error', reject);
      req.end();
    });
  }
  const redirect = await call('/');
  assert.equal(redirect.status, 302);
  assert.equal(redirect.headers.location, '/preview/rixin.html');
  const legacy = await call('/preview/index.html');
  assert.equal(legacy.headers.location, '/preview/rixin.html');
  const page = await call('/preview/rixin.html');
  assert.equal(page.status, 200);
  assert.match(page.body.toString(), /零一·环轨启序/);
  for (const [path, type] of [
    ['/dsh-startup/splash.js', 'javascript'],
    ['/dsh-startup/splash.css', 'text/css'],
    ['/dsh-startup/asset/rixin-logo.jpg', 'image/jpeg'],
    ...['line-1', 'line-2', 'line-3', 'line-4', 'line-5', 'line-6', 'sfx-tick', 'sfx-ticks-run']
      .map(name => ['/dsh-startup/asset/' + name + '.mp3', 'audio/mpeg']),
  ]) {
    const res = await call(path);
    assert.equal(res.status, 200, path);
    assert.ok(res.headers['content-type'].includes(type), path);
    assert.ok(res.body.length > 100, path);
    const head = await call(path, 'HEAD');
    assert.equal(head.status, 200, path);
    assert.equal(head.body.length, 0, path);
    assert.equal(Number(head.headers['content-length']), res.body.length, path);
  }
  for (const [path, status] of [
    ['/%ZZ', 400], ['/../package.json', 403], ['/%2e%2e/package.json', 403],
    ['/.git/config', 403], ['/lib/%5c../package.json', 403], ['/missing', 404],
  ]) assert.equal((await call(path)).status, status, path);
  assert.equal((await call('/preview/rixin.html', 'POST')).status, 405);
  console.log('独立预览：当前入口、11 项资源、HEAD、路径边界与非法请求检查通过。');
} finally {
  clearTimeout(timeout);
  child.kill();
  await exited;
}
