import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { colorSide, positionOf } from '../../../shogi'
import type { BoardArrow } from '../../../rendering/Board3D'
import type { BoardSession } from '../../hooks/useBoardSession'
import type { Mistakes } from '../../hooks/useMistake'
import type { Load } from '../../hooks/useModeSwitch'
import { sideMark } from '../../lib/notation'
import { playSound } from '../../../appearance/settings'
import { markTesuji, pickTesuji, type TesujiDrill } from '../../tesujiDrills'
import type { Tab } from '../../types'

export type TesujiState = { item: TesujiDrill; filter: string; status: 'asking' | 'right' | 'shown'; missed: boolean; hint: boolean; wrong?: string }

const ANSWER_GREEN = '#4f8a2a'

export function useTesuji(session: BoardSession, { mistakes, load, setTab }: { mistakes: Mistakes; load: Load; setTab: (tab: Tab) => void }) {
  const { t } = useTranslation()
  const [drill, setDrill] = useState<TesujiState | null>(null)
  const active = session.mode === 'tesuji'

  const start = (filter: string, exclude?: string) => {
    const item = pickTesuji(filter, exclude)
    if (!item) return
    load(item.sfen, colorSide(positionOf(item.sfen).color), 'tesuji', null)
    setDrill({ item, filter, status: 'asking', missed: false, hint: false })
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
    instruction: () => (drill ? (drill.status === 'asking' ? t('app.toMoveFindTheTesuji', { side: sideMark(session.position.color) }) : t('app.nextDrillWhenYouAre')) : t('app.findTheTesuji')),
    start,
    startDefault: () => start(drill?.filter ?? 'all'),
    next: () => drill && start(drill.filter, drill.item.id),
    hint: () => drill && setDrill({ ...drill, hint: true, missed: true }),
    reveal: () => {
      if (!drill) return
      setDrill({ ...drill, status: 'shown', missed: true })
      markTesuji(drill.item.id, false)
    },
    commit,
  }
}

export type TesujiTrainer = ReturnType<typeof useTesuji>
