import { useHydrated } from '@/utils/hydrated'
import { useTranslation } from 'react-i18next'
import type { View } from '@/app/hooks/useView'
import type { IconName } from '@/app/icons'
import { useSettings } from '@/appearance/settings'
import { spellMarks } from '@/utils/notation'

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
  onInstall?: () => void
  onReport?: () => void
  onTrends?: () => void
  camera?: { on: boolean; toggle: () => void }
}

export function useRailTools({
  view,
  settingsOpen,
  onSettings,
  onPalette,
  snapshotName,
  onFlipTable,
  onSaveImage,
  onInstall,
  onReport,
  onTrends,
  camera,
}: ToolActions) {
  const { t, i18n } = useTranslation()
  const hydrated = useHydrated()
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
  ]
  const secondary: RailTool[] = [
    ...(camera
      ? [
          {
            id: 'camera',
            icon: 'camera',
            label: t('rail.camera'),
            title: t('rail.cameraTitle'),
            on: camera.on,
            pressed: camera.on,
            run: camera.toggle,
          } satisfies RailTool,
        ]
      : []),
    { id: 'image', icon: 'image', label: t('rail.exportImage'), run: () => onSaveImage(snapshotName) },
  ]
  const bottom: RailTool[] = [
    { id: 'hide', icon: 'panel', label: t('app.hideUiShort'), title: `${t('app.hideUi')} (H)`, run: () => setHideUi(true) },
    ...(!hydrated || document.fullscreenEnabled
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
    ...(onInstall ? [{ id: 'install', icon: 'install', label: t('rail.install'), run: onInstall } satisfies RailTool] : []),
  ]
  const top: RailTool[] = [
    ...(onReport ? [{ id: 'report', icon: 'report', label: t('report.rail'), title: t('report.railTitle'), run: onReport } satisfies RailTool] : []),
    ...(onTrends ? [{ id: 'trends', icon: 'trends', label: t('insights.rail'), title: t('insights.railTitle'), run: onTrends } satisfies RailTool] : []),
    {
      id: 'control',
      icon: 'control',
      label: t('rail.control'),
      title: spellMarks(t('app.controlMapWhoControlsEach'), i18n.language),
      on: showControl,
      pressed: showControl,
      run: () => setShowControl((v) => !v),
    },
  ]
  const menu: RailTool[] = [
    { id: 'palette', icon: 'command', label: t('rail.commands'), title: t('app.searchLinesAndCommandsK'), run: onPalette },
    ...(!flatView ? [{ id: 'tableflip', icon: 'tableflip', label: t('rail.tableFlip'), run: onFlipTable } satisfies RailTool] : []),
  ]
  return { primary, secondary, top, bottom, menu }
}
