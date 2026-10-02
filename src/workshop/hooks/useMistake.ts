import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { reviewMove, type MoveReview } from '../../analysis'
import type { JosekiMove, JosekiNode } from '../../model'
import { moveText } from '../../shogi'
import { mistakeIsBad, type Mistake, type ShownMistake } from '../lib/mistake'
import type { Tab } from '../types'
import type { BoardSession } from './useBoardSession'

function refutationOf(deviation: JosekiMove | undefined) {
  const line: string[] = []
  let n: JosekiNode | null | undefined = deviation?.child
  while (n && n.branches.length && line.length < 6) {
    const next: JosekiMove = n.branches.find((b) => b.kind === 'main') ?? n.branches[0]
    line.push(next.usi)
    n = next.child
  }
  return line
}

export function useMistake(session: BoardSession, setTab: (tab: Tab) => void) {
  const { t } = useTranslation()
  const [mistake, setMistake] = useState<ShownMistake | null>(null)

  async function show(usi: string, expected: string, deviation?: JosekiMove, reason?: string) {
    let refutation = refutationOf(deviation)
    let loss: number | null = null
    let verdict: MoveReview | undefined
    if (session.ai) {
      verdict = await reviewMove(session.liveSfen, usi, { movetime: 600 })
      if (!deviation?.child && verdict.reply) refutation = verdict.reply.pv.slice(0, session.modeRef.current === 'tsume' ? 1 : 5)
      loss = Math.max(0, Math.round(verdict.loss * 100))
    }
    session.setSelection(null)
    session.setPromotion(null)
    const found: Mistake = { usi, loss, known: deviation?.kind === 'deviation' || !!reason, verdict }
    setMistake({ base: session.cursor, expected, note: reason ?? deviation?.punishNote ?? deviation?.note, ...found })
    if (mistakeIsBad(found)) session.startPreview([usi, ...refutation], t('workshop.whyFails', { move: moveText(session.liveSfen, usi) }), 1)
    setTab('coach')
    return verdict
  }

  return { mistake, setMistake, show, previewing: !!session.preview && !!mistake }
}

export type Mistakes = ReturnType<typeof useMistake>
