import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { css } from 'styled-system/css'
import { Flex, styled, Wrap } from 'styled-system/jsx'
import { Icon } from '@/app/icons'
import { MODES, type Level } from '@/app/types'
import { Button } from '@/app/ui/Button'
import { Dialog } from '@/app/ui/Dialog'
import { Text } from '@/components/ui'
import { WelcomeChoice, WelcomeChoices } from './welcome.styles'

const TourItem = styled('li', {
  base: {
    display: 'grid',
    gridTemplateColumns: '22px 1fr',
    columnGap: '2.5',
    py: '2',
    borderBottom: '1px solid {colors.border}',
    '& svg': { gridRow: 'span 2', mt: '0.5', color: 'fg.muted' },
    '& span': { fontSize: 'xs', opacity: '0.85' },
  },
})

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
    <Dialog label={t('app.welcome')} className={css({ w: 'min(480px, 100%)', '& p': { lineHeight: 'normal' } })}>
      <Flex align="center" justify="space-between" mb="3">
        <Flex gap="1.5" aria-hidden="true">
          {[0, 1, 2].map((n) => (
            <styled.i
              key={n}
              w="22px"
              h="4px"
              borderRadius="full"
              bg={n === step ? 'accent' : n < step ? 'color-mix(in srgb, {colors.accent} 45%, transparent)' : 'border.strong'}
            />
          ))}
        </Flex>
        <Button variant="icon" size="lg" onClick={onLookAround} aria-label={t('viewer.close')}>
          <Icon name="close" />
        </Button>
      </Flex>
      <h2>{t(step === 0 ? 'app.welcomeToShogilab' : step === 1 ? 'app.howTheScreenWorks' : 'app.whereDoYouWantTo')}</h2>
      {step === 0 && (
        <>
          <p>{t('app.learnShogi')}</p>
          <WelcomeChoices>
            <WelcomeChoice primary={level === 'new'} onClick={() => pickLevel('new')}>
              <strong>{t('app.newToShogi')}</strong>
              <span>{t('app.showHowEachPieceMoves')}</span>
            </WelcomeChoice>
            <WelcomeChoice primary={level === 'rules'} onClick={() => pickLevel('rules')}>
              <strong>{t('app.iKnowTheRules')}</strong>
              <span>{t('app.iCanRead7Style')}</span>
            </WelcomeChoice>
          </WelcomeChoices>
        </>
      )}
      {step === 1 && (
        <>
          <styled.ul my="3" mx="0" p="0" listStyle="none">
            {MODES.map((m) => (
              <TourItem key={m.id}>
                <Icon name={m.icon} size={18} />
                <strong>{t(`modes.${m.id}.name`)}</strong>
                <span>{t('modes.sentence', { hint: t(`modes.${m.id}.hint`) })}</span>
              </TourItem>
            ))}
            <TourItem>
              <Icon name="coach" size={18} />
              <strong>{t('app.sidePanel')}</strong>
              <span>{t('app.panelShort')}</span>
            </TourItem>
          </styled.ul>
          <Wrap gap="2" align="center" justify="flex-end" mt="4">
            <Button onClick={() => setStep(0)}>{t('app.back2')}</Button>
            <Button variant="ghost" onClick={() => setStep(2)}>
              {t('app.skipTour')}
            </Button>
            <Button variant="primary" onClick={() => setStep(2)}>
              {t('app.next')}
            </Button>
          </Wrap>
        </>
      )}
      {step === 2 && (
        <>
          <WelcomeChoices>
            <WelcomeChoice primary onClick={onLearnRules}>
              <strong>{t('app.learnTheRulesFirst')}</strong>
              <span>{t('app.learnTheRulesFirstHint')}</span>
            </WelcomeChoice>
            <WelcomeChoice onClick={onLearnBasics}>
              <strong>{t('app.learnTheBasicFourthFile')}</strong>
              <span>{t('app.studyModeWalksYouThrough')}</span>
            </WelcomeChoice>
            <WelcomeChoice onClick={onPlayAi}>
              <strong>{t('app.playTheAi')}</strong>
              <span>{t('app.beginnerStrengthTheCoachRates')}</span>
            </WelcomeChoice>
            <WelcomeChoice onClick={onTsume}>
              <strong>{t('app.solveMateInOne')}</strong>
              <span>{t('app.mateInOnePuzzlesTo')}</span>
            </WelcomeChoice>
            <WelcomeChoice onClick={onLookAround}>
              <strong>{t('app.justLookAround')}</strong>
              <span>{t('app.pickAnythingFromTheLesson')}</span>
            </WelcomeChoice>
          </WelcomeChoices>
          <Text tone="muted" size="sm" mb="4">
            {t('app.yourLevelAndDisplayOptions')}
          </Text>
        </>
      )}
    </Dialog>
  )
}
