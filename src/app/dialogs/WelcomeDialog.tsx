import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { css } from 'styled-system/css'
import { Flex, styled, Wrap } from 'styled-system/jsx'
import { Icon } from '@/app/icons'
import { MODES, type Level } from '@/app/types'
import { Button } from '@/app/ui/Button'
import { Dialog } from '@/app/ui/Dialog'
import { Text } from '@/components/ui'
import { WelcomeChoice, WelcomeChoices, WelcomeHint } from './welcome.styles'

const TourItem = styled('li', {
  base: {
    display: 'grid',
    gridTemplateColumns: '22px 1fr',
    columnGap: '2.5',
    py: '2',
    borderBottom: '1px solid {colors.border}',
  },
})

const tourIcon = css({ gridRow: 'span 2', mt: '0.5', color: 'fg.muted' })

function Choice({ primary, title, hint, onClick }: { primary?: boolean; title: ReactNode; hint: ReactNode; onClick: () => void }) {
  return (
    <WelcomeChoice primary={primary} onClick={onClick}>
      <strong>{title}</strong>
      <WelcomeHint primary={primary}>{hint}</WelcomeHint>
    </WelcomeChoice>
  )
}

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
    <Dialog label={t('app.welcome')} w="min(480px, 100%)">
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
      <styled.h2 mb="2">{t(step === 0 ? 'app.welcomeToShogilab' : step === 1 ? 'app.howTheScreenWorks' : 'app.whereDoYouWantTo')}</styled.h2>
      {step === 0 && (
        <>
          <styled.p mt="0" mx="0" mb="4" lineHeight="normal">
            {t('app.learnShogi')}
          </styled.p>
          <WelcomeChoices>
            <Choice primary={level === 'new'} title={t('app.newToShogi')} hint={t('app.showHowEachPieceMoves')} onClick={() => pickLevel('new')} />
            <Choice primary={level === 'rules'} title={t('app.iKnowTheRules')} hint={t('app.iCanRead7Style')} onClick={() => pickLevel('rules')} />
          </WelcomeChoices>
        </>
      )}
      {step === 1 && (
        <>
          <styled.ul my="3" mx="0" p="0" listStyle="none">
            {MODES.map((m) => (
              <TourItem key={m.id}>
                <Icon name={m.icon} size={18} className={tourIcon} />
                <strong>{t(`modes.${m.id}.name`)}</strong>
                <WelcomeHint>{t('modes.sentence', { hint: t(`modes.${m.id}.hint`) })}</WelcomeHint>
              </TourItem>
            ))}
            <TourItem>
              <Icon name="coach" size={18} className={tourIcon} />
              <strong>{t('app.sidePanel')}</strong>
              <WelcomeHint>{t('app.panelShort')}</WelcomeHint>
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
            <Choice primary title={t('app.learnTheRulesFirst')} hint={t('app.learnTheRulesFirstHint')} onClick={onLearnRules} />
            <Choice title={t('app.learnTheBasicFourthFile')} hint={t('app.studyModeWalksYouThrough')} onClick={onLearnBasics} />
            <Choice title={t('app.playTheAi')} hint={t('app.beginnerStrengthTheCoachRates')} onClick={onPlayAi} />
            <Choice title={t('app.solveMateInOne')} hint={t('app.mateInOnePuzzlesTo')} onClick={onTsume} />
            <Choice title={t('app.justLookAround')} hint={t('app.pickAnythingFromTheLesson')} onClick={onLookAround} />
          </WelcomeChoices>
          <Text tone="muted" size="sm" mb="4" lineHeight="normal">
            {t('app.yourLevelAndDisplayOptions')}
          </Text>
        </>
      )}
    </Dialog>
  )
}
