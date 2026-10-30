import { useTranslation } from 'react-i18next'
import { styled } from 'styled-system/jsx'
import { Checkbox } from '@/components/ui'
import { setSettings, useSettings } from '@/appearance/settings'
import { useSession } from '@/app/hooks/session'
import type { CandidateMoves as Candidates } from '@/app/hooks/useCandidateMoves'
import { moveGloss } from '@/app/pieces'
import { moveCoaching } from '@/utils/coaching'
import { applyUsi, moveText, positionOf } from '@/utils/shogi'
import type { BookMove } from '@/utils/book'
import { useEngineStatus } from '@/utils/engine'
import { Marks } from '@/app/ui/SideMark'
import { Button } from '@/app/ui/Button'
import { Muted } from './panels.styles'

export function CandidateMoves({ model, error, book }: { model: Candidates; error: string | null; book: BookMove[] }) {
  const { t } = useTranslation()
  const settings = useSettings()
  const { sfen, play, ai } = useSession()
  const status = useEngineStatus()
  const feedback = model.selected ? moveCoaching(sfen, model.selected.move) : null
  const explain = feedback ? `${feedback.summary} ${feedback.detail}` : model.selected ? moveGloss(sfen, model.selected.move) : ''
  const note = model.selected ? book.find((move) => move.usi === model.selected!.move)?.note : null
  const after = model.selected ? applyUsi(sfen, model.selected.move) : null
  const replyUsi = model.selected?.pv[1]
  const replyPosition = after ? positionOf(after) : null
  const reply = replyUsi ? replyPosition?.createMoveByUSI(replyUsi) : null
  const replyText = after && reply && replyPosition!.isValidMove(reply) ? moveText(after, reply.usi) : null
  return (
    <styled.section mb="4" pb="4" borderBottom="1px solid {colors.border}" aria-label={t('coach.choices.title')}>
      <Checkbox.Root
        checked={settings.threeChoices}
        onCheckedChange={({ checked }) => {
          model.select(null)
          setSettings({ threeChoices: checked === true })
        }}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Label>{t('coach.choices.title')}</Checkbox.Label>
      </Checkbox.Root>
      {settings.threeChoices && (
        <>
          <Muted>{t('coach.choices.hint')}</Muted>
          {error || status.error || !ai ? (
            <styled.p role="alert">{t('coach.choices.error')}</styled.p>
          ) : !model.available ? (
            <Muted>{t('coach.choices.waitTurn')}</Muted>
          ) : model.candidates.length === 0 ? (
            <styled.p role="status" aria-busy="true">
              {t('coach.choices.loading')}
            </styled.p>
          ) : (
            <>
              <styled.div display="flex" flexWrap="wrap" gap="2" role="group" aria-label={t('coach.choices.title')}>
                {model.candidates.map((candidate) => (
                  <Button
                    key={candidate.move}
                    minH="44px"
                    aria-pressed={model.selected?.move === candidate.move}
                    variant={model.selected?.move === candidate.move ? 'primary' : 'secondary'}
                    onClick={() => model.select(model.selected?.move === candidate.move ? null : candidate.move)}
                  >
                    <Marks>{moveText(sfen, candidate.move)}</Marks>
                  </Button>
                ))}
              </styled.div>
              {model.candidates.length < 3 && <Muted>{t('coach.choices.fewer')}</Muted>}
              {model.selected && (
                <styled.div mt="3" aria-live="polite">
                  <styled.p m="0 0 {spacing.3}">
                    <Marks>{explain}</Marks>
                  </styled.p>
                  {note && (
                    <styled.p m="0 0 {spacing.3}">
                      <Marks>{note}</Marks>
                    </styled.p>
                  )}
                  {replyText && (
                    <Muted>
                      <Marks>{t('engine.theyWouldLikelyAnswer', { move: replyText })}</Marks>
                    </Muted>
                  )}
                  <Button
                    variant="primary"
                    minH="44px"
                    onClick={() => {
                      if (!model.available || !model.selected) return
                      play(model.selected.move)
                      model.select(null)
                    }}
                  >
                    {t('coach.choices.play')}
                  </Button>
                </styled.div>
              )}
            </>
          )}
        </>
      )}
    </styled.section>
  )
}
