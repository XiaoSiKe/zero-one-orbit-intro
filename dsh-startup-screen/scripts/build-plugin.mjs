import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, basename } from 'node:path';
import { spawnSync } from 'node:child_process';

const workspace = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const plugin = join(workspace, 'dsh-startup-screen');
const dist = join(workspace, 'dist');
const marker = '\n/* === 零一 AI 日新社 · 品牌覆盖 === */\n';
const runtimeFile = join(plugin, 'lib/splash.css');
const [runtime, brand] = await Promise.all([
  readFile(runtimeFile, 'utf8'),
  readFile(join(plugin, 'rixin-brand.css'), 'utf8'),
]);
if (runtime.split(marker).length !== 2) throw new Error('运行时品牌覆盖标记应恰好出现一次。');
const logoReference = 'url("/dsh-startup/asset/rixin-logo.jpg")';
if (brand.split(logoReference).length !== 2) throw new Error('品牌样式中的本地 Logo 路由应恰好出现一次。');
const next = runtime.split(marker)[0] + marker + brand;
if (next !== runtime) await writeFile(runtimeFile, next, 'utf8');
console.log('品牌样式已同步，Logo 使用本地资源路由。');
if (process.argv.includes('--styles-only')) process.exit(0);

await mkdir(dist, { recursive: true });
const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['pack', '--json', '--pack-destination', dist], { cwd: plugin, encoding: 'utf8' });
if (result.error) throw result.error;
if (result.status !== 0) { process.stderr.write(result.stderr || result.stdout); process.exit(result.status || 1); }
const [packed] = JSON.parse(result.stdout);
if (!packed?.filename || basename(packed.filename) !== packed.filename) throw new Error('npm 未返回合法包文件名。');
const generated = join(dist, packed.filename);
const output = join(dist, 'dsh-startup-screen-rixin-1.1.2.tgz');
if (generated !== output) await rename(generated, output);
console.log(`插件包：${output}`);
console.log('此命令只打包，不安装或修改 DSH 配置。');
