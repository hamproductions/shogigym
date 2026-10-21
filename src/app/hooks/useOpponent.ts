import { useEffect, useMemo, useRef, useState } from 'react'
import { scoreWinRate, usiPosition } from '@/utils/analysis'
import { analyze, engineSupported, useEngineStatus } from '@/utils/engine'
import { mainBranch, resolveAiStrategy, strategyReply, strip } from '@/utils/book'
import { colorSide, otherSide, positionOf } from '@/utils/shogi'
import { STRENGTH, type SparGame } from '@/appearance/settings'
import type { LessonMode } from '@/app/types'
import type { AiEnd } from '@/app/modes/spar/useSpar'
import type { BoardSession } from './useBoardSession'
import { useLatest } from './useLatest'

export type Reply = { key: string; usi: string; note?: string; source: 'book' | 'ai'; until?: number }

type Pace = (move: { book: boolean; sharp: boolean }) => number

const HOPELESS = 0.03

const pieces = (sfen: string) => sfen.split(' ')[0].replace(/[^a-zA-Z]/g, '').length

export function useOpponent(
  session: BoardSession,
  { lessonMode, halted, sparGame, pace, onAiEnd }: { lessonMode: LessonMode; halted: boolean; sparGame: SparGame; pace: Pace; onAiEnd: (end: AiEnd) => void },
) {
  const { epoch } = useEngineStatus()
  const { mode, course, nodes, atEnd, toMove, userSide, liveSfen, preview, play, gameOver, game, sfens } = session
  const spar = mode === 'spar'
  const end = sfens.length - 1
  const endTurn = useMemo(() => colorSide(positionOf(sfens[end]).color), [sfens, end])
  const base = spar ? sfens[end] : liveSfen
  const prev = sfens[end - 1]
  const turn = spar ? endTurn : toMove
  const [pending, setPending] = useState<Reply | null>(null)
  const paceRef = useLatest(pace)
  const endAiRef = useLatest(onAiEnd)
  const hopeless = useRef({ ply: -1, count: 0 })
  const fresh = game.moves.length === 0
  const [strategy, setStrategy] = useState(() => resolveAiStrategy(sparGame.aiStrategy, otherSide(userSide)))
  useEffect(() => {
    if (fresh) setStrategy(resolveAiStrategy(sparGame.aiStrategy, otherSide(userSide)))
  }, [fresh, game.start, sparGame.aiStrategy, userSide])

  useEffect(() => {
    if ((mode !== 'lesson' && !spar) || (mode === 'lesson' && !course) || turn === userSide || halted || gameOver) return
    let cancelled = false
    const started = performance.now()
    const sharp = positionOf(base).checked || (!!prev && pieces(base) < pieces(prev))
    const landAt = (book: boolean) => started + paceRef.current({ book, sharp })
    const book = mode === 'lesson' ? mainBranch(nodes?.get(strip(base))) : undefined
    const run = async () => {
      if (book) return setPending({ key: base, usi: book.usi, note: book.note, source: 'book' })
      const planned = spar && strategy ? await strategyReply(strategy, otherSide(userSide), base, game.moves.length) : undefined
      if (cancelled) return
      if (planned) return setPending({ key: base, usi: planned.usi, note: planned.note, source: 'book', until: landAt(true) })
      if (mode === 'lesson' || !engineSupported()) return
      const level = STRENGTH[sparGame.opponent]
      const result = await analyze(usiPosition(base), { multipv: level.pickFrom, movetime: level.movetime, book: !!strategy })
      if (cancelled) return
      const top = result.candidates[0] ? scoreWinRate(result.candidates[0].score) : 0
      const pool = result.candidates.filter((c) => top - scoreWinRate(c.score) <= level.maxLoss)
      const pick = pool[Math.floor(Math.random() * pool.length)]?.move ?? result.bestmove
      const ply = game.moves.length
      const lost = (sparGame.opponent === 'strong' || sparGame.opponent === 'max') && !!result.candidates[0] && top < HOPELESS
      const { ply: seen, count } = hopeless.current
      hopeless.current = !lost ? { ply: -1, count: 0 } : seen === ply ? hopeless.current : { ply, count: seen === ply - 2 ? count + 1 : 1 }
      if (pick === 'resign' || hopeless.current.count >= 3) return endAiRef.current('resign')
      if (pick === 'win') return endAiRef.current('declare')
      if (pick) setPending({ key: base, usi: pick, source: 'ai', until: landAt(false) })
    }
    run().catch((error) => {
      if (!cancelled) console.warn('opponent analysis failed', error)
    })
    return () => {
      cancelled = true
    }
  }, [mode, spar, turn, userSide, base, nodes, course, sparGame.opponent, strategy, halted, gameOver, epoch, game.moves.length, prev, paceRef, endAiRef])

  const due = !halted && !gameOver && !preview && pending && pending.key === base && (mode === 'lesson' || spar) && turn !== userSide ? pending : null
  const reply = due && (atEnd || mode === 'lesson') ? due : null

  const playRef = useLatest(play)
  const endRef = useLatest(end)
  const armed = spar || atEnd
  useEffect(() => {
    if (!due || !armed || (mode === 'lesson' && lessonMode === 'study')) return
    const wait = spar ? Math.max(900, (due.until ?? 0) - performance.now()) : 1000
    const timer = setTimeout(() => (spar ? playRef.current(due.usi, endRef.current) : playRef.current(due.usi)), wait)
    return () => clearTimeout(timer)
  }, [due, armed, spar, mode, lessonMode, playRef, endRef])

  return { reply, forget: () => setPending(null) }
}
