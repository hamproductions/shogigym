import { useTranslation } from 'react-i18next'
import { moveText, positionOf } from '../../../shogi'
import { sideMark } from '../../lib/notation'
import { useSettings } from '../../settings'
import { TESUJI_DRILLS, TESUJI_KINDS, tesujiStats } from '../../tesujiDrills'
import type { TesujiState, TesujiTrainer } from './useTesuji'

export function TesujiPane({ trainer, drill }: { trainer: TesujiTrainer; drill: TesujiState }) {
  const { t } = useTranslation()
  const lang = useSettings().lang
  const stats = tesujiStats()
  const pool = TESUJI_DRILLS.filter((d) => drill.filter === 'all' || d.tesuji === drill.filter)
  const { sfen } = drill.item
  const side = sideMark(positionOf(sfen).color)
  return (
    <div className="ws-practice">
      <div className="ws-seg small ws-tesuji-filter" role="group" aria-label={t('tesuji.tesujiType')}>
        {['all', ...TESUJI_KINDS].map((k) => (
          <button key={k} className={drill.filter === k ? 'on' : ''} onClick={() => trainer.start(k)}>
            {k === 'all' ? t('tesuji.mixed') : k}
          </button>
        ))}
      </div>
      <p className="ws-task">
        {t('tesuji.toMoveFindThe', { side })}
        {drill.hint || drill.status !== 'asking' ? <strong>{drill.item.tesuji}</strong> : t('tesuji.tesuji')}
        {t('tesuji.findTheEnd')}
      </p>
      {drill.status === 'asking' && drill.wrong && <p className="ws-result wrong">{drill.hint ? t('tesuji.isNotItLookAgain', { move: moveText(sfen, drill.wrong) }) : t('tesuji.isNotItLookAgain2', { move: moveText(sfen, drill.wrong) })}</p>}
      {drill.status === 'asking' && drill.hint && <p className="ws-note">{drill.item.explain}</p>}
      {drill.status !== 'asking' && (
        <div className={`ws-card ${drill.status === 'right' ? 'good' : ''}`}>
          <strong>
            {drill.status === 'right' ? '✓ ' : ''}
            {moveText(sfen, drill.item.answer)}: {drill.item.tesuji} {lang !== 'ja' && <span className="ws-muted">({drill.item.en})</span>}
          </strong>
          <p>{drill.item.explain}</p>
          {drill.item.note && <p className="ws-note">{drill.item.note}</p>}
          <p className="ws-muted">{t('tesuji.from', { from: drill.item.from })}</p>
        </div>
      )}
      <div className="ws-actions">
        <button className="primary" onClick={trainer.next}>
          {t('tesuji.next')}
        </button>
        {drill.status === 'asking' && !drill.hint && <button onClick={trainer.hint}>{t('tesuji.hint')}</button>}
        {drill.status === 'asking' && <button onClick={trainer.reveal}>{t('tesuji.showAnswer')}</button>}
      </div>
      <p className="ws-muted">{t('tesuji.solvedFirstTryOf', { value: pool.filter((d) => stats.solved.includes(d.id)).length, poolCount: pool.length })}</p>
    </div>
  )
}
