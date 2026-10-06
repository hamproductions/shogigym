import './game-over.css'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { useSession } from '@/app/hooks/session'
import { flipTable } from '@/utils/events'
import { otherSide, type Side } from '@/utils/shogi'
import type { Mode } from '@/app/types'
import type { Spar } from './useSpar'
import { Button } from '@/app/ui/Button'

function endText(
  t: TFunction,
  {
    flagged,
    resigned,
    gameOver,
    mode,
    toMove,
    userSide,
  }: { flagged: Side | null; resigned: boolean; gameOver: boolean; mode: Mode; toMove: Side; userSide: Side },
) {
  const winner = (side: Side) => t(side === 'sente' ? 'common.sente' : 'common.gote')
  if (flagged && !gameOver) {
    return { headline: t('app.outOfTime'), detail: t(flagged === userSide ? 'app.youFlagged' : 'app.aiFlagged', { winner: winner(otherSide(flagged)) }) }
  }
  if (resigned && !gameOver) {
    return { headline: t('app.resigned'), detail: t('app.youResigned', { winner: winner(otherSide(userSide)) }) }
  }
  let key: 'app.wins' | 'app.youWin' | 'app.aiWins' = 'app.aiWins'
  if (mode !== 'spar') key = 'app.wins'
  else if (otherSide(toMove) === userSide) key = 'app.youWin'
  return { headline: t('app.checkmate'), detail: t(key, { winner: winner(otherSide(toMove)) }) }
}

export function GameOverBanner({ spar, flatView }: { spar: Spar; flatView: boolean }) {
  const { t } = useTranslation()
  const { mode, gameOver, toMove, userSide, sfen } = useSession()
  const flagged = mode === 'spar' ? spar.flagged : null
  const { headline, detail } = endText(t, { flagged, resigned: spar.resigned, gameOver, mode, toMove, userSide })
  return (
    <output className="app-gameover">
      <Button
        variant="icon"
        className="app-gameover-x"
        onClick={() => spar.setEndHidden(sfen)}
        aria-label={t('app.hideThisAndLookAt')}
        title={t('app.lookAtTheBoard')}
      >
        ×
      </Button>
      <strong>{headline}</strong>
      <span>{detail}</span>
      <div className="app-actions">
        {mode === 'spar' && !flatView && <Button onClick={flipTable}>{t('rail.tableFlip')}</Button>}
        {mode === 'spar' && <Button onClick={spar.reviewGame}>{t('app.reviewThisGame')}</Button>}
        {mode === 'spar' && (
          <Button variant="primary" onClick={() => spar.setNewGameOpen(true)}>
            {t('app.newGame')}
          </Button>
        )}
      </div>
    </output>
  )
}
