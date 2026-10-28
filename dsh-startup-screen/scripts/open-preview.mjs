import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { setTimeout } from 'node:timers/promises';

const port = process.env.PORT || '4178';
const url = `http://127.0.0.1:${port}/preview/rixin.html`;
async function ready() {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(600) });
    return response.ok && (await response.text()).includes('<title>零一·环轨启序');
  } catch { return false; }
}
function open() {
  const [command, args] = process.platform === 'darwin' ? ['open', [url]]
    : process.platform === 'win32' ? ['rundll32.exe', ['url.dll,FileProtocolHandler', url]]
      : ['xdg-open', [url]];
  const browser = spawn(command, args, { stdio: 'ignore', detached: true });
  browser.on('error', () => console.log(`请手动打开：${url}`));
  browser.unref();
}
if (await ready()) {
  open();
} else {
  const server = spawn(process.execPath, [fileURLToPath(new URL('../preview/server.mjs', import.meta.url))], { stdio: 'inherit' });
  let stopped = false;
  server.on('exit', code => { stopped = true; process.exitCode = code || 0; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.kill(signal));
  for (let attempt = 0; attempt < 30; attempt++) {
    if (stopped) break;
    if (await ready()) {
      open();
      console.log('预览已打开；保留此窗口，按 Ctrl+C 停止本次预览服务。');
      break;
    }
    if (attempt === 29) {
      console.error(`预览服务尚未就绪，请检查端口 ${port}。`);
      process.exitCode = 1;
      server.kill();
    }
    await setTimeout(100);
  }
}
