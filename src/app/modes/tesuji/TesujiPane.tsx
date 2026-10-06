import { useTranslation } from 'react-i18next'
import { moveText, positionOf } from '@/utils/shogi'
import { sideMark } from '@/utils/notation'
import { useSettings } from '@/appearance/settings'
import { TESUJI_DRILLS, tesujiStats } from '@/app/tesujiDrills'
import type { TesujiState, TesujiTrainer } from './useTesuji'
import { Button } from '@/app/ui/Button'
import { Card } from '@/app/ui/Card'

function WrongNote({ drill, sfen }: { drill: TesujiState; sfen: string }) {
  const { t } = useTranslation()
  if (drill.status !== 'asking' || !drill.wrong) return null
  const move = moveText(sfen, drill.wrong)
  return <p className="app-result wrong">{drill.hint ? t('tesuji.isNotItLookAgain', { move }) : t('tesuji.isNotItLookAgain2', { move })}</p>
}

function AnswerCard({ drill, sfen }: { drill: TesujiState; sfen: string }) {
  const { t } = useTranslation()
  const { lang } = useSettings()
  return (
    <Card tone={drill.status === 'right' ? 'good' : null}>
      <strong>
        {drill.status === 'right' ? '✓ ' : ''}
        {moveText(sfen, drill.item.answer)}: {drill.item.tesuji} {lang !== 'ja' && <span className="app-muted">({drill.item.en})</span>}
      </strong>
      <p>{drill.item.explain}</p>
      {drill.item.note && <p className="app-note">{drill.item.note}</p>}
      <p className="app-muted">{t('tesuji.from', { from: drill.item.from })}</p>
    </Card>
  )
}

function TesujiActions({ trainer, drill, replaying, onBack }: { trainer: TesujiTrainer; drill: TesujiState; replaying: boolean; onBack: () => void }) {
  const { t } = useTranslation()
  if (replaying) {
    return (
      <div className="app-actions">
        <Button variant="primary" onClick={onBack}>
          {t('app.goBackAndTryAgain')}
        </Button>
      </div>
    )
  }
  return (
    <div className="app-actions">
      {drill.status === 'asking' && !drill.hint && <Button onClick={trainer.hint}>{t('tesuji.hint')}</Button>}
      {drill.status === 'asking' && <Button onClick={trainer.reveal}>{t('tesuji.showAnswer')}</Button>}
    </div>
  )
}

export function TesujiPane({ trainer, drill, replaying, onBack }: { trainer: TesujiTrainer; drill: TesujiState; replaying: boolean; onBack: () => void }) {
  const { t } = useTranslation()
  const stats = tesujiStats()
  const pool = TESUJI_DRILLS.filter((d) => drill.filter === 'all' || d.tesuji === drill.filter)
  const solved = new Set(stats.solved)
  const { sfen } = drill.item
  const side = sideMark(positionOf(sfen).color)
  return (
    <div className="app-practice">
      <p className="app-task">
        {t('tesuji.toMoveFindThe', { side })}
        {drill.hint || drill.status !== 'asking' ? <strong>{drill.item.tesuji}</strong> : t('tesuji.tesuji')}
        {t('tesuji.findTheEnd')}
      </p>
      <WrongNote drill={drill} sfen={sfen} />
      {drill.status === 'asking' && drill.hint && <p className="app-note">{drill.item.explain}</p>}
      {drill.status !== 'asking' && <AnswerCard drill={drill} sfen={sfen} />}
      <TesujiActions trainer={trainer} drill={drill} replaying={replaying} onBack={onBack} />
      <p className="app-muted">{t('tesuji.solvedFirstTryOf', { value: pool.filter((d) => solved.has(d.id)).length, poolCount: pool.length })}</p>
    </div>
  )
}
