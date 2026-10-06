import i18n from '@/utils/i18n'
import type { BoardStyle } from './settings'

const label = (en: string, ja: string) => (i18n.language.startsWith('ja') ? ja : en)

export const BOARD_STYLES: Record<BoardStyle, { label: string; source?: string }> = {
  kaya: {
    get label() {
      return i18n.t('settings.kaya')
    },
  },
  'shin-kaya': {
    get label() {
      return i18n.t('settings.light')
    },
  },
  dark: {
    get label() {
      return i18n.t('settings.dark')
    },
  },
  'sunfish-light': {
    get label() {
      return label('Sunfish · Light wood', 'Sunfish・明るい木材')
    },
    source: 'light',
  },
  'sunfish-warm': {
    get label() {
      return label('Sunfish · Warm wood', 'Sunfish・暖かい木材')
    },
    source: 'warm',
  },
  'sunfish-resin': {
    get label() {
      return label('Sunfish · Vinyl', 'Sunfish・塩化ビニル')
    },
    source: 'resin',
  },
  'sunfish-dark': {
    get label() {
      return label('Sunfish · Dark', 'Sunfish・ダーク')
    },
    source: 'dark',
  },
}

const loaded = new Map<BoardStyle, HTMLImageElement>()
const pending = new Map<BoardStyle, Promise<void>>()
export const loadedBoard = (style: BoardStyle) => loaded.get(style)

export function loadBoardStyle(style: BoardStyle): Promise<void> {
  const { source } = BOARD_STYLES[style]
  if (!source || loaded.has(style)) return Promise.resolve()
  const existing = pending.get(style)
  if (existing) return existing
  const promise = new Promise<void>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => {
      loaded.set(style, image)
      resolve()
    })
    image.addEventListener('error', () => reject(new Error(`Could not load ${BOARD_STYLES[style].label}`)))
    image.src = `${import.meta.env.BASE_URL}boards/sunfish/${source}.svg`
  }).finally(() => pending.delete(style))
  pending.set(style, promise)
  return promise
}
