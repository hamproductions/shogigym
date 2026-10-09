import './welcome.css'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/app/icons'
import { MODES, type Level } from '@/app/types'
import { Button } from '@/app/ui/Button'
import { Dialog } from '@/app/ui/Dialog'

type WelcomeProps = {
  level: Level
  onPreviewLevel: (level: Level) => void
  onLearnRules: () => void
  onLearnBasics: () => void
  onPlayAi: () => void
  onTsume: () => void
  onLookAround: () => void
}

export function WelcomeDialog({ level, onPreviewLevel, onLearnRules, onLearnBasics, onPlayAi, onTsume, onLookAround }: WelcomeProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const pickLevel = (next: Level) => {
    onPreviewLevel(next)
    setStep(1)
  }
  return (
    <Dialog label={t('app.welcome')} className="app-welcome">
      <div className="app-welcome-head">
        <div className="app-steps" aria-hidden="true">
          {[0, 1, 2].map((n) => (
            <i key={n} className={n === step ? 'on' : n < step ? 'done' : ''} />
          ))}
        </div>
        <Button variant="icon" size="lg" onClick={onLookAround} aria-label={t('viewer.close')}>
          <Icon name="close" />
        </Button>
      </div>
      <h2>{t(step === 0 ? 'app.welcomeToShogilab' : step === 1 ? 'app.howTheScreenWorks' : 'app.whereDoYouWantTo')}</h2>
      {step === 0 && (
        <>
          <p>{t('app.learnShogi')}</p>
          <div className="app-welcome-choices">
            <button className={level === 'new' ? 'primary' : ''} onClick={() => pickLevel('new')}>
              <strong>{t('app.newToShogi')}</strong>
              <span>{t('app.showHowEachPieceMoves')}</span>
            </button>
            <button className={level === 'rules' ? 'primary' : ''} onClick={() => pickLevel('rules')}>
              <strong>{t('app.iKnowTheRules')}</strong>
              <span>{t('app.iCanRead7Style')}</span>
            </button>
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <ul className="app-tour">
            {MODES.map((m) => (
              <li key={m.id}>
                <Icon name={m.icon} size={18} />
                <strong>{t(`modes.${m.id}.name`)}</strong>
                <span>{t('modes.sentence', { hint: t(`modes.${m.id}.hint`) })}</span>
              </li>
            ))}
            <li>
              <Icon name="coach" size={18} />
              <strong>{t('app.sidePanel')}</strong>
              <span>{t('app.panelShort')}</span>
            </li>
          </ul>
          <div className="app-actions">
            <Button onClick={() => setStep(0)}>{t('app.back2')}</Button>
            <Button variant="ghost" onClick={() => setStep(2)}>
              {t('app.skipTour')}
            </Button>
            <Button variant="primary" onClick={() => setStep(2)}>
              {t('app.next')}
            </Button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div className="app-welcome-choices">
            <button className="primary" onClick={onLearnRules}>
              <strong>{t('app.learnTheRulesFirst')}</strong>
              <span>{t('app.learnTheRulesFirstHint')}</span>
            </button>
            <button onClick={onLearnBasics}>
              <strong>{t('app.learnTheBasicFourthFile')}</strong>
              <span>{t('app.studyModeWalksYouThrough')}</span>
            </button>
            <button onClick={onPlayAi}>
              <strong>{t('app.playTheAi')}</strong>
              <span>{t('app.beginnerStrengthTheCoachRates')}</span>
            </button>
            <button onClick={onTsume}>
              <strong>{t('app.solveMateInOne')}</strong>
              <span>{t('app.mateInOnePuzzlesTo')}</span>
            </button>
            <button onClick={onLookAround}>
              <strong>{t('app.justLookAround')}</strong>
              <span>{t('app.pickAnythingFromTheLesson')}</span>
            </button>
          </div>
          <p className="app-muted">{t('app.yourLevelAndDisplayOptions')}</p>
        </>
      )}
    </Dialog>
  )
}
