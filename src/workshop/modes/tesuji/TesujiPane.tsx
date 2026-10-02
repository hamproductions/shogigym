import { useTranslation } from 'react-i18next'
import { moveText, positionOf } from '../../../shogi'
import { sideMark } from '../../lib/notation'
import { useSettings } from '../../settings'
import { TESUJI_DRILLS, TESUJI_KINDS, tesujiStats } from '../../tesujiDrills'
import type { TesujiState, TesujiTrainer } from './useTesuji'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { Segmented } from '../../ui/Segmented'

export function TesujiPane({ trainer, drill, replaying, onBack }: { trainer: TesujiTrainer; drill: TesujiState; replaying: boolean; onBack: () => void }) {
  const { t } = useTranslation()
  const lang = useSettings().lang
  const stats = tesujiStats()
  const pool = TESUJI_DRILLS.filter((d) => drill.filter === 'all' || d.tesuji === drill.filter)
  const { sfen } = drill.item
  const side = sideMark(positionOf(sfen).color)
  return (
    <div className="ws-practice">
      <Segmented size="small" label={t('tesuji.tesujiType')} value={drill.filter} options={['all', ...TESUJI_KINDS].map((k) => ({ v: k, t: k === 'all' ? t('tesuji.mixed') : k }))} onChange={trainer.start} />
      <p className="ws-task">
        {t('tesuji.toMoveFindThe', { side })}
        {drill.hint || drill.status !== 'asking' ? <strong>{drill.item.tesuji}</strong> : t('tesuji.tesuji')}
        {t('tesuji.findTheEnd')}
      </p>
      {drill.status === 'asking' && drill.wrong && <p className="ws-result wrong">{drill.hint ? t('tesuji.isNotItLookAgain', { move: moveText(sfen, drill.wrong) }) : t('tesuji.isNotItLookAgain2', { move: moveText(sfen, drill.wrong) })}</p>}
      {drill.status === 'asking' && drill.hint && <p className="ws-note">{drill.item.explain}</p>}
      {drill.status !== 'asking' && (
        <Card tone={drill.status === 'right' ? 'good' : null}>
          <strong>
            {drill.status === 'right' ? '✓ ' : ''}
            {moveText(sfen, drill.item.answer)}: {drill.item.tesuji} {lang !== 'ja' && <span className="ws-muted">({drill.item.en})</span>}
          </strong>
          <p>{drill.item.explain}</p>
          {drill.item.note && <p className="ws-note">{drill.item.note}</p>}
          <p className="ws-muted">{t('tesuji.from', { from: drill.item.from })}</p>
        </Card>
      )}
      {replaying ? (
        <div className="ws-actions">
          <Button variant="primary" onClick={onBack}>
            {t('workshop.goBackAndTryAgain')}
          </Button>
        </div>
      ) : (
      <div className="ws-actions">
        {drill.status === 'asking' && !drill.hint && <Button onClick={trainer.hint}>{t('tesuji.hint')}</Button>}
        {drill.status === 'asking' && <Button onClick={trainer.reveal}>{t('tesuji.showAnswer')}</Button>}
        <Button variant={drill.status === 'asking' ? 'secondary' : 'primary'} onClick={trainer.next}>
          {t('tesuji.next')}
        </Button>
      </div>
      )}
      <p className="ws-muted">{t('tesuji.solvedFirstTryOf', { value: pool.filter((d) => stats.solved.includes(d.id)).length, poolCount: pool.length })}</p>
    </div>
  )
}
