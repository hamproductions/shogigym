import { Color, Position } from 'tsshogi'
import type { GameSummaryInput, GameSummaryResultMessage } from './gameSummary'
import { emptyGameSummary, formationSummary } from './gameSummary'
import { currentFormation, formationTagsAt, loadFormations } from '@/utils/formationTags'
import { colorSide } from '@/utils/shogi'

const rulesReady = (async () => {
  try {
    const { default: formations } = await import('@/data/formations.json')
    if (!formations.rules.length) return false
    await loadFormations()
    return true
  } catch {
    return false
  }
})()

async function summarize(input: GameSummaryInput, available: boolean) {
  if (!available) return emptyGameSummary(input.key, 'unavailable')
  try {
    const position = Position.newBySFEN(input.start)
    if (!position) return emptyGameSummary(input.key, 'invalid')
    const sfens = [position.sfen]
    for (const usi of input.moves) {
      const move = position.createMoveByUSI(usi)
      if (!move || !position.isValidMove(move) || !position.doMove(move)) return emptyGameSummary(input.key, 'invalid')
      sfens.push(position.sfen)
    }
    const tags = formationTagsAt(sfens, input.moves, input.moves.length, input.detectionPreset)
    const summary = emptyGameSummary(input.key)
    const names = new Set<string>()
    for (const color of [Color.BLACK, Color.WHITE]) {
      const sideTags = tags[color === Color.BLACK ? 0 : 1]
      const hasFormation = sideTags.some((tag) => tag.kind === 'strategy' || tag.kind === 'castle')
      const selected = currentFormation(position, color, hasFormation ? sideTags : undefined, input.moves.length)
      summary[colorSide(color)] = formationSummary(selected)
      for (const tag of sideTags) if (tag.kind === 'strategy' || tag.kind === 'castle') names.add(tag.name)
      if (selected.strategy) names.add(selected.strategy)
      if (selected.castle) names.add(selected.castle)
    }
    summary.names = [...names]
    return summary
  } catch {
    return emptyGameSummary(input.key, 'invalid')
  }
}

self.onmessage = async ({ data }: MessageEvent<GameSummaryInput[]>) => {
  const available = await rulesReady
  for (const input of data ?? []) {
    const summary = await summarize(input, available)
    const message: GameSummaryResultMessage = { key: input.key, summary }
    self.postMessage(message)
  }
}
