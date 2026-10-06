import profiles from './clack.json'

type Kind = keyof typeof profiles
type Prepared = {
  nodes: { wave?: PeriodicWave; noise?: AudioBuffer; envelope: Float32Array; frequency: number; q?: number }[]
  contact: Float32Array
}

const prepared = new WeakMap<AudioContext, Partial<Record<Kind, Prepared>>>()

function prepare(ac: AudioContext, kind: Kind): Prepared {
  const cached = prepared.get(ac) ?? {}
  if (cached[kind]) return cached[kind]
  const profile = profiles[kind]
  let seed = profile.seed
  const random = () => {
    seed ^= seed << 13
    seed ^= seed >>> 17
    seed ^= seed << 5
    return (seed >>> 0) / 4294967296
  }
  const nodes = profile.nodes.map((node) => {
    const envelope = new Float32Array(node.envelope)
    const frequency = node.frequency * profile.tuning
    if (node.type === 'oscillator') {
      const phase = random() * Math.PI * 2
      const wave = ac.createPeriodicWave(new Float32Array([0, Math.sin(phase)]), new Float32Array([0, Math.cos(phase)]))
      return { wave, envelope, frequency }
    }
    const noise = ac.createBuffer(1, 12000, 48000)
    const samples = noise.getChannelData(0)
    for (let i = 0; i < samples.length; i++) samples[i] = random() * 2 - 1
    return { noise, envelope, frequency, q: node.q }
  })
  const result = { nodes, contact: new Float32Array(profile.contactEnvelope) }
  cached[kind] = result
  prepared.set(ac, cached)
  return result
}

export function playClack(ac: AudioContext, kind: Kind, volume: number, track: (source: AudioScheduledSourceNode) => void) {
  const profile = profiles[kind]
  const data = prepare(ac, kind)
  const when = ac.currentTime
  const bass = ac.createBiquadFilter()
  bass.type = 'lowshelf'
  bass.frequency.value = 900
  bass.gain.value = profile.bassGain
  const body = ac.createBiquadFilter()
  body.type = 'peaking'
  body.frequency.value = 1000
  body.Q.value = 0.8
  body.gain.value = -4
  const pitch = ac.createBiquadFilter()
  pitch.type = 'highshelf'
  pitch.frequency.value = 6500
  pitch.gain.value = profile.pitchGain
  const contact = ac.createGain()
  contact.gain.setValueCurveAtTime(data.contact, when, profile.duration)
  const output = ac.createGain()
  output.gain.value = profile.outputGain * volume
  bass.connect(body).connect(pitch).connect(contact).connect(output).connect(ac.destination)
  let remaining = data.nodes.length
  for (const node of data.nodes) {
    const amp = ac.createGain()
    amp.gain.setValueCurveAtTime(node.envelope, when, (node.envelope.length - 1) * profile.step)
    amp.connect(bass)
    let source: OscillatorNode | AudioBufferSourceNode
    let filter: BiquadFilterNode | undefined
    if (node.wave) {
      const oscillator = ac.createOscillator()
      oscillator.setPeriodicWave(node.wave)
      oscillator.frequency.value = node.frequency
      oscillator.connect(amp)
      source = oscillator
    } else {
      const noise = ac.createBufferSource()
      noise.buffer = node.noise ?? null
      filter = ac.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = node.frequency
      filter.Q.value = node.q ?? 1.8
      noise.connect(filter).connect(amp)
      source = noise
    }
    source.addEventListener(
      'ended',
      () => {
        source.disconnect()
        filter?.disconnect()
        amp.disconnect()
        if (--remaining) return
        bass.disconnect()
        body.disconnect()
        pitch.disconnect()
        contact.disconnect()
        output.disconnect()
      },
      { once: true },
    )
    track(source)
    source.start(when)
    source.stop(when + profile.duration)
  }
}
