import { useCallback, useEffect, useRef, useState } from 'react'
import { TaikyokuEngine } from './engine'
import { cellAt, parseInfo, parseMove, parseSnapshot, same, type Cell, type EngineMove, type Pos, type Score, type Side, type Snapshot } from './notation'

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

export type ControlCell = { b: Pos[]; w: Pos[] }
export type TimelineEntry = { move: EngineMove; piece: Cell; side: Side }
export type CaptureEntry = { cell: Cell; by: Side; from: Pos }
export type TaikyokuAnalysis = { bestmove: EngineMove; pv: EngineMove[]; score: Score; entries?: TimelineEntry[] }
export type SavedTaikyoku = { version: 1; variant: 'taikyoku'; moves: string[]; cursor: number; strength: Strength; evaluations: (number | null)[] }

export type Game = {
  snap: Snapshot
  legal: EngineMove[]
  sideMoves: Record<Side, EngineMove[]>
  control: Map<string, ControlCell>
  captured: Cell[]
  captures: CaptureEntry[]
  animate: boolean
  previous: Snapshot | null
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

type SyncResult = Pick<Game, 'snap' | 'legal' | 'sideMoves' | 'control'> & { evaluation: Score }

function capturedAfter(from: Snapshot, to: Snapshot, move: EngineMove): CaptureEntry[] {
  return from.grid.flatMap((row, rank) =>
    row.flatMap((cell, file) => {
      const pos = { file: file + 1, rank: rank + 1 }
      if (!cell || same(pos, move.from)) return []
      const next = cellAt(to.grid, pos)
      return same(pos, move.to) || !next || next.key !== cell.key || next.side !== cell.side ? [{ cell, by: from.turn, from: pos }] : []
    }),
  )
}

async function sync(engine: TaikyokuEngine, moves: string[]): Promise<SyncResult | null> {
  const position = await engine.run(moves.length ? `position startpos moves ${moves.join(' ')}` : 'position startpos')
  if (position.some((line) => line.startsWith('info string jugada ilegal'))) return null
  const snap = parseSnapshot(await engine.run('d'))
  if (!snap) return null
  const inspection = await engine.run('inspect')
  const sideMoves: Record<Side, EngineMove[]> = { b: [], w: [] }
  const control = new Map<string, ControlCell>()
  for (const side of ['b', 'w'] as const) {
    const list = inspection.find((line) => line.startsWith(`moves ${side} `))
    const coverage = inspection.find((line) => line.startsWith(`control ${side}`))
    if (!list || !coverage) return null
    sideMoves[side] = list
      .split(' ')
      .slice(3)
      .map(parseMove)
      .filter((move): move is EngineMove => !!move)
    for (const token of coverage.split(' ').slice(2)) {
      const move = parseMove(token)
      if (!move) continue
      const key = `${move.to.file},${move.to.rank}`
      const cell = control.get(key) ?? { b: [], w: [] }
      if (!cell[side].some((from) => same(from, move.from))) cell[side].push(move.from)
      control.set(key, cell)
    }
  }
  const evaluated = await engine.run('eval')
  const value = Number(evaluated.find((line) => line.startsWith('eval '))?.split(' ')[1])
  if (!Number.isFinite(value)) return null
  const evaluation = { cp: snap.turn === 'b' ? value : -value, depth: 0 }
  return { snap, legal: sideMoves[snap.turn], sideMoves, control, evaluation }
}

export const winnerOf = (snap: Snapshot): Side | null => (snap.royals.b === 0 ? 'w' : snap.royals.w === 0 ? 'b' : null)

export function useTaikyoku(onEvent: (entry: Omit<LogEntry, 'text'>) => void, analysisEnabled = true) {
  const engine = useRef<TaikyokuEngine | null>(null)
  const epoch = useRef(0)
  const analysisEngine = useRef<TaikyokuEngine | null>(null)
  const analysisEpoch = useRef(0)
  const importEngine = useRef<TaikyokuEngine | null>(null)
  const importEpoch = useRef(0)
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent
  const [game, setGame] = useState<Game | null>(null)
  const [timeline, setTimeline] = useState<string[]>([])
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([])
  const [thinking, setThinking] = useState(false)
  const [score, setScore] = useState<Score | null>(null)
  const [analysis, setAnalysis] = useState<TaikyokuAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const [evaluations, setEvaluations] = useState<(number | undefined)[]>([])
  const [restoring, setRestoring] = useState(false)
  const [auto, updateAuto] = useState(false)
  const [paused, setPaused] = useState(false)
  const [manual, setManual] = useState(false)
  const busy = useRef(false)
  const [strength, setStrength] = useState<Strength>('normal')
  const [error, setError] = useState('')
  const entryId = useRef(0)
  const capturesByPly = useRef(new Map<number, CaptureEntry[]>([[0, []]]))

  const cancelAnalysis = useCallback(() => {
    analysisEpoch.current++
    analysisEngine.current?.terminate()
    analysisEngine.current = null
    setAnalysis(null)
    setAnalyzing(false)
    setAnalysisError('')
  }, [])

  const cancelImport = useCallback(() => {
    importEpoch.current++
    importEngine.current?.terminate()
    importEngine.current = null
    setRestoring(false)
  }, [])

  const load = useCallback(
    async (moves: string[], from?: Game, preserveTimeline = false) => {
      cancelAnalysis()
      cancelImport()
      const e = engine.current
      if (!e) return
      const mine = epoch.current
      busy.current = true
      setThinking(true)
      let result: SyncResult | null
      try {
        result = await sync(e, moves)
      } catch {
        if (mine === epoch.current) {
          busy.current = false
          setThinking(false)
          updateAuto(false)
          setError('engine')
        }
        return
      }
      if (mine !== epoch.current) return
      busy.current = false
      setThinking(false)
      if (!result) return setError('engine')
      setError('')
      setScore(result.evaluation)
      setEvaluations((old) => {
        const next = preserveTimeline ? [...old] : old.slice(0, moves.length + 1)
        next[moves.length] = result.evaluation.cp
        return next
      })
      const last = moves.length ? parseMove(moves[moves.length - 1]) : null
      if (from && last && !preserveTimeline) {
        onEventRef.current({ id: ++entryId.current, ply: moves.length, side: from.snap.turn, event: describe(from.snap, result.snap, last, moves.length) })
      }
      let captures = capturesByPly.current.get(moves.length) ?? []
      if (from && last) {
        const taken = capturedAfter(from.snap, result.snap, last)
        captures = taken.length ? [...from.captures, ...taken] : from.captures
      }
      if (!preserveTimeline) {
        setTimeline(moves)
        const piece = from && last ? cellAt(from.snap.grid, last.from) : null
        setTimelineEntries((entries) =>
          from && last && piece ? [...entries.slice(0, moves.length - 1), { move: last, piece, side: from.snap.turn }] : entries.slice(0, moves.length),
        )
        for (const ply of capturesByPly.current.keys()) {
          if (ply > moves.length) capturesByPly.current.delete(ply)
        }
      }
      capturesByPly.current.set(moves.length, captures)
      setGame({ ...result, captured: captures.map((entry) => entry.cell), captures, animate: !!from, previous: from?.snap ?? null, moves, last })
    },
    [cancelAnalysis, cancelImport],
  )

  useEffect(() => {
    const e = new TaikyokuEngine()
    engine.current = e
    epoch.current++
    const mine = epoch.current
    void sync(e, [])
      .then((result) => {
        if (mine !== epoch.current) return
        if (!result) return setError('engine')
        setScore(result.evaluation)
        setEvaluations([result.evaluation.cp])
        onEventRef.current({ id: ++entryId.current, ply: 0, side: 'b', event: { kind: 'open' } })
        setGame({ ...result, captured: [], captures: [], animate: false, previous: null, moves: [], last: null })
      })
      .catch(() => {
        if (mine === epoch.current) setError('engine')
      })
    return () => {
      epoch.current++
      engine.current?.terminate()
      engine.current = null
      importEpoch.current++
      importEngine.current?.terminate()
      importEngine.current = null
    }
  }, [])

  const winner = game ? winnerOf(game.snap) : null
  const aiToMove =
    !!game &&
    game.moves.length === timeline.length &&
    !error &&
    !restoring &&
    game.legal.length > 0 &&
    !winner &&
    (manual || auto || (!paused && game.snap.turn === 'w')) &&
    game.moves.length < PLY_LIMIT
  const latest = useRef({ aiToMove, strength })
  latest.current = { aiToMove, strength }
  const searching = useRef(-1)

  // The engine plays whenever it is its turn (or both turns in auto-play).
  const movesKey = game?.moves.length ?? -1
  useEffect(() => {
    const e = engine.current
    if (!e || !game || !aiToMove || busy.current || searching.current === movesKey) return
    const mine = epoch.current
    searching.current = movesKey
    busy.current = true
    setThinking(true)
    void e
      .run(GO[latest.current.strength], (line) => {
        const s = parseInfo(line)
        if (s && mine === epoch.current) {
          const value = game.snap.turn === 'b' ? s.cp : -s.cp
          setScore({ cp: value, depth: s.depth })
          setEvaluations((old) => {
            const next = [...old]
            next[game.moves.length] = value
            return next
          })
        }
      })
      .then(async (lines) => {
        if (mine !== epoch.current) return
        searching.current = -1
        busy.current = false
        setThinking(false)
        setManual(false)
        const best = lines.find((l) => l.startsWith('bestmove'))?.split(' ')[1]
        if (!best || best === '0000') return updateAuto(false)
        if (!game.legal.some((move) => move.text === best)) return setError('engine')
        // auto-play may have been switched off while the engine was thinking
        if (!latest.current.aiToMove) return
        await load([...game.moves, best], game)
      })
      .catch(() => {
        if (mine !== epoch.current) return
        busy.current = false
        searching.current = -1
        setThinking(false)
        setManual(false)
        updateAuto(false)
        setError('engine')
      })
  }, [movesKey, aiToMove, game, load])

  useEffect(() => {
    cancelAnalysis()
    if (!analysisEnabled || !game || thinking || restoring || aiToMove || error || winner || !game.legal.length || game.moves.length >= PLY_LIMIT) return
    const e = new TaikyokuEngine()
    analysisEngine.current = e
    const mine = analysisEpoch.current
    const current = () => mine === analysisEpoch.current && analysisEngine.current === e
    let latestAnalysis: TaikyokuAnalysis | null = null
    setAnalyzing(true)
    const onLine = (line: string) => {
      const info = parseInfo(line)
      const bestmove = info?.pv[0]
      if (!current() || !info || !bestmove || !game.legal.some((move) => move.text === bestmove.text)) return
      const score = { cp: game.snap.turn === 'b' ? info.cp : -info.cp, depth: info.depth }
      latestAnalysis = { bestmove, pv: info.pv, score }
      setAnalysis(latestAnalysis)
      setScore(score)
      setEvaluations((old) => {
        const next = [...old]
        next[game.moves.length] = score.cp
        return next
      })
    }
    const run = async () => {
      await e.run(game.moves.length ? `position startpos moves ${game.moves.join(' ')}` : 'position startpos')
      if (!current()) return
      await e.run('go movetime 300', onLine)
      if (!current()) return
      const lines = await e.run(GO[strength], onLine)
      if (!current()) return
      const bestmove = parseMove(lines.find((line) => line.startsWith('bestmove '))?.split(' ')[1] ?? '')
      if (bestmove && game.legal.some((move) => move.text === bestmove.text)) {
        const pv = latestAnalysis?.bestmove.text === bestmove.text ? latestAnalysis.pv : [bestmove]
        if (latestAnalysis) {
          latestAnalysis = { ...latestAnalysis, bestmove, pv }
          setAnalysis(latestAnalysis)
          let snapshotLines = await e.run('d')
          let snapshot = parseSnapshot(snapshotLines)
          const entries: TimelineEntry[] = []
          for (const move of pv.slice(0, 8)) {
            if (!current() || !snapshot || winnerOf(snapshot)) break
            const piece = cellAt(snapshot.grid, move.from)
            const legal = (await e.run('moves'))[0]?.split(' ').slice(1) ?? []
            if (!piece || !legal.includes(move.text)) break
            const tsn = snapshotLines.find((line) => line.includes('/') && / [bw] \d+ \d+$/.test(line))
            if (!tsn) break
            const positioned = await e.run(`position tsn ${tsn} moves ${move.text}`)
            if (positioned.some((line) => line.startsWith('info string jugada ilegal'))) break
            snapshotLines = await e.run('d')
            const next = parseSnapshot(snapshotLines)
            if (!next) break
            entries.push({ move, piece, side: snapshot.turn })
            snapshot = next
          }
          if (!current()) return
          setAnalysis({ ...latestAnalysis, entries })
        }
      }
      setAnalyzing(false)
      analysisEngine.current = null
      e.terminate()
    }
    void run().catch((failure: unknown) => {
      if (!current()) return
      setAnalyzing(false)
      setAnalysis(null)
      setAnalysisError(failure instanceof Error ? failure.message : String(failure))
      analysisEngine.current = null
      e.terminate()
    })
    return () => {
      if (analysisEngine.current === e) {
        analysisEpoch.current++
        analysisEngine.current = null
      }
      e.terminate()
    }
  }, [analysisEnabled, game, thinking, restoring, aiToMove, error, winner, strength, cancelAnalysis])

  const play = useCallback(
    (move: EngineMove) => {
      if (!game || restoring || error || busy.current || thinking || winner || auto || game.moves.length >= PLY_LIMIT) return
      if (!game.legal.some((legal) => legal.text === move.text)) return
      setPaused(false)
      void load([...game.moves, move.text], game)
    },
    [game, restoring, error, thinking, winner, auto, load],
  )

  const restart = useCallback(
    (moves: string[], preserveTimeline = false, from?: Game) => {
      cancelAnalysis()
      epoch.current++
      engine.current?.terminate()
      engine.current = new TaikyokuEngine()
      busy.current = false
      setManual(false)
      setPaused(false)
      searching.current = -1
      setThinking(false)
      setScore(null)
      updateAuto(false)
      void load(moves, from, preserveTimeline)
    },
    [load, cancelAnalysis],
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

  const setAuto = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        if (!game || restoring || game.moves.length !== timeline.length || error) return
        cancelAnalysis()
        setPaused(false)
        updateAuto(true)
        return
      }
      if (game) {
        restart(game.moves, true)
        setPaused(true)
      }
    },
    [game, restoring, timeline.length, error, restart, cancelAnalysis],
  )

  const engineMove = useCallback(() => {
    if (!game || restoring || game.moves.length !== timeline.length || error || busy.current || winner || !game.legal.length || game.moves.length >= PLY_LIMIT)
      return
    cancelAnalysis()
    setManual(true)
  }, [game, restoring, timeline.length, error, winner, cancelAnalysis])

  const seek = useCallback(
    (cursor: number, animate = false) => {
      const at = Math.max(0, Math.min(timeline.length, cursor))
      const from = animate && game && at === game.moves.length + 1 ? game : undefined
      restart(timeline.slice(0, at), true, from)
      setPaused(true)
    },
    [timeline, game, restart],
  )

  const exportState = useCallback(
    (): SavedTaikyoku => ({
      version: 1,
      variant: 'taikyoku',
      moves: [...timeline],
      cursor: game?.moves.length ?? 0,
      strength,
      evaluations: evaluations.map((value) => value ?? null),
    }),
    [timeline, game, strength, evaluations],
  )

  const importState = useCallback(
    async (value: unknown): Promise<boolean> => {
      if (!value || typeof value !== 'object' || busy.current || !game) return false
      const saved = value as Partial<SavedTaikyoku>
      if (
        saved.version !== 1 ||
        saved.variant !== 'taikyoku' ||
        !Array.isArray(saved.moves) ||
        saved.moves.length > PLY_LIMIT ||
        !saved.moves.every((move) => typeof move === 'string' && !!parseMove(move)) ||
        !Number.isInteger(saved.cursor) ||
        saved.cursor! < 0 ||
        saved.cursor! > saved.moves.length ||
        !saved.strength ||
        !['nap', 'normal', 'deep'].includes(saved.strength) ||
        !Array.isArray(saved.evaluations) ||
        saved.evaluations.length > saved.moves.length + 1 ||
        !saved.evaluations.every((score) => score === null || (typeof score === 'number' && Number.isFinite(score)))
      )
        return false
      cancelImport()
      cancelAnalysis()
      const e = new TaikyokuEngine()
      importEngine.current = e
      const mine = importEpoch.current
      const current = () => mine === importEpoch.current && importEngine.current === e
      setRestoring(true)
      try {
        await e.run('position startpos')
        if (!current()) return false
        let lines = await e.run('d')
        let snap = parseSnapshot(lines)
        if (!snap) return false
        const entries: TimelineEntry[] = []
        const history = new Map<number, CaptureEntry[]>([[0, []]])
        const nativeEvaluations: (number | undefined)[] = []
        let captures: CaptureEntry[] = []
        for (let ply = 0; ply <= saved.moves.length; ply++) {
          if (!current()) return false
          const evaluated = await e.run('eval')
          const cp = Number(evaluated.find((line) => line.startsWith('eval '))?.split(' ')[1])
          if (!Number.isFinite(cp)) return false
          nativeEvaluations[ply] = saved.evaluations[ply] ?? (snap.turn === 'b' ? cp : -cp)
          if (ply === saved.moves.length) break
          if (winnerOf(snap)) return false
          const move = parseMove(saved.moves[ply])
          const legal = (await e.run('moves'))[0]?.split(' ').slice(1) ?? []
          if (!move || !legal.includes(move.text)) return false
          const piece = cellAt(snap.grid, move.from)
          if (!piece) return false
          const tsn = lines.find((line) => line.includes('/') && / [bw] \d+ \d+$/.test(line))
          if (!tsn) return false
          const positioned = await e.run(`position tsn ${tsn} moves ${move.text}`)
          if (positioned.some((line) => line.startsWith('info string jugada ilegal'))) return false
          lines = await e.run('d')
          const next = parseSnapshot(lines)
          if (!next) return false
          entries.push({ move, piece, side: snap.turn })
          const taken = capturedAfter(snap, next, move)
          if (taken.length) captures = [...captures, ...taken]
          history.set(ply + 1, captures)
          snap = next
        }
        const cursor = saved.cursor!
        const moves = saved.moves.slice(0, cursor)
        const result = await sync(e, moves)
        if (!current() || !result) return false
        epoch.current++
        engine.current?.terminate()
        engine.current = e
        importEngine.current = null
        capturesByPly.current = history
        const restoredCaptures = history.get(cursor) ?? []
        setGame({
          ...result,
          captured: restoredCaptures.map((entry) => entry.cell),
          captures: restoredCaptures,
          animate: false,
          previous: null,
          moves,
          last: moves.length ? parseMove(moves[moves.length - 1]) : null,
        })
        setTimeline([...saved.moves])
        setTimelineEntries(entries)
        setStrength(saved.strength)
        setEvaluations(nativeEvaluations)
        setScore({ cp: nativeEvaluations[cursor] ?? result.evaluation.cp, depth: 0 })
        searching.current = -1
        busy.current = false
        updateAuto(false)
        setManual(false)
        setPaused(true)
        setThinking(false)
        setError('')
        return true
      } catch {
        return false
      } finally {
        if (importEngine.current === e) {
          importEngine.current = null
          e.terminate()
        }
        if (mine === importEpoch.current) setRestoring(false)
      }
    },
    [game, cancelImport, cancelAnalysis],
  )

  return {
    timeline,
    timelineEntries,
    cursor: game?.moves.length ?? 0,
    seek,
    engineMove,
    game,
    thinking,
    score,
    evaluations,
    restoring,
    exportState,
    importState,
    analysis,
    analyzing,
    analysisError,
    auto,
    setAuto,
    strength,
    setStrength,
    winner,
    error,
    play,
    undo,
    reset,
  }
}
