import type { PieceSet } from './pieceSets'
import { applyTheme, type Theme } from './theme'
import i18n from '../i18n'
import { useSyncExternalStore } from 'react'

export type PieceStyle = 'two' | 'one'
export type PieceFont = 'mincho' | 'kaisho' | 'gyosho' | 'antique'
export type PieceFinish = 'oshi' | 'kaki' | 'hori' | 'horiume' | 'moriage'
export type Environment = 'traditional' | 'casual' | 'flat' | 'diagram' | 'broadcast'
export type BoardStyle = 'kaya' | 'shin-kaya' | 'dark'
export type TimeControl = 'none' | '10s' | '3m' | '10m' | '10m30s' | '30m60s' | '5m5s'
export type AiStrength = 'beginner' | 'club' | 'strong' | 'max'
export type Lang = 'en' | 'ja'
export type EngineKind = 'yaneuraou' | 'nnue' | 'fairy'

export type Settings = {
  sound: boolean
  voice: boolean
  volume: number
  pieceStyle: PieceStyle
  pieceFont: PieceFont
  pieceSet: PieceSet
  pieceFinish: PieceFinish
  coords: boolean
  environment: Environment
  boardStyle: BoardStyle
  thinkMs: number
  candidates: number
  opponent: AiStrength
  aiStrategy: string
  mainStrategy: string
  assist: boolean
  timeControl: TimeControl
  lang: Lang
  engine: EngineKind
  fvScale: number
  theme: Theme
  characters: boolean
  power: boolean
}

const KEY = 'joseki-practice:settings:v1'

function navigatorLang(): Lang {
  try {
    return navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en'
  } catch {
    return 'en'
  }
}

const DEFAULTS: Settings = { sound: true, voice: true, volume: 0.6, pieceStyle: 'two', pieceFont: 'mincho', pieceSet: 'letters', pieceFinish: 'moriage', coords: true, environment: 'traditional', boardStyle: 'kaya', thinkMs: 1500, candidates: 3, opponent: 'beginner', aiStrategy: '', mainStrategy: 'shikenbisha', assist: true, timeControl: 'none', lang: navigatorLang(), engine: 'yaneuraou', fvScale: 16, theme: 'system', characters: true, power: false }

function read(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return DEFAULTS
  }
}

let current = read()
void i18n.changeLanguage(current.lang)
applyTheme(current.theme)
const listeners = new Set<() => void>()

export function setSettings(patch: Partial<Settings>) {
  current = { ...current, ...patch }
  if (patch.lang && patch.lang !== i18n.language) void i18n.changeLanguage(patch.lang)
  if (patch.theme) applyTheme(patch.theme)
  try {
    localStorage.setItem(KEY, JSON.stringify(current))
  } catch (error) {
    console.warn('settings not persisted', error)
  }
  listeners.forEach((l) => l())
}

export const getSettings = () => current

export function subscribeSettings(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useSettings() {
  return useSyncExternalStore(subscribeSettings, () => current)
}

export const STRENGTH: Record<AiStrength, { label: string; movetime: number; pickFrom: number; maxLoss: number }> = {
  beginner: { get label() { return i18n.t('options.beginner') }, movetime: 150, pickFrom: 4, maxLoss: 0.2 },
  club: { get label() { return i18n.t('options.clubPlayer') }, movetime: 300, pickFrom: 3, maxLoss: 0.07 },
  strong: { get label() { return i18n.t('options.strong') }, movetime: 800, pickFrom: 1, maxLoss: 0 },
  max: { get label() { return i18n.t('options.fullStrength') }, movetime: 2000, pickFrom: 1, maxLoss: 0 },
}

let audio: AudioContext | null = null

export function audioContext() {
  audio ??= new AudioContext()
  if (audio.state === 'suspended') void audio.resume()
  return audio
}

function knock(when: number, pitch: number, gain: number, length: number) {
  const ac = audioContext()
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
  const ac = audioContext()
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

function sweep(when: number, from: number, to: number, gain: number, length: number) {
  const ac = audioContext()
  const osc = ac.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(from, ac.currentTime + when)
  osc.frequency.exponentialRampToValueAtTime(to, ac.currentTime + when + length)
  const amp = ac.createGain()
  amp.gain.setValueAtTime(0.0001, ac.currentTime + when)
  amp.gain.exponentialRampToValueAtTime(gain * current.volume, ac.currentTime + when + 0.008)
  amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + when + length)
  osc.connect(amp).connect(ac.destination)
  osc.start(ac.currentTime + when)
  osc.stop(ac.currentTime + when + length)
}

export function playSound(kind: 'move' | 'capture' | 'right' | 'wrong' | 'complete' | 'bang' | 'clatter' | 'thump' | 'heartbeat' | 'boom') {
  if (!current.sound) return
  try {
    if (kind === 'move') knock(0, 1900, 1.4, 0.09)
    else if (kind === 'thump') {
      sweep(0, 150, 38, 0.8, 0.5)
      knock(0, 110, 6, 0.3)
      knock(0, 1250, 2, 0.12)
    } else if (kind === 'heartbeat')
      for (const beat of [0, 0.75]) {
        sweep(beat, 95, 42, 0.75, 0.2)
        sweep(beat + 0.2, 80, 38, 0.55, 0.22)
      }
    else if (kind === 'boom') {
      sweep(0, 130, 26, 0.9, 1.8)
      knock(0, 80, 10, 1.1)
      knock(0, 420, 5, 0.5)
      knock(0.02, 1600, 2.5, 0.2)
      for (const [i, f] of [523, 784, 1046].entries()) tone(0.35 + i * 0.08, f, 0.05, 2.2)
    }
    else if (kind === 'capture') knock(0, 1250, 2.2, 0.13)
    else if (kind === 'bang') {
      knock(0, 140, 9, 0.45)
      knock(0, 420, 5, 0.25)
      knock(0.02, 1100, 2.5, 0.12)
    } else if (kind === 'clatter') for (let i = 0; i < 4; i++) knock(i * 0.035 + Math.random() * 0.03, 1400 + Math.random() * 1400, 0.9, 0.07)
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
  mincho: { get label() { return i18n.t('options.mincho') }, family: 'Shippori Mincho B1', weight: 800, load: async () => undefined },
  kaisho: { get label() { return i18n.t('options.kaisho') }, family: 'Yuji Syuku', weight: 400, load: () => import('@fontsource/yuji-syuku/400.css') },
  gyosho: { get label() { return i18n.t('options.gySho') }, family: 'Yuji Boku', weight: 400, load: () => import('@fontsource/yuji-boku/400.css') },
  antique: { get label() { return i18n.t('options.antique') }, family: 'Zen Antique', weight: 400, load: () => import('@fontsource/zen-antique/400.css') },
}

export async function loadPieceFont(font: PieceFont) {
  const spec = PIECE_FONTS[font]
  await spec.load()
  await document.fonts.load(`${spec.weight} 100px "${spec.family}"`, '歩兵王将玉飛車角行金銀桂馬香成龍と')
}

export const PIECE_FINISHES: Record<PieceFinish, { label: string; hint: string; relief: number; gloss: number }> = {
  oshi: { get label() { return i18n.t('options.stamped') }, get hint() { return i18n.t('options.stampedInkPressedOntoThe') }, relief: 0, gloss: 0 },
  kaki: { get label() { return i18n.t('options.written') }, get hint() { return i18n.t('options.writtenLacquerPaintedStraightOnto') }, relief: 0.004, gloss: 0.7 },
  hori: { get label() { return i18n.t('options.carved') }, get hint() { return i18n.t('options.carvedCharactersCutIntoThe') }, relief: -0.016, gloss: 0.4 },
  horiume: { get label() { return i18n.t('options.carvedFilled') }, get hint() { return i18n.t('options.carvedThenTheGrooveFilled') }, relief: -0.003, gloss: 1 },
  moriage: { get label() { return i18n.t('options.raisedLacquer') }, get hint() { return i18n.t('options.horiumeThenLacquerBuiltUp') }, relief: 0.012, gloss: 1 },
}

export const TIME_CONTROLS: Record<TimeControl, { label: string; hint: string; main: number; byoyomi: number; increment: number }> = {
  none: { get hint() { return i18n.t('options.noClock') }, get label() { return i18n.t('options.none') }, main: 0, byoyomi: 0, increment: 0 },
  '10s': { get hint() { return i18n.t('options.everyMoveWithin10Seconds') }, get label() { return i18n.t('options.10S') }, main: 0, byoyomi: 10, increment: 0 },
  '3m': { get hint() { return i18n.t('options.3MinutesEachThenYou') }, get label() { return i18n.t('options.3Min') }, main: 180, byoyomi: 0, increment: 0 },
  '10m': { get hint() { return i18n.t('options.10MinutesEachThenYou') }, get label() { return i18n.t('options.10Min') }, main: 600, byoyomi: 0, increment: 0 },
  '10m30s': { get hint() { return i18n.t('options.10MinutesThen30Seconds') }, get label() { return i18n.t('options.10Min30S') }, main: 600, byoyomi: 30, increment: 0 },
  '30m60s': { get hint() { return i18n.t('options.30MinutesThen60Seconds') }, get label() { return i18n.t('options.30Min60S') }, main: 1800, byoyomi: 60, increment: 0 },
  '5m5s': { get hint() { return i18n.t('options.5MinutesPlus5Seconds') }, get label() { return i18n.t('options.5Min5S') }, main: 300, byoyomi: 0, increment: 5 },
}
