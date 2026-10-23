export type BattlefieldActor = 'foot' | 'horse' | 'cart'

const buffers = new WeakMap<BaseAudioContext, AudioBuffer>()

export function playBattlefieldSound(
  ac: BaseAudioContext,
  kind: 'move' | 'capture' | 'komadai',
  volume: number,
  track: (source: AudioScheduledSourceNode) => void,
  actor: BattlefieldActor = 'foot',
) {
  let buffer = buffers.get(ac)
  if (!buffer) {
    buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * 0.3), ac.sampleRate)
    const samples = buffer.getChannelData(0)
    let seed = 937
    for (let i = 0; i < samples.length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      samples[i] = seed / 2147483648 - 1
    }
    buffers.set(ac, buffer)
  }
  const pulse = (offset: number, duration: number, frequency: number, level: number, noise = false) => {
    const source = noise ? ac.createBufferSource() : ac.createOscillator()
    const filter = ac.createBiquadFilter()
    const gain = ac.createGain()
    const when = ac.currentTime + offset
    if (source instanceof AudioBufferSourceNode) source.buffer = buffer!
    else {
      source.type = 'sine'
      source.frequency.setValueAtTime(frequency, when)
      source.frequency.exponentialRampToValueAtTime(Math.max(35, frequency * 0.85), when + duration)
    }
    filter.type = noise ? 'lowpass' : 'allpass'
    filter.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, when)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, level * volume), when + 0.003)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration)
    source.connect(filter).connect(gain).connect(ac.destination)
    source.addEventListener(
      'ended',
      () => {
        source.disconnect()
        filter.disconnect()
        gain.disconnect()
      },
      { once: true },
    )
    track(source)
    source.start(when)
    source.stop(when + duration)
  }
  if (kind === 'capture') {
    pulse(0, 0.08, 1800, 0.08, true)
    pulse(0.025, 0.09, 110, 0.14)
    pulse(0.025, 0.05, 4200, 0.12, true)
    for (const frequency of [740, 1168, 1830]) pulse(0.025, 0.16, frequency, 0.035)
  } else if (kind === 'komadai') {
    pulse(0, 0.09, 1100, 0.13, true)
    pulse(0.012, 0.07, 420, 0.025)
  } else if (actor === 'horse') {
    pulse(0, 0.055, 2200, 0.13, true)
    pulse(0, 0.065, 170, 0.1)
    pulse(0.045, 0.045, 130, 0.07)
  } else if (actor === 'cart') {
    pulse(0, 0.16, 520, 0.12, true)
    pulse(0.025, 0.055, 950, 0.025)
  } else {
    pulse(0, 0.075, 1350, 0.12, true)
    pulse(0, 0.065, 82, 0.09)
  }
}
