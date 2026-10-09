import { Square } from 'tsshogi'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { colorSide, positionOf } from '@/utils/shogi'
import type { BoardArrow } from '@/rendering/Board3D'
import type { BoardSession } from '@/app/hooks/useBoardSession'
import type { Mistakes } from '@/app/hooks/useMistake'
import type { Load } from '@/app/hooks/useModeSwitch'
import { sideMark } from '@/utils/notation'
import { playSound } from '@/appearance/settings'
import { markTesuji, pickTesuji, type TesujiDrill } from '@/app/tesujiDrills'
import type { Tab } from '@/app/types'

export type TesujiState = { item: TesujiDrill; filter: string; status: 'asking' | 'right' | 'shown'; missed: boolean; hint: number; wrong?: string }

const ANSWER_GREEN = '#4f8a2a'

export function useTesuji(session: BoardSession, { mistakes, load, setTab }: { mistakes: Mistakes; load: Load; setTab: (tab: Tab) => void }) {
  const { t } = useTranslation()
  const [drill, setDrill] = useState<TesujiState | null>(null)
  const active = session.mode === 'tesuji'

  const start = (filter: string, exclude?: string) => {
    const item = pickTesuji(filter, exclude)
    if (!item) return
    load(item.sfen, colorSide(positionOf(item.sfen).color), 'tesuji', null)
    setDrill({ item, filter, status: 'asking', missed: false, hint: 0 })
    setTab('coach')
  }

  const commit = (usi: string) => {
    if (!drill || drill.status !== 'asking') return
    if (usi === drill.item.answer) {
      playSound('right')
      session.play(usi)
      markTesuji(drill.item.id, !drill.missed)
      setDrill({ ...drill, status: 'right' })
    } else {
      playSound('wrong')
      session.setSelection(null)
      setDrill({ ...drill, missed: true, wrong: usi })
      void mistakes.show(usi, drill.item.answer, undefined, t('tesuji.missesIt'))
    }
  }

  const arrows: BoardArrow[] = active && drill && drill.status === 'shown' && session.cursor === 0 ? [{ usi: drill.item.answer, color: ANSWER_GREEN }] : []

  return {
    drill,
    hidesAnswer: active && drill?.status === 'asking',
    arrows,
    title: `${t('app.tesuji')}: ${drill && drill.filter !== 'all' ? drill.filter : t('app.mixed')}`,
    instruction: () =>
      drill
        ? drill.status === 'asking'
          ? t('app.toMoveFindTheTesuji', { side: sideMark(session.position.color) })
          : t('app.nextDrillWhenYouAre')
        : t('app.findTheTesuji'),
    start,
    startDefault: () => start(drill?.filter ?? 'all'),
    next: () => drill && start(drill.filter, drill.item.id),
    hint: () => {
      if (!drill) return
      setDrill({ ...drill, hint: drill.hint + 1, missed: true })
      const usi = drill.item.answer
      if (drill.hint >= 1 && usi[1] !== '*') {
        const from = Square.newByUSI(usi.slice(0, 2))
        const piece = from && positionOf(drill.item.sfen).board.at(from)
        if (from && piece) session.setSelection({ from, color: piece.color })
      }
    },
    reveal: () => {
      if (!drill) return
      setDrill({ ...drill, status: 'shown', missed: true })
      markTesuji(drill.item.id, false)
    },
    commit,
  }
}

export type TesujiTrainer = ReturnType<typeof useTesuji>
