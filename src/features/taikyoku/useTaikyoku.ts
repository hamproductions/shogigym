import { useCallback, useEffect, useRef, useState } from 'react'
import { TaikyokuEngine } from './engine'
import { cellAt, parseInfo, parseMove, parseSnapshot, same, type EngineMove, type Score, type Side, type Snapshot } from './notation'

export type Strength = 'nap' | 'normal' | 'deep'

const GO: Record<Strength, string> = { nap: 'go depth 1', normal: 'go movetime 700', deep: 'go movetime 4000' }

/** The engine keeps at most this many plies of history. */
export const PLY_LIMIT = 19000

export type MoveEvent =
  | { kind: 'open' }
  | { kind: 'capture'; n: number; own: number; piece: string }
  | { kind: 'igui'; piece: string }
  | { kind: 'jitto'; piece: string }
  | { kind: 'promote'; piece: string }
  | { kind: 'royal'; side: Side }
  | { kind: 'milestone'; ply: number }
  | { kind: 'quiet'; piece: string }

export type LogEntry = { id: number; ply: number; side: Side; event: MoveEvent; text: string }

export type Game = {
  snap: Snapshot
  legal: EngineMove[]
  moves: string[]
  last: EngineMove | null
}

const MILESTONES = [50, 100, 250, 500, 1000, 2000, 3805]

export function describe(prev: Snapshot, next: Snapshot, move: EngineMove, ply: number): MoveEvent {
  const side = prev.turn
  const foe: Side = side === 'b' ? 'w' : 'b'
  const piece = cellAt(prev.grid, move.from)?.key ?? ''
  const enemyLost = prev.counts[foe] - next.counts[foe]
  const ownLost = prev.counts[side] - next.counts[side]
  if (next.royals[foe] < prev.royals[foe]) return { kind: 'royal', side: foe }
  if (same(move.from, move.to)) return enemyLost > 0 ? { kind: 'igui', piece } : { kind: 'jitto', piece }
  if (enemyLost + ownLost > 0) return { kind: 'capture', n: enemyLost, own: ownLost, piece }
  if (move.promote) return { kind: 'promote', piece }
  if (MILESTONES.includes(ply)) return { kind: 'milestone', ply }
  return { kind: 'quiet', piece }
}

type SyncResult = { snap: Snapshot; legal: EngineMove[] }

async function sync(engine: TaikyokuEngine, moves: string[]): Promise<SyncResult | null> {
  await engine.run(moves.length ? `position startpos moves ${moves.join(' ')}` : 'position startpos')
  const snap = parseSnapshot(await engine.run('d'))
  const [list = ''] = await engine.run('moves')
  if (!snap) return null
  const legal = list
    .split(' ')
    .slice(1)
    .map(parseMove)
    .filter((m): m is EngineMove => !!m)
  return { snap, legal }
}

export const winnerOf = (snap: Snapshot): Side | null => (snap.royals.b === 0 ? 'w' : snap.royals.w === 0 ? 'b' : null)

export function useTaikyoku(onEvent: (entry: Omit<LogEntry, 'text'>) => void) {
  const engine = useRef<TaikyokuEngine | null>(null)
  const epoch = useRef(0)
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent
  const [game, setGame] = useState<Game | null>(null)
  const [thinking, setThinking] = useState(false)
  const [score, setScore] = useState<Score | null>(null)
  const [auto, setAuto] = useState(false)
  const [strength, setStrength] = useState<Strength>('normal')
  const [error, setError] = useState('')
  const entryId = useRef(0)

  const load = useCallback(async (moves: string[], from?: Game) => {
    const e = engine.current
    if (!e) return
    const mine = epoch.current
    const result = await sync(e, moves)
    if (mine !== epoch.current) return
    if (!result) return setError('engine')
    const last = moves.length ? parseMove(moves[moves.length - 1]) : null
    if (from && last) {
      onEventRef.current({ id: ++entryId.current, ply: moves.length, side: from.snap.turn, event: describe(from.snap, result.snap, last, moves.length) })
    }
    setGame({ ...result, moves, last })
  }, [])

  useEffect(() => {
    const e = new TaikyokuEngine()
    engine.current = e
    epoch.current++
    const mine = epoch.current
    void sync(e, []).then((result) => {
      if (mine !== epoch.current || !result) return
      onEventRef.current({ id: ++entryId.current, ply: 0, side: 'b', event: { kind: 'open' } })
      setGame({ ...result, moves: [], last: null })
    })
    return () => {
      epoch.current++
      e.terminate()
      engine.current = null
    }
  }, [])

  const winner = game ? winnerOf(game.snap) : null
  const aiToMove = !!game && !winner && (auto || game.snap.turn === 'w') && game.moves.length < PLY_LIMIT
  const latest = useRef({ aiToMove, strength })
  latest.current = { aiToMove, strength }
  const searching = useRef(-1)

  // The engine plays whenever it is its turn (or both turns in auto-play).
  const movesKey = game?.moves.length ?? -1
  useEffect(() => {
    const e = engine.current
    if (!e || !game || !aiToMove || searching.current === movesKey) return
    const mine = epoch.current
    searching.current = movesKey
    setThinking(true)
    void e
      .run(GO[latest.current.strength], (line) => {
        const s = parseInfo(line)
        if (s && mine === epoch.current) setScore({ ...s, cp: game.snap.turn === 'b' ? s.cp : -s.cp })
      })
      .then(async (lines) => {
        if (mine !== epoch.current) return
        searching.current = -1
        setThinking(false)
        const best = lines.find((l) => l.startsWith('bestmove'))?.split(' ')[1]
        if (!best || best === '0000') return setAuto(false)
        // auto-play may have been switched off while the engine was thinking
        if (!latest.current.aiToMove) return
        await load([...game.moves, best], game)
      })
  }, [movesKey, aiToMove, game, load])

  const play = useCallback(
    (move: EngineMove) => {
      if (!game || thinking || winner || (auto && !winner)) return
      void load([...game.moves, move.text], game)
    },
    [game, thinking, winner, auto, load],
  )

  const restart = useCallback(
    (moves: string[]) => {
      epoch.current++
      searching.current = -1
      setThinking(false)
      setScore(null)
      setAuto(false)
      void load(moves)
    },
    [load],
  )

  const undo = useCallback(() => {
    if (!game?.moves.length) return
    // back to the previous position where it is the human's (Sente's) turn
    let n = game.moves.length - 1
    while (n > 0 && n % 2 === 1) n--
    restart(game.moves.slice(0, n))
  }, [game, restart])

  const reset = useCallback(() => {
    restart([])
    onEventRef.current({ id: ++entryId.current, ply: 0, side: 'b', event: { kind: 'open' } })
  }, [restart])

  return { game, thinking, score, auto, setAuto, strength, setStrength, winner, error, play, undo, reset }
}
