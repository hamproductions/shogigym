import '@/app/dialogs/insights.css'
import '@/app/dialogs/report.css'
import { useTranslation } from 'react-i18next'
import type { Weakness } from '@/utils/learning'
import { colorSide, moveText, positionOf } from '@/utils/shogi'
import { MiniBoard } from './MiniBoard'

/** What went wrong in plain words, with the position one tap away. */
export function MistakeDetail({
  sfen,
  played,
  best,
  tag,
  loss,
  reason,
}: {
  sfen: string
  played: string
  best: string
  tag: Weakness
  loss: number
  reason?: string
}) {
  const { t } = useTranslation()
  return (
    <div className="app-mistake">
      <p className="app-mistake-what">
        <em>{t(`report.weak.${tag}.name`)}.</em> {t(`report.weak.${tag}.what`)}
        {best !== played && ` ${t('report.betterKeeps', { move: moveText(sfen, best), percent: Math.max(1, Math.round(loss * 100)) })}`}
      </p>
      {reason && <p className="app-muted">{reason}</p>}
      <details className="app-mistake-board">
        <summary>{t('report.showPosition')}</summary>
        <MiniBoard sfen={sfen} played={played} best={best} flipped={colorSide(positionOf(sfen).color) === 'gote'} />
      </details>
    </div>
  )
}
