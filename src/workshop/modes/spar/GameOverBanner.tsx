import { useTranslation } from 'react-i18next'
import { useSession } from '../../hooks/session'
import { flipTable } from '../../lib/events'
import type { Spar } from './useSpar'

export function GameOverBanner({ spar, flatView }: { spar: Spar; flatView: boolean }) {
  const { t } = useTranslation()
  const { mode, gameOver, toMove, userSide, sfen } = useSession()
  const flagged = mode === 'spar' ? spar.flagged : null
  const winner = (side: 'sente' | 'gote') => t(side === 'sente' ? 'common.sente' : 'common.gote')
  const other = (side: 'sente' | 'gote') => (side === 'sente' ? 'gote' : 'sente')
  const headline = flagged && !gameOver ? t('workshop.outOfTime') : spar.resigned && !gameOver ? t('workshop.resigned') : t('workshop.checkmate')
  const detail =
    flagged && !gameOver
      ? t(flagged === userSide ? 'workshop.youFlagged' : 'workshop.aiFlagged', { winner: winner(other(flagged)) })
      : spar.resigned && !gameOver
        ? t('workshop.youResigned', { winner: winner(other(userSide)) })
        : t(mode !== 'spar' ? 'workshop.wins' : other(toMove) === userSide ? 'workshop.youWin' : 'workshop.aiWins', { winner: winner(other(toMove)) })
  return (
    <div className="ws-gameover" role="status">
      <button className="ws-gameover-x" onClick={() => spar.setEndHidden(sfen)} aria-label={t('workshop.hideThisAndLookAt')} title={t('workshop.lookAtTheBoard')}>
        ×
      </button>
      <strong>{headline}</strong>
      <span>{detail}</span>
      <div className="ws-actions">
        {mode === 'spar' && !flatView && <button onClick={flipTable}>{t('rail.tableFlip')}</button>}
        {mode === 'spar' && <button onClick={spar.reviewGame}>{t('workshop.reviewThisGame')}</button>}
        {mode === 'spar' && (
          <button className="primary" onClick={() => spar.setNewGameOpen(true)}>
            {t('workshop.newGame')}
          </button>
        )}
      </div>
    </div>
  )
}
