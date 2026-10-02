import { scoreWinRate } from '../../analysis'
import type { Score } from '../../engine'

export const winLoss = (bestRate: number, score: Score) => Math.max(0, Math.round((bestRate - scoreWinRate(score)) * 100))

export const lossClass = (loss: number) => `ws-loss${loss >= 10 ? ' bad' : loss >= 4 ? ' meh' : ''}`
