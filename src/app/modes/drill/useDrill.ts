import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InitialPositionSFEN } from 'tsshogi'
import { colorSide, positionOf } from '@/utils/shogi'
import { record } from '@/utils/srs'
import type { BoardArrow } from '@/rendering/Board3D'
import type { BoardSession } from '@/app/hooks/useBoardSession'
import type { Mistakes } from '@/app/hooks/useMistake'
import { buildQueue, expectedMoves, reviewCounts, type ReviewItem, type ReviewQueue } from '@/app/practice'
import type { Tab } from '@/app/types'

export interface DrillState {
  queue: ReviewQueue
  items: ReviewItem[]
  index: number
  base: number
  result: null | 'right' | 'wrong'
  retry: boolean
  answered: number
}

const LESSON_GREEN = '#4f8a2a'

export function useDrill(session: BoardSession, { mistakes, setTab }: { mistakes: Mistakes; setTab: (tab: Tab) => void }) {
  const { t } = useTranslation()
  const [drill, setDrill] = useState<DrillState | null>(null)
  const item = drill && session.mode === 'drill' ? drill.items[drill.index] : undefined
  const asking = !!item && !drill?.result

  const show = (queue: ReviewQueue, items: ReviewItem[], index: number, retry = false, answered = 0) => {
    const next = items[index]
    if (!next) {
      session.setMode('drill')
      setTab('coach')
      session.setPreview(null)
      mistakes.setMistake(null)
      session.setCourse(null)
      session.setGame({ start: InitialPositionSFEN.STANDARD, moves: [] })
      session.setCursor(0)
      session.setPlyBase(0)
      session.setFlipped(false)
      return setDrill({ queue, items, index, base: 0, result: null, retry: false, answered })
    }
    if (next.kind === 'position') {
      session.setPlyBase(0)
      session.setGame({ start: next.course.root.sfen, moves: next.moves })
      session.setCursor(next.moves.length)
      session.setUserSide(next.course.userSide)
      session.setFlipped(next.course.userSide === 'gote')
      session.setCourse(next.course)
    } else {
      session.setGame({ start: next.mistake.sfen, moves: [] })
      session.setCursor(0)
      session.setPlyBase(next.mistake.ply - 1)
      const side = colorSide(positionOf(next.mistake.sfen).color)
      session.setUserSide(side)
      session.setFlipped(side === 'gote')
      session.setCourse(null)
    }
    session.setMode('drill')
    session.setPreview(null)
    session.setSelection(null)
    mistakes.setMistake(null)
    setDrill({ queue, items, index, base: next.kind === 'position' ? next.moves.length : 0, result: null, retry, answered })
    setTab('coach')
  }

  const start = (queue: ReviewQueue) => show(queue, buildQueue(queue), 0)
  const startDefault = () => {
    const counts = reviewCounts()
    start(counts.due === 0 && counts.mistakes > 0 ? 'mistakes' : 'due')
  }

  const commit = (usi: string) => {
    if (!asking || !drill || session.cursor !== drill.base || !item) return false
    const expected = expectedMoves(item)
    const ok = expected.includes(usi)
    if (!drill.retry) record(item.key, ok)
    setDrill({ ...drill, result: ok ? 'right' : 'wrong', answered: drill.retry ? drill.answered : drill.answered + 1 })
    if (ok) return false
    void mistakes.show(usi, expected[0], item.kind === 'position' ? item.node.branches.find((b) => b.usi === usi) : undefined)
    return true
  }

  const arrows: BoardArrow[] =
    item && !session.preview && (drill?.result === 'wrong' || (drill?.queue === 'new' && !drill.result))
      ? [{ usi: expectedMoves(item)[0], color: LESSON_GREEN }]
      : []

  const instruction = () => {
    if (!item) return t('app.pickWhatToReview')
    if (drill?.result) return t('app.nextCardWhenYouAre')
    if (item.kind === 'mistake') return t('app.findABetterMoveThan')
    return drill?.queue === 'new' ? t('app.learnThisMovePlayThe') : t('app.playTheMoveYouLearned')
  }

  return {
    drill,
    item,
    asking,
    hidesAnswer: asking && drill?.queue !== 'new',
    arrows,
    title: item && drill ? t('app.reviewCardOf', { value: drill.index + 1, itemsCount: drill.items.length }) : t('app.review'),
    instruction,
    start,
    startDefault,
    next: () => drill && show(drill.queue, drill.items, drill.index + 1, false, drill.answered),
    retry: () => drill && show(drill.queue, drill.items, drill.index, true, drill.answered),
    commit,
  }
}

export type Drill = ReturnType<typeof useDrill>
