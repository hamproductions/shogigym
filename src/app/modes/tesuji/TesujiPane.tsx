import { useTranslation } from 'react-i18next'
import { moveText, positionOf } from '@/utils/shogi'
import { sideMark } from '@/utils/notation'
import { useSettings } from '@/appearance/settings'
import { TESUJI_DRILLS, tesujiStats } from '@/app/tesujiDrills'
import type { TesujiState, TesujiTrainer } from './useTesuji'
import { Button } from '@/app/ui/Button'
import { Card } from '@/app/ui/Card'

export function TesujiPane({ trainer, drill, replaying, onBack }: { trainer: TesujiTrainer; drill: TesujiState; replaying: boolean; onBack: () => void }) {
  const { t } = useTranslation()
  const { lang } = useSettings()
  const stats = tesujiStats()
  const pool = TESUJI_DRILLS.filter((d) => drill.filter === 'all' || d.tesuji === drill.filter)
  const { sfen } = drill.item
  const side = sideMark(positionOf(sfen).color)
  return (
    <div className="app-practice">
      <p className="app-task">
        {t('tesuji.toMoveFindThe', { side })}
        {drill.hint || drill.status !== 'asking' ? <strong>{drill.item.tesuji}</strong> : t('tesuji.tesuji')}
        {t('tesuji.findTheEnd')}
      </p>
      {drill.status === 'asking' && drill.wrong && (
        <p className="app-result wrong">
          {drill.hint
            ? t('tesuji.isNotItLookAgain', { move: moveText(sfen, drill.wrong) })
            : t('tesuji.isNotItLookAgain2', { move: moveText(sfen, drill.wrong) })}
        </p>
      )}
      {drill.status === 'asking' && drill.hint && <p className="app-note">{drill.item.explain}</p>}
      {drill.status !== 'asking' && (
        <Card tone={drill.status === 'right' ? 'good' : null}>
          <strong>
            {drill.status === 'right' ? '✓ ' : ''}
            {moveText(sfen, drill.item.answer)}: {drill.item.tesuji} {lang !== 'ja' && <span className="app-muted">({drill.item.en})</span>}
          </strong>
          <p>{drill.item.explain}</p>
          {drill.item.note && <p className="app-note">{drill.item.note}</p>}
          <p className="app-muted">{t('tesuji.from', { from: drill.item.from })}</p>
        </Card>
      )}
      {replaying ? (
        <div className="app-actions">
          <Button variant="primary" onClick={onBack}>
            {t('app.goBackAndTryAgain')}
          </Button>
        </div>
      ) : (
        <div className="app-actions">
          {drill.status === 'asking' && !drill.hint && <Button onClick={trainer.hint}>{t('tesuji.hint')}</Button>}
          {drill.status === 'asking' && <Button onClick={trainer.reveal}>{t('tesuji.showAnswer')}</Button>}
        </div>
      )}
      <p className="app-muted">{t('tesuji.solvedFirstTryOf', { value: pool.filter((d) => stats.solved.includes(d.id)).length, poolCount: pool.length })}</p>
    </div>
  )
}
