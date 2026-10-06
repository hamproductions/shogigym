// A shogi "pachi": a hard tile snapped onto a kaya board. Short, sharp and high:
// a few-millisecond noise tick for the attack, then three inharmonic wood
// resonances that die within 12-45 ms. Anything longer or lower reads as a thud.
const PARTIALS: readonly (readonly [ratio: number, level: number, decay: number])[] = [
  [1, 0.55, 0.045],
  [2.46, 0.4, 0.025],
  [4.13, 0.25, 0.012],
]

const noiseCache = new WeakMap<BaseAudioContext, AudioBuffer>()

function noise(ac: BaseAudioContext) {
  let buffer = noiseCache.get(ac)
  if (!buffer) {
    buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.02), ac.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    noiseCache.set(ac, buffer)
  }
  return buffer
}

export function scheduleClack(
  ac: BaseAudioContext,
  destination: AudioNode,
  at: number,
  pitch: number,
  gain: number,
  ring = 1,
  track?: (source: AudioScheduledSourceNode) => void,
) {
  const out = ac.createGain()
  out.gain.value = gain
  out.connect(destination)

  const tick = ac.createBufferSource()
  tick.buffer = noise(ac)
  const bright = ac.createBiquadFilter()
  bright.type = 'highpass'
  bright.frequency.value = pitch * 1.4
  const tickAmp = ac.createGain()
  tickAmp.gain.setValueAtTime(0.9, at)
  tickAmp.gain.exponentialRampToValueAtTime(0.0001, at + 0.005)
  tick.connect(bright).connect(tickAmp).connect(out)
  track?.(tick)
  tick.start(at)
  tick.stop(at + 0.01)

  // Each hit lands a little off-pitch so repeated moves don't machine-gun.
  const base = pitch * (1 + (Math.random() - 0.5) * 0.08)
  for (const [ratio, level, decay] of PARTIALS) {
    const osc = ac.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = base * ratio
    const amp = ac.createGain()
    amp.gain.setValueAtTime(level, at)
    amp.gain.exponentialRampToValueAtTime(0.0001, at + decay * ring)
    osc.connect(amp).connect(out)
    track?.(osc)
    osc.start(at)
    osc.stop(at + decay * ring + 0.005)
  }
}
