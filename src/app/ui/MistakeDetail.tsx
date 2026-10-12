import '@/app/dialogs/insights.css'
import '@/app/dialogs/report.css'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Weakness } from '@/utils/learning'
import { colorSide, moveText, positionOf } from '@/utils/shogi'
import { PositionView } from '@/rendering/PositionView'

type Props = { sfen: string; played: string; best: string; tag: Weakness; loss: number; reason?: string; showPlayed?: boolean }

/**
 * What went wrong in plain words. The played and better moves are tinted red and green, the same colours
 * they have on the small position picture beside the text (tap the picture to enlarge it).
 */
export function MistakeDetail({ sfen, played, best, tag, loss, reason, showPlayed }: Props) {
  const { t, i18n } = useTranslation()
  const [big, setBig] = useState(false)
  const stop = i18n.language === 'ja' ? '。' : '. '
  return (
    <div className={`app-mistake${big ? ' big' : ''}`}>
      <div className="app-mistake-text">
        <p className="app-mistake-what">
          {showPlayed && (
            <>
              {t('report.youPlayed')} <span className="app-mv played">{moveText(sfen, played)}</span>
              {stop}
            </>
          )}
          <em>
            {t(`report.weak.${tag}.name`)}
            {stop}
          </em>
          {t(`report.weak.${tag}.what`)}
          {best !== played && (
            <>
              {' '}
              {t('report.betterWas')} <span className="app-mv best">{moveText(sfen, best)}</span>{' '}
              {t('report.keepsMore', { percent: Math.max(1, Math.round(loss * 100)) })}
            </>
          )}
        </p>
        {reason && <p className="app-muted">{reason}</p>}
      </div>
      <button type="button" className="app-mistake-board" onClick={() => setBig((v) => !v)} aria-expanded={big} aria-label={t('report.enlargePosition')}>
        <PositionView sfen={sfen} played={played} best={best} flipped={colorSide(positionOf(sfen).color) === 'gote'} />
      </button>
    </div>
  )
}
