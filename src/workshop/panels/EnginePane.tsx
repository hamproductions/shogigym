import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { describeMove, scoreWinRate } from '../../analysis'
import { engineSupported, type Analysis, type Candidate } from '../../engine'
import i18n from '../../i18n'
import { applyUsi, moveText, pvText, type Side } from '../../shogi'
import { EngineName } from '../EngineSettings'
import type { BookMove } from '../lib/book'
import { sideMark, toSente } from '../lib/notation'
import { lossClass, winLoss } from '../lib/score'

function standing(rate: number) {
  const lead = Math.abs(Math.round(rate * 100) - 50) / 100
  const side = rate > 0.5 ? i18n.t('engine.sente') : i18n.t('engine.gote')
  if (lead < 0.04) return i18n.t('engine.thePositionIsEven')
  if (lead < 0.12) return i18n.t('engine.isSlightlyBetter', { side })
  if (lead < 0.25) return i18n.t('engine.isBetter', { side })
  if (lead < 0.4) return i18n.t('engine.isClearlyBetter', { side })
  return i18n.t('engine.isWinning', { side })
}

type EnginePaneProps = { sfen: string; toMove: Side; analysis: Analysis | null; showBest: boolean; setShowBest: (v: boolean) => void; onPlay: (usi: string) => void; canPlay: boolean; book: BookMove[] }

export function EnginePane({ sfen, toMove, analysis, showBest, setShowBest, onPlay, canPlay, book }: EnginePaneProps) {
  const { t } = useTranslation()
  const [lineOpen, setLineOpen] = useState(false)
  if (!engineSupported()) return <p className="ws-muted">{t('engine.theAiNeedsACross')}</p>
  if (!analysis || !analysis.candidates.length)
    return (
      <>
        <EngineName />
        <p className="ws-muted">{t('engine.analysingThePosition')}</p>
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
    <div className="ws-engine">
      <EngineName />
      <div className="ws-standing">
        <strong>{standing(senteRate)}</strong>
        <div className="ws-meter" aria-hidden="true">
          <span style={{ width: `${senteRate * 100}%` }} />
        </div>
        <span className="ws-muted">
          {t('engine.winChanceAgainst', { value: Math.round(senteRate * 100), value2: Math.round((1 - senteRate) * 100) })}
        </span>
      </div>

      <div className="ws-best">
        <span className="ws-muted">{t('engine.bestMoveFor', { side: sideMark(toMove) })}</span>
        <div className="ws-best-row">
          <strong>{moveText(sfen, best.move)}</strong>
          {book.some((b) => b.usi === best.move) && <span className="ws-pill">{t('engine.book')}</span>}
          {canPlay && <button onClick={() => onPlay(best.move)}>{t('engine.playIt')}</button>}
        </div>
        {why(best.move) && <p>{why(best.move)}</p>}
        {answer(best) && <p className="ws-muted">{t('engine.theyWouldLikelyAnswer', { move: answer(best) })}</p>}
      </div>

      {others.length > 0 && <h3 className="ws-sub">{t('engine.otherMoves')}</h3>}
      {others.map((c) => {
        const loss = winLoss(bestRate, c.score)
        return (
          <div key={c.multipv} className="ws-alt">
            <div className="ws-alt-row">
              <strong>{moveText(sfen, c.move)}</strong>
              <span className={lossClass(loss)}>{loss === 0 ? t('engine.justAsGood') : t('engine.winChance', { loss })}</span>
              {canPlay && <button onClick={() => onPlay(c.move)}>{t('engine.play')}</button>}
            </div>
            {why(c.move) && <p>{why(c.move)}</p>}
          </div>
        )
      })}

      <button className="ws-more" onClick={() => setLineOpen((v) => !v)}>
        {lineOpen ? t('engine.hideTheLine') : t('engine.seeHowTheBestLine')}
      </button>
      {lineOpen && <p className="ws-pv">{pvText(sfen, best.pv, 8)}</p>}

      <label className="ws-toggle">
        <input type="checkbox" checked={showBest} onChange={(e) => setShowBest(e.target.checked)} />
        <span>{t('engine.showTheBestMoveAs')}</span>
      </label>
    </div>
  )
}
