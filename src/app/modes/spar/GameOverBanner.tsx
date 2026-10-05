import './game-over.css'
import { useTranslation } from 'react-i18next'
import { useSession } from '@/app/hooks/session'
import { flipTable } from '@/utils/events'
import type { Spar } from './useSpar'
import { Button } from '@/app/ui/Button'

export function GameOverBanner({ spar, flatView }: { spar: Spar; flatView: boolean }) {
  const { t } = useTranslation()
  const { mode, gameOver, toMove, userSide, sfen } = useSession()
  const flagged = mode === 'spar' ? spar.flagged : null
  const winner = (side: 'sente' | 'gote') => t(side === 'sente' ? 'common.sente' : 'common.gote')
  const other = (side: 'sente' | 'gote') => (side === 'sente' ? 'gote' : 'sente')
  const headline = flagged && !gameOver ? t('app.outOfTime') : spar.resigned && !gameOver ? t('app.resigned') : t('app.checkmate')
  const detail =
    flagged && !gameOver
      ? t(flagged === userSide ? 'app.youFlagged' : 'app.aiFlagged', { winner: winner(other(flagged)) })
      : spar.resigned && !gameOver
        ? t('app.youResigned', { winner: winner(other(userSide)) })
        : t(mode !== 'spar' ? 'app.wins' : other(toMove) === userSide ? 'app.youWin' : 'app.aiWins', { winner: winner(other(toMove)) })
  return (
    <div className="app-gameover" role="status">
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
    </div>
  )
}
