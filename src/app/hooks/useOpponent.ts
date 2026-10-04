import { useEffect, useState } from 'react'
import { scoreWinRate, usiPosition } from '../../analysis'
import { analyze, engineSupported, useEngineStatus } from '../../engine'
import { mainBranch, strategyMove, strip } from '../lib/book'
import { otherSide } from '../../shogi'
import { STRENGTH, useSettings } from '../../appearance/settings'
import type { LessonMode } from '../types'
import type { BoardSession } from './useBoardSession'

export type Reply = { key: string; usi: string; note?: string; source: 'book' | 'ai' }

export function useOpponent(session: BoardSession, { lessonMode, halted }: { lessonMode: LessonMode; halted: boolean }) {
  const settings = useSettings()
  const { epoch } = useEngineStatus()
  const { mode, course, nodes, atEnd, toMove, userSide, liveSfen, preview, play, gameOver } = session
  const [pending, setPending] = useState<Reply | null>(null)

  useEffect(() => {
    if ((mode !== 'lesson' && mode !== 'spar') || (mode === 'lesson' && !course) || (!atEnd && mode !== 'lesson') || toMove === userSide || halted || gameOver) return
    let cancelled = false
    const book = mode === 'lesson' ? mainBranch(nodes?.get(strip(liveSfen))) : undefined
    const run = async () => {
      if (book) return setPending({ key: liveSfen, usi: book.usi, note: book.note, source: 'book' })
      const planned = mode === 'spar' && settings.aiStrategy ? strategyMove(settings.aiStrategy, otherSide(userSide), liveSfen) : undefined
      if (planned) return setPending({ key: liveSfen, usi: planned.usi, note: planned.note, source: 'book' })
      if (mode === 'lesson' || !engineSupported()) return
      const level = STRENGTH[settings.opponent]
      const result = await analyze(usiPosition(liveSfen), { multipv: level.pickFrom, movetime: level.movetime })
      const top = result.candidates[0] ? scoreWinRate(result.candidates[0].score) : 0
      const pool = result.candidates.filter((c) => top - scoreWinRate(c.score) <= level.maxLoss)
      const pick = pool[Math.floor(Math.random() * pool.length)]?.move ?? result.bestmove
      if (!cancelled && pick && pick !== 'resign' && pick !== 'win') setPending({ key: liveSfen, usi: pick, source: 'ai' })
    }
    run().catch((error) => {
      if (!cancelled) console.warn('opponent analysis failed', error)
    })
    return () => {
      cancelled = true
    }
  }, [mode, atEnd, toMove, userSide, liveSfen, nodes, course, settings.opponent, settings.aiStrategy, halted, gameOver, epoch])

  const reply = !halted && !gameOver && !preview && pending && pending.key === liveSfen && (atEnd || mode === 'lesson') && (mode === 'lesson' || mode === 'spar') && toMove !== userSide ? pending : null

  useEffect(() => {
    if (!reply || !atEnd || (mode === 'lesson' && lessonMode === 'study')) return
    const timer = setTimeout(() => play(reply.usi), mode === 'spar' ? 900 : 1000)
    return () => clearTimeout(timer)
  }, [reply, atEnd, mode, lessonMode, play])

  return { reply, forget: () => setPending(null) }
}
