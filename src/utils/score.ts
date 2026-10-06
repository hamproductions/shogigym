import { scoreWinRate } from './analysis'
import type { Score } from './engine'

export const winLoss = (bestRate: number, score: Score) => Math.max(0, Math.round((bestRate - scoreWinRate(score)) * 100))

const lossSeverity = (loss: number) => {
  if (loss >= 10) return ' bad'
  return loss >= 4 ? ' meh' : ''
}

export const lossClass = (loss: number) => `app-loss${lossSeverity(loss)}`
