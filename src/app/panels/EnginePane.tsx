import './engine.css'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { describeMove, scoreWinRate } from '@/utils/analysis'
import { engineSupported, useEngineStatus, type Analysis, type Candidate } from '@/utils/engine'
import i18n from '@/utils/i18n'
import { applyUsi, moveText, pvText, type Side } from '@/utils/shogi'
import { EngineName } from '@/app/EngineSettings'
import type { BookMove } from '@/utils/book'
import { sideMark, toSente } from '@/utils/notation'
import { lossClass, winLoss } from '@/utils/score'
import { Button } from '@/app/ui/Button'
import { Pill } from '@/app/ui/Pill'

function standing(rate: number) {
  const lead = Math.abs(Math.round(rate * 100) - 50) / 100
  const side = rate > 0.5 ? i18n.t('engine.sente') : i18n.t('engine.gote')
  if (lead < 0.04) return i18n.t('engine.thePositionIsEven')
  if (lead < 0.12) return i18n.t('engine.isSlightlyBetter', { side })
  if (lead < 0.25) return i18n.t('engine.isBetter', { side })
  if (lead < 0.4) return i18n.t('engine.isClearlyBetter', { side })
  return i18n.t('engine.isWinning', { side })
}

interface EnginePaneProps {
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
  const [lineOpen, setLineOpen] = useState(false)
  const status = useEngineStatus()
  if (!engineSupported())
    return (
      <div role="alert">
        <p className="app-muted">{t('engine.theAiNeedsACross')}</p>
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
        <p className="app-muted">{t('engine.analysingThePosition')}</p>
      </>
    )
  const [best, ...others] = analysis.candidates
  const bestRate = scoreWinRate(best.score)
  const senteRate = scoreWinRate(toSente(best.score, toMove))
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
    <div className="app-engine">
      <EngineName />
      <div className="app-standing">
        <strong className="app-standing-detail">{standing(senteRate)}</strong>
        <span
          className="app-standing-summary"
          title={standing(senteRate)}
          aria-label={t('engine.winChanceAgainst', { value: Math.round(senteRate * 100), value2: Math.round((1 - senteRate) * 100) })}
        >
          {sideMark(senteRate >= 0.5 ? 'sente' : 'gote')} {Math.round(Math.max(senteRate, 1 - senteRate) * 100)}%
        </span>
        <div className="app-meter" aria-hidden="true">
          <span style={{ width: `${senteRate * 100}%` }} />
        </div>
        <span className="app-muted app-standing-detail">
          {t('engine.winChanceAgainst', { value: Math.round(senteRate * 100), value2: Math.round((1 - senteRate) * 100) })}
        </span>
      </div>

      <div className="app-best">
        <span className="app-muted">{t('engine.bestMoveFor', { side: sideMark(toMove) })}</span>
        <div className="app-best-row">
          <strong>{moveText(sfen, best.move)}</strong>
          {book.some((b) => b.usi === best.move) && <Pill>{t('engine.book')}</Pill>}
          {canPlay && (
            <Button size="sm" variant="primary" onClick={() => onPlay(best.move)}>
              {t('engine.playIt')}
            </Button>
          )}
        </div>
        {why(best.move) && <p>{why(best.move)}</p>}
        {answer(best) && <p className="app-muted">{t('engine.theyWouldLikelyAnswer', { move: answer(best) })}</p>}
      </div>

      {others.length > 0 && <h3 className="app-sub">{t('engine.otherMoves')}</h3>}
      {others.map((c) => {
        const loss = winLoss(bestRate, c.score)
        return (
          <div key={c.multipv} className="app-alt">
            <div className="app-alt-row">
              <strong>{moveText(sfen, c.move)}</strong>
              <span className={lossClass(loss)}>{loss === 0 ? t('engine.justAsGood') : t('engine.winChance', { loss })}</span>
              {canPlay && (
                <Button size="sm" onClick={() => onPlay(c.move)}>
                  {t('engine.play')}
                </Button>
              )}
            </div>
            {why(c.move) && <p>{why(c.move)}</p>}
          </div>
        )
      })}

      <button className="app-more" onClick={() => setLineOpen((v) => !v)}>
        {lineOpen ? t('engine.hideTheLine') : t('engine.seeHowTheBestLine')}
      </button>
      {lineOpen && <p className="app-pv">{pvText(sfen, best.pv, 8)}</p>}

      <label className="app-toggle">
        <input type="checkbox" checked={showBest} onChange={(e) => setShowBest(e.target.checked)} />
        <span>{t('engine.showTheBestMoveAs')}</span>
      </label>
    </div>
  )
}
