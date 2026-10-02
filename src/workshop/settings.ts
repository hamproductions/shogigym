import type { PieceSet } from './pieceSets'
import { useSyncExternalStore } from 'react'

export type PieceStyle = 'two' | 'one'
export type PieceFont = 'mincho' | 'kaisho' | 'gyosho' | 'antique'
export type PieceFinish = 'oshi' | 'kaki' | 'hori' | 'horiume' | 'moriage'
export type BoardStyle = 'kaya' | 'shin-kaya' | 'dark'
export type AiStrength = 'beginner' | 'club' | 'strong' | 'max'

export type Settings = {
  sound: boolean
  volume: number
  pieceStyle: PieceStyle
  pieceFont: PieceFont
  pieceSet: PieceSet
  pieceFinish: PieceFinish
  boardStyle: BoardStyle
  thinkMs: number
  candidates: number
  opponent: AiStrength
  aiStrategy: string
  assist: boolean
}

const KEY = 'joseki-practice:settings:v1'

const DEFAULTS: Settings = { sound: true, volume: 0.6, pieceStyle: 'two', pieceFont: 'mincho', pieceSet: 'letters', pieceFinish: 'moriage', boardStyle: 'kaya', thinkMs: 1500, candidates: 3, opponent: 'beginner', aiStrategy: '', assist: true }

function read(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return DEFAULTS
  }
}

let current = read()
const listeners = new Set<() => void>()

export function setSettings(patch: Partial<Settings>) {
  current = { ...current, ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(current))
  } catch (error) {
    console.warn('settings not persisted', error)
  }
  listeners.forEach((l) => l())
}

export const getSettings = () => current

export function useSettings() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current,
  )
}

export const STRENGTH: Record<AiStrength, { label: string; movetime: number; pickFrom: number; maxLoss: number }> = {
  beginner: { label: 'Beginner', movetime: 150, pickFrom: 4, maxLoss: 0.2 },
  club: { label: 'Club player', movetime: 300, pickFrom: 3, maxLoss: 0.07 },
  strong: { label: 'Strong', movetime: 800, pickFrom: 1, maxLoss: 0 },
  max: { label: 'Full strength', movetime: 2000, pickFrom: 1, maxLoss: 0 },
}

let audio: AudioContext | null = null

function ctx() {
  audio ??= new AudioContext()
  if (audio.state === 'suspended') void audio.resume()
  return audio
}

function knock(when: number, pitch: number, gain: number, length: number) {
  const ac = ctx()
  const source = ac.createBufferSource()
  const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * length), ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 6)
  source.buffer = buffer
  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = pitch
  filter.Q.value = 2.2
  const amp = ac.createGain()
  amp.gain.value = gain * current.volume
  source.connect(filter).connect(amp).connect(ac.destination)
  source.start(ac.currentTime + when)
}

function tone(when: number, freq: number, gain: number, length: number) {
  const ac = ctx()
  const osc = ac.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = freq
  const amp = ac.createGain()
  amp.gain.setValueAtTime(gain * current.volume, ac.currentTime + when)
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + when + length)
  osc.connect(amp).connect(ac.destination)
  osc.start(ac.currentTime + when)
  osc.stop(ac.currentTime + when + length)
}

export function playSound(kind: 'move' | 'capture' | 'right' | 'wrong' | 'complete') {
  if (!current.sound) return
  try {
    if (kind === 'move') knock(0, 1900, 1.4, 0.09)
    else if (kind === 'capture') knock(0, 1250, 2.2, 0.13)
    else if (kind === 'right') {
      tone(0, 880, 0.12, 0.18)
      tone(0.09, 1320, 0.1, 0.22)
    } else if (kind === 'wrong') tone(0, 220, 0.14, 0.32)
    else {
      tone(0, 660, 0.1, 0.3)
      tone(0.12, 880, 0.1, 0.3)
      tone(0.24, 1320, 0.1, 0.45)
    }
  } catch (error) {
    console.warn('sound failed', error)
  }
}

export const PIECE_FONTS: Record<PieceFont, { label: string; family: string; weight: number; load: () => Promise<unknown> }> = {
  mincho: { label: '明朝 Mincho', family: 'Shippori Mincho B1', weight: 800, load: async () => undefined },
  kaisho: { label: '楷書 Kaisho', family: 'Yuji Syuku', weight: 400, load: () => import('@fontsource/yuji-syuku/400.css') },
  gyosho: { label: '行書 Gyōsho', family: 'Yuji Boku', weight: 400, load: () => import('@fontsource/yuji-boku/400.css') },
  antique: { label: '古風 Antique', family: 'Zen Antique', weight: 400, load: () => import('@fontsource/zen-antique/400.css') },
}

export async function loadPieceFont(font: PieceFont) {
  const spec = PIECE_FONTS[font]
  await spec.load()
  await document.fonts.load(`${spec.weight} 100px "${spec.family}"`, '歩兵王将玉飛車角行金銀桂馬香成龍と')
}

export const PIECE_FINISHES: Record<PieceFinish, { label: string; hint: string; relief: number; gloss: number }> = {
  oshi: { label: '押し駒', hint: 'Stamped: ink pressed onto the wood.', relief: 0, gloss: 0 },
  kaki: { label: '書き駒', hint: 'Written: lacquer painted straight onto the wood.', relief: 0.004, gloss: 0.7 },
  hori: { label: '彫駒', hint: 'Carved: characters cut into the wood.', relief: -0.016, gloss: 0.4 },
  horiume: { label: '彫埋駒', hint: 'Carved, then the groove filled flush with lacquer.', relief: -0.003, gloss: 1 },
  moriage: { label: '盛上駒', hint: 'Horiume, then lacquer built up into raised characters. The finest grade.', relief: 0.012, gloss: 1 },
}
