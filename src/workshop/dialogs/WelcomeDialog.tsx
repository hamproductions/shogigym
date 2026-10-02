import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../icons'
import { MODES, type Level } from '../types'

type WelcomeProps = {
  level: Level
  onPreviewLevel: (level: Level) => void
  onLearnBasics: () => void
  onPlayAi: () => void
  onTsume: () => void
  onLookAround: () => void
}

export function WelcomeDialog({ level, onPreviewLevel, onLearnBasics, onPlayAi, onTsume, onLookAround }: WelcomeProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const pickLevel = (next: Level) => {
    onPreviewLevel(next)
    setStep(1)
  }
  return (
    <div className="ws-palette-back">
      <div className="ws-dialog ws-welcome" role="dialog" aria-label={t('workshop.welcome')}>
        <div className="ws-steps" aria-hidden="true">
          {[0, 1, 2].map((n) => (
            <i key={n} className={n === step ? 'on' : n < step ? 'done' : ''} />
          ))}
        </div>
        {step === 0 && (
          <>
            <h2>{t('workshop.welcomeToShogilab')}</h2>
            <p>{t('workshop.aWorkshopForLearningThe')}</p>
            <div className="ws-welcome-choices">
              <button className={level === 'rules' ? 'primary' : ''} onClick={() => pickLevel('rules')}>
                <strong>{t('workshop.iKnowTheRules')}</strong>
                <span>{t('workshop.iCanRead7Style')}</span>
              </button>
              <button className={level === 'new' ? 'primary' : ''} onClick={() => pickLevel('new')}>
                <strong>{t('workshop.newToShogi')}</strong>
                <span>{t('workshop.showHowEachPieceMoves')}</span>
              </button>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h2>{t('workshop.howTheScreenWorks')}</h2>
            <ul className="ws-tour">
              {MODES.map((m) => (
                <li key={m.id}>
                  <Icon name={m.icon} size={18} />
                  <strong>{t(`modes.${m.id}.name`)}</strong>
                  <span>{t('modes.sentence', { hint: t(`modes.${m.id}.hint`) })}</span>
                </li>
              ))}
              <li>
                <Icon name="coach" size={18} />
                <strong>{t('workshop.sidePanel')}</strong>
                <span>{t('workshop.coachExplainsMovesAiRates')}</span>
              </li>
              <li>
                <Icon name="prev" size={18} />
                <strong>{t('workshop.stepBack')}</strong>
                <span>{t('workshop.andWalkThroughMovesPlay')}</span>
              </li>
            </ul>
            <div className="ws-actions">
              <button onClick={() => setStep(0)}>{t('workshop.back2')}</button>
              <button className="primary" onClick={() => setStep(2)}>
                {t('workshop.next')}
              </button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2>{t('workshop.whereDoYouWantTo')}</h2>
            <div className="ws-welcome-choices">
              <button className="primary" onClick={onLearnBasics}>
                <strong>{t('workshop.learnTheBasicFourthFile')}</strong>
                <span>{t('workshop.studyModeWalksYouThrough')}</span>
              </button>
              <button onClick={onPlayAi}>
                <strong>{t('workshop.playTheAi')}</strong>
                <span>{t('workshop.beginnerStrengthTheCoachRates')}</span>
              </button>
              <button onClick={onTsume}>
                <strong>{t('workshop.solveMateInOne')}</strong>
                <span>{t('workshop.mateInOnePuzzlesTo')}</span>
              </button>
              <button onClick={onLookAround}>
                <strong>{t('workshop.justLookAround')}</strong>
                <span>{t('workshop.pickAnythingFromTheLesson')}</span>
              </button>
            </div>
            <p className="ws-muted">{t('workshop.yourLevelAndDisplayOptions')}</p>
          </>
        )}
      </div>
    </div>
  )
}
