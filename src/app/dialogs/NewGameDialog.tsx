import { createListCollection } from '@ark-ui/react/collection'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FAMILIES, STRATEGIES } from '@/data/strategies'
import { otherSide, type Side } from '@/utils/shogi'
import { aiStrategyId, strategyCourses } from '@/utils/book'
import { STRENGTH, TIME_CONTROLS, setSettings, useSettings, type AiStrength, type TimeControl } from '@/appearance/settings'
import { styled, Wrap } from 'styled-system/jsx'
import { Select } from '@/components/ui'
import { Button } from '@/app/ui/Button'
import { Dialog } from '@/app/ui/Dialog'
import { SegmentedField, SettingRow } from '@/app/ui/Segmented'

const NO_STRATEGY = 'none'

const CLOCK_ORDER: TimeControl[] = ['none', '10s', '3m', '5m5s', '10m', '10m30s', '30m60s']

export type PickSide = Side | 'random'

export function NewGameDialog({ side, onClose, onStart }: { side: Side; onClose: () => void; onStart: (side: Side, isRandom?: boolean) => void }) {
  const { t } = useTranslation()
  const st = useSettings()
  const [pick, setPick] = useState<PickSide>(side)
  const ja = st.lang === 'ja'
  const start = () => onStart(pick === 'random' ? side : pick, pick === 'random')
  const groups = Object.entries(FAMILIES).flatMap(([family, label]) => {
    const options = STRATEGIES.filter(
      (x) =>
        x.family === family &&
        (pick === 'random'
          ? strategyCourses(x.id, 'sente').length > 0 || strategyCourses(x.id, 'gote').length > 0
          : strategyCourses(x.id, otherSide(pick)).length > 0),
    )
    return options.length
      ? [
          {
            family,
            label: `${t(options[0].side === 'ibisha' ? 'strategy.ibisha' : 'strategy.furibisha')} · ${ja ? label.ja : label.en}`,
            items: options.map((x) => ({ value: x.id, label: ja ? x.ja : `${x.en} ${x.ja}` })),
          },
        ]
      : []
  })
  const loose = [
    { value: 'random', label: t('app.randomStrategy') },
    { value: NO_STRATEGY, label: t('app.noStrategy') },
  ]
  const strategies = createListCollection({ items: [...loose, ...groups.flatMap((g) => g.items)] })
  return (
    <Dialog label={t('newGame.title')} w="min(560px, 100%)" onBackdrop={onClose}>
      <styled.h2 mb="2">{t('newGame.title')}</styled.h2>
      <SegmentedField
        alignTop
        label={t('newGame.side')}
        value={pick}
        options={[
          { v: 'sente', t: t('app.playSente') },
          { v: 'gote', t: t('app.playGote') },
          { v: 'random', t: ja ? 'ランダム' : 'Random' },
        ]}
        onChange={(v) => setPick(v as PickSide)}
      />
      <SegmentedField<AiStrength>
        alignTop
        label={t('newGame.strength')}
        value={st.opponent}
        options={(Object.keys(STRENGTH) as AiStrength[]).map((k) => ({ v: k, t: STRENGTH[k].label }))}
        onChange={(k) => setSettings({ opponent: k })}
      />
      <SegmentedField<TimeControl>
        alignTop
        label={t('newGame.clock')}
        value={st.timeControl}
        options={CLOCK_ORDER.map((k) => ({ v: k, t: TIME_CONTROLS[k].label, title: TIME_CONTROLS[k].hint }))}
        onChange={(k) => setSettings({ timeControl: k })}
      />
      <SettingRow alignTop label={t('newGame.strategy')}>
        <Select.Root
          collection={strategies}
          value={[aiStrategyId(st.aiStrategy) || NO_STRATEGY]}
          positioning={{ strategy: 'fixed' }}
          onValueChange={({ value }) => setSettings({ aiStrategy: value[0] === NO_STRATEGY ? '' : value[0] })}
        >
          <Select.Control>
            <Select.Trigger aria-label={t('newGame.strategy')}>
              <Select.ValueText />
              <Select.Indicator />
            </Select.Trigger>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {loose.map((item) => (
                <Select.Item key={item.value} item={item}>
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
              {groups.map((group) => (
                <Select.ItemGroup key={group.family}>
                  <Select.ItemGroupLabel>{group.label}</Select.ItemGroupLabel>
                  {group.items.map((item) => (
                    <Select.Item key={item.value} item={item}>
                      <Select.ItemText>{item.label}</Select.ItemText>
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.ItemGroup>
              ))}
            </Select.Content>
          </Select.Positioner>
          <Select.HiddenSelect />
        </Select.Root>
      </SettingRow>
      <Wrap gap="2" align="center" justify="flex-end" mt="4">
        <Button onClick={onClose}>{t('app.cancel')}</Button>
        <Button variant="primary" onClick={start}>
          {t('newGame.start')}
        </Button>
      </Wrap>
    </Dialog>
  )
}
