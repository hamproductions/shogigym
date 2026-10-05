import { useTranslation } from 'react-i18next'
import type { View } from '@/app/hooks/useView'
import type { IconName } from '@/app/icons'
import { useSettings } from '@/appearance/settings'

export type RailTool = {
  id: string
  icon: IconName
  label: string
  title?: string
  on?: boolean
  pressed?: boolean
  disabled?: boolean
  labelClass?: string
  run: () => void
}

type ToolActions = {
  view: View
  settingsOpen: boolean
  onSettings: () => void
  onPalette: () => void
  snapshotName: string
  onFlipTable: () => void
  onSaveImage: (name: string) => void
}

export function useRailTools({ view, settingsOpen, onSettings, onPalette, snapshotName, onFlipTable, onSaveImage }: ToolActions) {
  const { t } = useTranslation()
  const ja = useSettings().lang === 'ja'
  const { tilted, setTilted, orbit, setOrbit, flatView, showControl, setShowControl, setHideUi, fullscreen, toggleFullscreen } = view
  const primary: RailTool[] = [
    ...(!flatView
      ? [{ id: 'tilt', icon: 'tilt', label: t('app.tilt'), title: t('app.tiltTheBoardT'), on: tilted, run: () => setTilted((v) => !v) } satisfies RailTool]
      : []),
    ...(!flatView
      ? [
          {
            id: 'orbit',
            icon: 'orbit',
            label: t('app.lookAround'),
            title: t('app.lookAroundHint'),
            on: orbit,
            pressed: orbit,
            run: () => setOrbit((v) => !v),
          } satisfies RailTool,
        ]
      : []),
    ...(!flatView ? [{ id: 'tableflip', icon: 'tableflip', label: t('rail.tableFlip'), run: onFlipTable } satisfies RailTool] : []),
  ]
  const secondary: RailTool[] = [{ id: 'image', icon: 'image', label: t('rail.exportImage'), run: () => onSaveImage(snapshotName) }]
  const bottom: RailTool[] = [
    { id: 'hide', icon: 'panel', label: t('app.hideUiShort'), title: `${t('app.hideUi')} (H)`, run: () => setHideUi(true) },
    ...(document.fullscreenEnabled
      ? [
          {
            id: 'fullscreen',
            icon: fullscreen ? 'exitFullscreen' : 'fullscreen',
            label: t('app.fullScreen2'),
            title: fullscreen ? t('app.exitFullScreenEsc') : t('app.fullScreen'),
            on: fullscreen,
            pressed: fullscreen,
            run: toggleFullscreen,
          } satisfies RailTool,
        ]
      : []),
    {
      id: 'settings',
      icon: 'gear',
      label: t('rail.settings'),
      title: t('app.settingsSoundPiecesBoardAi'),
      on: settingsOpen,
      labelClass: ja ? 'app-ja' : 'app-en',
      run: onSettings,
    },
  ]
  const top: RailTool[] = [
    { id: 'palette', icon: 'command', label: '⌘K', title: t('app.searchLinesAndCommandsK'), run: onPalette },
    {
      id: 'control',
      icon: 'control',
      label: t('rail.control'),
      title: t('app.controlMapWhoControlsEach'),
      on: showControl,
      pressed: showControl,
      run: () => setShowControl((v) => !v),
    },
  ]
  return { primary, secondary, top, bottom }
}
