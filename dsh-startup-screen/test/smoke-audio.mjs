import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../lib/splash.js', import.meta.url), 'utf8');
const factory = source.slice(source.indexOf('  var audio = (function () {'), source.indexOf('  var voice = (function () {'));
function setup(overrides = {}, state = 'running') {
  const counters = { fetches: 0, contexts: 0, closed: 0, buffers: 0, started: 0, stopped: 0, disconnected: 0 };
  const parameter = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} });
  const node = () => ({ connect() {}, disconnect() { counters.disconnected++; } });
  const context = {
    state, currentTime: 0, sampleRate: 48000, destination: {},
    resume() { return Promise.resolve(); },
    close() { this.state = 'closed'; counters.closed++; return Promise.resolve(); },
    createGain() { return { ...node(), gain: parameter() }; },
    createBiquadFilter() { return { ...node(), frequency: parameter(), Q: parameter() }; },
    createOscillator() { return { ...node(), frequency: parameter(), start() { counters.started++; }, stop() { counters.stopped++; } }; },
    createBufferSource() { return { ...node(), start() { counters.started++; }, stop() { counters.stopped++; } }; },
    createBuffer(channels, length) { counters.buffers++; return { getChannelData: () => new Float32Array(length) }; },
    decodeAudioData() { return Promise.resolve({ duration: 0.5 }); },
  };
  const sandbox = {
    C: { sound: true, soundVolume: 0.5, voice: true, voiceVolume: 0.9, voiceSource: 'asset', sfx: 'audio', ...overrides },
    window: { AudioContext: function () { counters.contexts++; return context; } },
    fetch: async () => { counters.fetches++; return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) }; },
    clamp01: (v, lo, hi) => Math.max(lo, Math.min(hi, Number(v))),
  };
  return { audio: vm.runInNewContext(factory + '\naudio', sandbox), counters };
}

const a = setup();
a.audio.preload();
assert.equal(await a.audio.ensureAsset('sfx-tick'), true);
assert.equal(await a.audio.ensureAsset('sfx-ticks-run'), true);
assert.equal(a.counters.fetches, 2, '预热和按需请求共享同一份待加载缓存');
assert.equal(a.counters.contexts, 1, '单次播放复用一个音频上下文');
const voice = a.audio.playAssetAndWait('sfx-tick', 0.5);
a.audio.sweep(); a.audio.sweep();
assert.equal(a.counters.buffers, 1, '多次气动/电机音复用噪声缓冲，不重复逐样本分配');
assert.ok(a.counters.started > 2, '机械扫频已调度真实声源');
a.audio.dispose();
assert.equal(await voice, 0, '停止时待播语音 Promise 会结束');
assert.equal(a.counters.closed, 1, '结束时释放音频上下文');
assert.ok(a.counters.stopped > 0 && a.counters.disconnected > 0, '停止并断开所有声音节点');
const before = a.counters.started;
a.audio.confirm(); a.audio.dispose();
assert.equal(a.counters.started, before, '结束后不再重新创建声源');
assert.equal(a.counters.closed, 1, '重复释放是幂等的');

const tts = setup({ voiceSource: 'tts' });
assert.equal(await tts.audio.ensureAsset('line-1'), false);
assert.equal(await tts.audio.ensureAsset('sfx-tick'), true, '选择系统语音仍可使用界面音效素材');
tts.audio.dispose();
const silent = setup({ sound: false, voice: false });
silent.audio.rise(); silent.audio.confirm();
assert.equal(silent.counters.contexts, 0, '关闭声音时不初始化音频设备');
const locked = setup({}, 'suspended');
locked.audio.rise(); locked.audio.sweep();
assert.equal(locked.counters.started, 0, '浏览器未解锁时不积压开场机器声');
locked.audio.dispose();
const waiting = setup({}, 'suspended');
await waiting.audio.ensureAsset('line-1');
const pendingVoice = waiting.audio.playAssetAndWait('line-1', 0.5);
assert.equal(waiting.counters.started, 0, '旁白在用户解锁前不向暂停的设备提交声源');
waiting.audio.dispose();
assert.equal(await pendingVoice, 0, '跳过时也释放尚未解锁的旁白等待');
console.log('机械音效：缓存、播放、停止、静音和解锁回归检查通过。');
