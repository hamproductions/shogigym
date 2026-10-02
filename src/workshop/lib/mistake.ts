import { LABELS, type Label, type MoveReview } from '../../analysis'
import i18n from '../../i18n'

export type Mistake = { usi: string; loss: number | null; known: boolean; verdict?: MoveReview; reason?: string }
export type ShownMistake = Mistake & { base: number; expected: string; note?: string }

const WEAK_LABELS: Label[] = ['inaccuracy', 'mistake', 'miss', 'blunder']
const BAD_LABELS: Label[] = ['mistake', 'miss', 'blunder']

export const isWeak = (label: Label) => WEAK_LABELS.includes(label)
export const isBad = (label: Label) => BAD_LABELS.includes(label)

export const mistakeIsBad = (m: Mistake) => m.known || (m.verdict ? isWeak(m.verdict.label) : (m.loss ?? 0) >= 8)

export function mistakeSeal(m: Mistake) {
  const label = m.verdict?.label
  if (label === 'blunder') return i18n.t('mistake.blunder')
  if (label === 'mistake' || label === 'miss' || (m.known && !label)) return i18n.t('mistake.mistake')
  if (label === 'inaccuracy') return i18n.t('mistake.inaccuracy')
  if (!mistakeIsBad(m)) return i18n.t('mistake.other')
  return '✗'
}

export function mistakeHeadline(move: string, m: Mistake) {
  if (m.reason) return i18n.t('mistake.failsBecause', { move, reason: m.reason })
  if (m.verdict && !m.known) {
    const label = LABELS[m.verdict.label].text
    const loss = m.loss ? i18n.t('mistake.winChance', { loss: m.loss }) : ''
    return isWeak(m.verdict.label) ? `${move}: ${label}${loss}` : i18n.t('mistake.butNotThisLessonS', { move, label })
  }
  if (m.known) return i18n.t('mistake.isAKnownMistake', { move })
  if ((m.loss ?? 0) >= 8) return i18n.t('mistake.isAMistakeWinChance', { move, loss: m.loss })
  return i18n.t('mistake.isPlayableButNotThis', { move })
}
