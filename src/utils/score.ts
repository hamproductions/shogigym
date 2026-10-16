import { cva } from 'styled-system/css'
import { scoreWinRate } from './analysis'
import type { Score } from './engine'

export const winLoss = (bestRate: number, score: Score) => Math.max(0, Math.round((bestRate - scoreWinRate(score)) * 100))

const lossTone = cva({
  base: { fontSize: 'xs', color: 'success' },
  variants: { tone: { good: {}, meh: { color: 'warning' }, bad: { color: 'danger' } } },
})

export const lossClass = (loss: number) => lossTone({ tone: loss >= 10 ? 'bad' : loss >= 4 ? 'meh' : 'good' })
