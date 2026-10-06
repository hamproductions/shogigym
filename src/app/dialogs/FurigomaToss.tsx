import './furigoma-toss.css'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import type { Lang } from '@/appearance/settings'
import { Button } from '@/app/ui/Button'
import { pawnCount, tossSide } from '@/app/useFurigoma'
import type { Side } from '@/utils/shogi'

interface TossProps {
  faces: boolean[] | null
  spectator: boolean
  lang: Lang
  onStart: (side: Side) => void
  onCancel: () => void
}

function tossMessage(faces: boolean[] | null, spectator: boolean, lang: Lang, t: TFunction) {
  const ja = lang === 'ja'
  if (!faces) return ja ? '振り駒を行います' : 'Tossing five pawns…'
  const pawns = pawnCount(faces)
  const tokins = faces.filter((face) => !face).length
  const sente = pawns >= 3
  if (spectator) return t('watch.furigomaResult', { pawns, tokins, side: t(sente ? 'common.sente' : 'common.gote') })
  if (ja) return `歩${pawns}枚・と金${tokins}枚：あなたは${sente ? '先手' : '後手'}`
  return `${pawns} pawns · ${tokins} tokins: you play ${sente ? 'Sente' : 'Gote'}`
}

function tossHint(spectator: boolean, lang: Lang, t: TFunction) {
  if (spectator) return t('watch.starting')
  return lang === 'ja' ? 'どこかをクリックして対局開始' : 'Click anywhere to start'
}

/** Shown while the 3D furigoma toss is in flight; clicking anywhere confirms the result. */
export function FurigomaToss({ faces, spectator, lang, onStart, onCancel }: TossProps) {
  const { t } = useTranslation()
  return (
    <div className="app-toss">
      <button
        type="button"
        className="app-toss-hit"
        tabIndex={-1}
        aria-label={t('newGame.start')}
        disabled={!faces}
        onClick={() => faces && onStart(tossSide(faces))}
      />
      <div className="app-dialog app-toss-box">
        <p>
          <output>{tossMessage(faces, spectator, lang, t)}</output>
        </p>
        <div className="app-actions">
          <Button onClick={onCancel}>{t('app.cancel')}</Button>
          {faces && <span>{tossHint(spectator, lang, t)}</span>}
        </div>
      </div>
    </div>
  )
}
