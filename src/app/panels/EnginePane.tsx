import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { css } from 'styled-system/css'
import { Box, styled } from 'styled-system/jsx'
import { describeMove, scoreWinRate } from '@/utils/analysis'
import { engineSupported, useEngineStatus, type Analysis, type Candidate } from '@/utils/engine'
import i18n from '@/utils/i18n'
import { applyUsi, moveText, pvText, type Side } from '@/utils/shogi'
import { EngineName } from '@/app/EngineSettings'
import type { BookMove } from '@/utils/book'
import { sideMark, toSente } from '@/utils/notation'
import { FlipMarks } from '@/app/ui/SideMark'
import { useFlipped } from '@/app/hooks/session'
import { lossClass, winLoss } from '@/utils/score'
import { Button } from '@/app/ui/Button'
import { Pill } from '@/app/ui/Pill'
import { Checkbox } from '@/components/ui'
import { muted, narrowColumn, pv, subHeading } from './panels.styles'

function standing(rate: number) {
  const lead = Math.abs(Math.round(rate * 100) - 50) / 100
  const side = rate > 0.5 ? i18n.t('engine.sente') : i18n.t('engine.gote')
  if (lead < 0.04) return i18n.t('engine.thePositionIsEven')
  if (lead < 0.12) return i18n.t('engine.isSlightlyBetter', { side })
  if (lead < 0.25) return i18n.t('engine.isBetter', { side })
  if (lead < 0.4) return i18n.t('engine.isClearlyBetter', { side })
  return i18n.t('engine.isWinning', { side })
}

type EnginePaneProps = {
  sfen: string
  toMove: Side
  analysis: Analysis | null
  showBest: boolean
  setShowBest: (v: boolean) => void
  onPlay: (usi: string) => void
  canPlay: boolean
  book: BookMove[]
}

export function EnginePane({ sfen, toMove, analysis, showBest, setShowBest, onPlay, canPlay, book }: EnginePaneProps) {
  const { t } = useTranslation()
  const status = useEngineStatus()
  if (!engineSupported())
    return (
      <div role="alert">
        <p className={muted}>{t('engine.theAiNeedsACross')}</p>
        <Button onClick={() => location.reload()}>{t('engine.reloadPage')}</Button>
      </div>
    )
  if (status.error) return <EngineName />
  if (status.loading)
    return (
      <div role="status" aria-busy="true">
        <EngineName />
      </div>
    )
  if (!analysis || !analysis.candidates.length)
    return (
      <>
        <EngineName />
        <p className={muted}>{t('engine.analysingThePosition')}</p>
      </>
    )
  const why = (usi: string) => {
    const note = book.find((b) => b.usi === usi)?.note
    const what = describeMove(sfen, usi)
    return [note, what.length ? `It ${what.join(', ')}.` : null].filter(Boolean).join(' ')
  }
  const answer = (c: Candidate) => {
    if (c.pv.length < 2) return null
    const after = applyUsi(sfen, c.move)
    return after ? moveText(after, c.pv[1]) : null
  }
  return (
    <EngineResultPane
      analysis={analysis}
      toMove={toMove}
      showBest={showBest}
      setShowBest={setShowBest}
      onPlay={onPlay}
      canPlay={canPlay}
      name={<EngineName />}
      formatMove={(move) => moveText(sfen, move)}
      formatPv={(pv) => pvText(sfen, pv, 8)}
      why={why}
      answer={answer}
      isBook={(move) => book.some((b) => b.usi === move)}
    />
  )
}

export function EngineResultPane({
  analysis,
  toMove,
  showBest,
  setShowBest,
  onPlay,
  canPlay,
  name,
  formatMove,
  formatPv,
  why = () => '',
  answer = () => null,
  isBook = () => false,
}: Omit<EnginePaneProps, 'sfen' | 'book' | 'analysis'> & {
  analysis: Analysis
  name: ReactNode
  formatMove: (move: string) => string
  formatPv: (pv: string[]) => string
  why?: (move: string) => string
  answer?: (candidate: Candidate) => string | null
  isBook?: (move: string) => boolean
}) {
  const { t } = useTranslation()
  const flipped = useFlipped()
  const [lineOpen, setLineOpen] = useState(false)
  const [best, ...others] = analysis.candidates
  const bestRate = scoreWinRate(best.score)
  const senteRate = scoreWinRate(toSente(best.score, toMove))
  return (
    <div className={narrowColumn}>
      {name}
      <Box
        pt="1"
        pb="3"
        borderBottom="1px solid {colors.border}"
        _narrow={{ order: '-1', display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', alignItems: 'center', gap: '{spacing.1} {spacing.2}', pb: '2' }}
        css={{ '@container (max-width: 400px)': { '@media not all and (max-width: 820px)': { display: 'flex', alignItems: 'center', gap: '2', pb: '1' } } }}
      >
        <styled.strong display="block" fontSize="lg" _narrow={{ display: 'none' }} css={{ '@container (max-width: 400px)': { display: 'none' } }}>
          {standing(senteRate)}
        </styled.strong>
        <styled.span
          display="none"
          whiteSpace="nowrap"
          fontVariantNumeric="tabular-nums"
          _narrow={{ display: 'block', fontSize: 'xs' }}
          css={{ '@container (max-width: 400px)': { display: 'block', fontSize: 'xs' } }}
          title={standing(senteRate)}
          aria-label={t('engine.winChanceAgainst', { value: Math.round(senteRate * 100), value2: Math.round((1 - senteRate) * 100) })}
        >
          <FlipMarks flipped={flipped}>{sideMark(senteRate >= 0.5 ? 'sente' : 'gote')}</FlipMarks> {Math.round(Math.max(senteRate, 1 - senteRate) * 100)}%
        </styled.span>
        <Box
          h="8px"
          m="{spacing.2} 0 {spacing.1.5}"
          borderRadius="full"
          bg="meter.track"
          overflow="hidden"
          _narrow={{ m: '0' }}
          css={{ '@container (max-width: 400px)': { flex: '1', m: '0' } }}
          aria-hidden="true"
        >
          <styled.span display="block" h="100%" bg="meter.fill" transition="width {durations.slowest} ease" style={{ width: `${senteRate * 100}%` }} />
        </Box>
        <styled.span
          color="fg.muted"
          fontSize="sm"
          _narrow={{ display: 'none', gridColumn: '1 / -1', fontSize: 'xs', whiteSpace: 'nowrap' }}
          css={{ '@container (max-width: 400px)': { display: 'none' } }}
        >
          {t('engine.winChanceAgainst', { value: Math.round(senteRate * 100), value2: Math.round((1 - senteRate) * 100) })}
        </styled.span>
      </Box>

      <Box py="3" borderBottom="1px solid {colors.border}" css={{ '& p': { m: '{spacing.1} 0 0', fontSize: 'sm' } }}>
        <span className={muted}>
          <FlipMarks flipped={flipped}>{t('engine.bestMoveFor', { side: sideMark(toMove) })}</FlipMarks>
        </span>
        <Box
          display="flex"
          alignItems="center"
          gap="2.5"
          _narrow={{ flexWrap: 'wrap' }}
          css={{ '& strong': { fontFamily: 'mincho', fontWeight: 'heavy', _narrow: { whiteSpace: 'nowrap' } }, '& .app-btn': { ml: 'auto' } }}
        >
          <styled.strong fontSize="2xl" lineHeight="tight" _narrow={{ fontSize: 'lg' }}>
            {formatMove(best.move)}
          </styled.strong>
          {isBook(best.move) && <Pill>{t('engine.book')}</Pill>}
          {canPlay && (
            <Button size="sm" variant="primary" onClick={() => onPlay(best.move)}>
              {t('engine.playIt')}
            </Button>
          )}
        </Box>
        {why(best.move) && <p>{why(best.move)}</p>}
        {answer(best) && <p className={muted}>{t('engine.theyWouldLikelyAnswer', { move: answer(best) })}</p>}
      </Box>

      {others.length > 0 && <h3 className={subHeading}>{t('engine.otherMoves')}</h3>}
      {others.map((c) => {
        const loss = winLoss(bestRate, c.score)
        return (
          <Box key={c.multipv} py="2.5" borderBottom="1px solid {colors.border}" css={{ '& p': { m: '{spacing.1} 0 0', fontSize: 'sm' } }}>
            <Box
              display="flex"
              alignItems="center"
              gap="2.5"
              _narrow={{ flexWrap: 'wrap' }}
              css={{ '& strong': { fontFamily: 'mincho', fontWeight: 'heavy', _narrow: { whiteSpace: 'nowrap' } }, '& .app-btn': { ml: 'auto' } }}
            >
              <styled.strong fontSize="lg">{formatMove(c.move)}</styled.strong>
              <span className={lossClass(loss)}>{loss === 0 ? t('engine.justAsGood') : t('engine.winChance', { loss })}</span>
              {canPlay && (
                <Button size="sm" onClick={() => onPlay(c.move)}>
                  {t('engine.play')}
                </Button>
              )}
            </Box>
            {why(c.move) && <p>{why(c.move)}</p>}
          </Box>
        )
      })}

      <styled.button
        p="{spacing.0.5} 0"
        m="{spacing.3} 0 {spacing.1.5}"
        color="fg.muted"
        fontSize="sm"
        textDecoration="underline"
        textUnderlineOffset="3px"
        transition="color {durations.fast}"
        _hover={{ color: 'fg.default' }}
        onClick={() => setLineOpen((v) => !v)}
      >
        {lineOpen ? t('engine.hideTheLine') : t('engine.seeHowTheBestLine')}
      </styled.button>
      {lineOpen && <p className={pv}>{formatPv(best.pv)}</p>}

      <Checkbox.Root
        size="sm"
        className={css({ display: 'flex', alignItems: 'center', gap: '2', m: '{spacing.3} 0 0', color: 'fg.muted', fontSize: 'sm', cursor: 'pointer' })}
        checked={showBest}
        onCheckedChange={(details) => setShowBest(details.checked === true)}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Label className={css({ fontWeight: 'regular', fontSize: 'sm', lineHeight: 'inherit' })}>{t('engine.showTheBestMoveAs')}</Checkbox.Label>
      </Checkbox.Root>
    </div>
  )
}
