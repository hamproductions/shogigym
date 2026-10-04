import { audioContext, getSettings, trackAudio } from '../../appearance/settings'

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
  if (!sound || !voice || document.hidden) return
  let cancelled = false
  let active: AudioBufferSourceNode | null = null
  void load(text).then((buffer) => {
    if (!buffer || cancelled || document.hidden) return
    const ac = audioContext()
    if (!urgent && ac.currentTime < playingUntil) return
    playing?.stop()
    const source = ac.createBufferSource()
    const gain = ac.createGain()
    gain.gain.value = Math.min(1, volume * 1.5)
    source.buffer = buffer
    source.connect(gain).connect(ac.destination)
    source.addEventListener('ended', () => {
      if (playing !== source) return
      playing = null
      playingUntil = 0
    }, { once: true })
    trackAudio(source)
    source.start()
    active = source
    playing = source
    playingUntil = ac.currentTime + buffer.duration
  })
  return () => {
    cancelled = true
    if (active && playing === active) {
      active.stop()
      playing = null
      playingUntil = 0
    }
  }
}

export function sayFurigomaResult(pawns: number, spectator = false) {
  say(`${pawns >= 3 ? '歩' : 'と金'}が${pawns >= 3 ? pawns : 5 - pawns}枚出たので、${spectator ? '上手' : 'あなた'}は${pawns >= 3 ? '先手' : '後手'}です`, true)
}
