import { Position } from 'tsshogi'

export function positionCorrectionIssue(start: string, lines: string[][]): 'invalid' | number | null {
  const initial = Position.newBySFEN(start)
  if (!initial) return 'invalid'
  for (const line of lines) {
    const position = initial.clone()
    for (let i = 0; i < line.length; i++) {
      const move = position.createMoveByUSI(line[i])
      if (!move || !position.isValidMove(move) || !position.doMove(move)) return i + 1
    }
  }
  return null
}
