import { useTranslation } from 'react-i18next'
import { playSound, setSettings } from '@/appearance/settings'
import * as Slider from '@/components/ui/slider'

export function VolumeSlider({ value }: { value: number }) {
  const { t } = useTranslation()
  return (
    <Slider.Root
      w="140px"
      min={0}
      max={1}
      step={0.05}
      value={[value]}
      aria-label={[t('settings.volume')]}
      onValueChange={({ value }) => setSettings({ sound: value[0] > 0, volume: value[0] })}
      onValueChangeEnd={() => playSound('move')}
    >
      <Slider.Control>
        <Slider.Track>
          <Slider.Range />
        </Slider.Track>
        <Slider.Thumbs />
      </Slider.Control>
    </Slider.Root>
  )
}
