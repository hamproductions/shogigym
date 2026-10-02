import { audioContext, getSettings } from '../settings'

const BASE = `${import.meta.env.BASE_URL}voice/zundamon/`
let manifest: Promise<Record<string, string>> | null = null
const clips = new Map<string, Promise<AudioBuffer | null>>()
let playing: AudioBufferSourceNode | null = null
let playingUntil = 0

const load = (text: string) => {
  let clip = clips.get(text)
  if (!clip) {
    manifest ??= fetch(`${BASE}manifest.json`).then((r) => (r.ok ? r.json() : {}), () => ({}))
    clip = manifest.then(async (m) => {
      const file = m[text]
      if (!file) return null
      const data = await (await fetch(`${BASE}${file}`)).arrayBuffer()
      return audioContext().decodeAudioData(data)
    }).catch(() => null)
    clips.set(text, clip)
  }
  return clip
}

export function say(text: string, urgent = false) {
  const { sound, voice, volume } = getSettings()
  if (!sound || !voice) return
  void load(text).then((buffer) => {
    if (!buffer) return
    const ac = audioContext()
    if (!urgent && ac.currentTime < playingUntil) return
    playing?.stop()
    const source = ac.createBufferSource()
    const gain = ac.createGain()
    gain.gain.value = Math.min(1, volume * 1.5)
    source.buffer = buffer
    source.connect(gain).connect(ac.destination)
    source.start()
    playing = source
    playingUntil = ac.currentTime + buffer.duration
  })
}
