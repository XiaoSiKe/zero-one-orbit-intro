/* Run the production clock and finale with a virtual clock; no browser or audio dependency. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

const source = fs.readFileSync(new URL('../lib/splash.js', import.meta.url), 'utf8')
const clock = source.slice(source.indexOf('  function ms(base)'), source.indexOf('  function waitAction()'))
const finale = source.slice(source.indexOf('  function finale()'), source.indexOf('  function finish(quiet)'))
const hold = source.match(/function holdFor\(spoken\)\s*\{([\s\S]*?)\n\s*\}/)[0]
assert.ok(clock && finale && hold)

for (const speed of [0.5, 1, 3]) {
  let now = 0, next = 0, handoff = 0, glitch = 0, settled = false
  const scheduled = new Map()
  const node = () => ({
    classList: { add(name) { if (name === 'dsu-on') glitch = now }, remove() {} },
    setAttribute() {}, textContent: '零一 AI 日新社', offsetWidth: 1, hidden: false,
  })
  const context = vm.createContext({
    C: { speed }, timers: [], waiters: [], skipped: false, finished: false,
    setTimeout(fn, delay) { const id = ++next; scheduled.set(id, { fn, at: now + delay }); return id },
    clearTimeout(id) { scheduled.delete(id) },
    ui: Object.fromEntries(['status', 'subEn', 'rule', 'reticle', 'center', 'dots', 'welcome', 'idline', 'w1', 'w2', 'w4'].map(key => [key, node()])),
    root: { classList: { add(name) { if (name === 'dsu-handoff') handoff = now } } },
    audio: { chime() {} }, voice: { line() { return Promise.resolve(0) } },
    setStepCount() {}, setSlats() {}, setProgress() {}, setSubtitle() {}, stopHex() {},
    finish() { context.finished = true },
    step: { hold: 1800 },
  })
  vm.runInContext(clock + '\n' + finale + '\n' + hold, context)
  const drain = async promise => {
    settled = false
    promise.then(() => { settled = true })
    for (let iteration = 0; iteration < 100 && !settled; iteration++) {
      for (let microtask = 0; microtask < 20; microtask++) await Promise.resolve()
      if (settled) break
      const entry = [...scheduled].sort((a, b) => a[1].at - b[1].at)[0]
      assert.ok(entry, 'timeline must make progress')
      scheduled.delete(entry[0]); now = entry[1].at; entry[1].fn()
    }
    assert.ok(settled, 'timeline must finish')
  }
  await drain(vm.runInContext('finale()', context))
  const readingMs = handoff - (glitch + 860 / speed)
  assert.ok(readingMs >= 3198, `speed ${speed}: clear reading ${readingMs}ms`)
  assert.ok(context.finished, 'finale must release the overlay')

  context.finished = false
  const before = now
  await drain(vm.runInContext('holdFor(500)', context))
  const expected = Math.max(Math.round(1800 / speed), 500 + Math.round(240 / speed)) - 500
  assert.equal(now - before, expected, 'phase remainder must scale exactly once')

  context.finished = true
  await drain(vm.runInContext('waitMs(3200)', context))
  assert.equal(scheduled.size, 0, 'finished instance must not create reading timers')
  console.log(`  ok   ${speed}×: clear welcome ${Math.round(readingMs)}ms; phase clock and cancellation`)
}
console.log('Timing regression checks passed.')

/* A quick click/Enter during the entrance must still advance both confirmation steps. */
{
  const stepLoop = source.slice(source.indexOf('  function stepLoop()'), source.indexOf('  function assembleLogo()'))
  const waitAction = source.slice(source.indexOf('  function waitAction()'), source.indexOf('  function releaseAll()'))
  const scheduled = new Map()
  let now = 0, id = 0, settled = false, confirmed = 0
  const target = () => {
    const listeners = new Map()
    return {
      listeners,
      classList: { add() {}, remove() {}, toggle() {} }, offsetWidth: 1,
      addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn) },
      removeEventListener(type, fn) { listeners.get(type)?.delete(fn) },
      emit(type, event) { for (const fn of [...(listeners.get(type) || [])]) fn(event) },
    }
  }
  const ui = Object.fromEntries(['status', 'subEn', 'statusZh', 'caret', 'rule', 'btn', 'action'].map(key => [key, target()]))
  const document = target()
  const context = vm.createContext({
    C: { speed: 1, requireInteraction: true }, timers: [], waiters: [], skipped: false, finished: false,
    STEPS: [{action:'grant'}, {action:'confirm'}], ui, document,
    setTimeout(fn, delay) { const key = ++id; scheduled.set(key, {fn, at:now+delay}); return key },
    clearTimeout(key) { scheduled.delete(key) }, requestAnimationFrame(fn) { fn() },
    audio: { step() {}, confirm() { confirmed++ } }, voice: { line() { return Promise.resolve(0) } },
    setStepCount() {}, setSlats() {}, setProgress() {}, setSubtitle() {}, typeIn() {}, hideAction() {},
    showAction(step) {
      const key = ++id
      scheduled.set(key, { at:now+100, fn() {
        const event = {key:'Enter', preventDefault() {}}
        if (step.action === 'grant') {
          ui.btn.emit('click', event)
          ui.btn.emit('click', event)
        } else document.emit('keydown', event)
      } })
    },
  })
  vm.runInContext(clock + '\n' + waitAction + '\n' + stepLoop, context)
  vm.runInContext('stepLoop()', context).then(() => { settled = true })
  for (let iteration = 0; iteration < 30 && !settled; iteration++) {
    for (let n = 0; n < 20; n++) await Promise.resolve()
    if (settled) break
    const entry = [...scheduled].sort((a,b) => a[1].at-b[1].at)[0]
    assert.ok(entry, 'quick input must not get lost and leave the sequence waiting')
    scheduled.delete(entry[0]); now = entry[1].at; entry[1].fn()
  }
  assert.ok(settled, 'both confirmation steps finish after quick click and Enter')
  assert.equal(confirmed, 2, 'duplicate click does not advance an extra step')
  for (const node of [ui.btn, ui.action, document]) {
    for (const listeners of node.listeners.values()) assert.equal(listeners.size, 0, 'input listeners are released')
  }
  console.log('  ok   确认按钮出现 100ms 内点击 / Enter 有效，重复点击不串阶段。')
}
