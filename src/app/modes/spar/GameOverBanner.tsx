import { useTranslation } from 'react-i18next'
import { Wrap } from 'styled-system/jsx'
import { useSession } from '@/app/hooks/session'
import { flipTable } from '@/utils/events'
import { moveText } from '@/utils/shogi'
import type { Spar } from './useSpar'
import { Button } from '@/app/ui/Button'
import { Text } from '@/components/ui'
import { GameOverHeadline, GameOverPanel } from './game-over.styles'
import { Marks } from '@/app/ui/SideMark'

export function GameOverBanner({ spar, flatView }: { spar: Spar; flatView: boolean }) {
  const { t } = useTranslation()
  const { mode, gameOver, toMove, userSide, sfen } = useSession()
  const flagged = mode === 'spar' ? spar.flagged : null
  const winner = (side: 'sente' | 'gote') => t(side === 'sente' ? 'common.sente' : 'common.gote')
  const other = (side: 'sente' | 'gote') => (side === 'sente' ? 'gote' : 'sente')
  const aiEnded = mode === 'spar' && !gameOver ? spar.aiEnded : null
  const headline = aiEnded
    ? t(aiEnded === 'resign' ? 'app.aiResignedHeadline' : 'app.aiDeclaredHeadline')
    : flagged && !gameOver
      ? t('app.outOfTime')
      : spar.resigned && !gameOver
        ? t('app.resigned')
        : t('app.checkmate')
  const detail = aiEnded
    ? t(aiEnded === 'resign' ? 'app.aiResignedYouWin' : 'app.aiDeclaredWin')
    : flagged && !gameOver
      ? t(flagged === userSide ? 'app.youFlagged' : 'app.aiFlagged', { winner: winner(other(flagged)) })
      : spar.resigned && !gameOver
        ? t('app.youResigned', { winner: winner(other(userSide)) })
        : t(mode !== 'spar' ? 'app.wins' : other(toMove) === userSide ? 'app.youWin' : 'app.aiWins', { winner: winner(other(toMove)) })
  const summary = spar.summary()
  const firstBad = summary?.firstBad
  const facts = summary && [
    t('app.gameMoves', { count: summary.moves }),
    ...(summary.reviewed ? [t('app.gameBadMoves', { count: summary.bad })] : []),
    ...(firstBad ? [t('app.gameFirstBad', { ply: firstBad.ply, move: moveText(firstBad.sfen, firstBad.usi) })] : []),
  ]
  return (
    <GameOverPanel role="status">
      <Button
        variant="icon"
        position="absolute"
        top="1"
        right="1"
        onClick={() => spar.setEndHidden(sfen)}
        aria-label={t('app.hideThisAndLookAt')}
        title={t('app.lookAtTheBoard')}
      >
        ×
      </Button>
      <GameOverHeadline>
        <Marks>{headline}</Marks>
      </GameOverHeadline>
      <span>
        <Marks>{detail}</Marks>
      </span>
      {facts && (
        <Text as="span" tone="muted" size="sm">
          <Marks>{facts.join(' · ')}</Marks>
        </Text>
      )}
      <Wrap gap="2" align="center" justifyContent="center" mt="1">
        {mode === 'spar' && !flatView && <Button onClick={flipTable}>{t('rail.tableFlip')}</Button>}
        {mode === 'spar' && (
          <Button variant={firstBad ? 'primary' : 'secondary'} onClick={spar.reviewGame}>
            {t('app.reviewThisGame')}
          </Button>
        )}
        {mode === 'spar' && (
          <Button variant={firstBad ? 'secondary' : 'primary'} onClick={spar.rematch}>
            {t('app.rematch')}
          </Button>
        )}
        {mode === 'spar' && <Button onClick={() => spar.setNewGameOpen(true)}>{t('app.newGame')}</Button>}
      </Wrap>
    </GameOverPanel>
  )
}
