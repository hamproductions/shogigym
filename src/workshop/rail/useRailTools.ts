import { useTranslation } from 'react-i18next'
import type { View } from '../hooks/useView'
import type { IconName } from '../icons'
import { useSettings } from '../settings'

export type RailTool = { id: string; icon: IconName; label: string; title?: string; on?: boolean; pressed?: boolean; disabled?: boolean; labelClass?: string; run: () => void }

type ToolActions = { view: View; onFlip: () => void; settingsOpen: boolean; onSettings: () => void; onPalette: () => void; snapshotName: string; onFlipTable: () => void; onSaveImage: (name: string) => void }

export function useRailTools({ view, onFlip, settingsOpen, onSettings, onPalette, snapshotName, onFlipTable, onSaveImage }: ToolActions) {
  const { t } = useTranslation()
  const ja = useSettings().lang === 'ja'
  const { tilted, setTilted, orbit, setOrbit, flatView, showControl, setShowControl, setHideUi, fullscreen, toggleFullscreen } = view
  const primary: RailTool[] = [
    { id: 'flip', icon: 'flip', label: t('workshop.flip'), title: t('workshop.flipTheBoardF'), run: onFlip },
    { id: 'tilt', icon: 'tilt', label: t('workshop.tilt'), title: t('workshop.tiltTheBoardT'), on: tilted && !flatView, disabled: flatView, run: () => setTilted((v) => !v) },
    ...(!flatView ? [{ id: 'orbit', icon: 'orbit', label: t('workshop.lookAround'), title: t('workshop.lookAroundHint'), on: orbit, pressed: orbit, run: () => setOrbit((v) => !v) } satisfies RailTool] : []),
    { id: 'settings', icon: 'gear', label: t('rail.settings'), title: t('workshop.settingsSoundPiecesBoardAi'), on: settingsOpen, labelClass: ja ? 'ws-ja' : 'ws-en', run: onSettings },
  ]
  const secondary: RailTool[] = [
    { id: 'control', icon: 'control', label: t('rail.control'), title: t('workshop.controlMapWhoControlsEach'), on: showControl, pressed: showControl, run: () => setShowControl((v) => !v) },
    { id: 'hide', icon: 'panel', label: t('workshop.hideUiShort'), title: `${t('workshop.hideUi')} (H)`, run: () => setHideUi(true) },
    ...(document.fullscreenEnabled ? [{ id: 'fullscreen', icon: fullscreen ? 'exitFullscreen' : 'fullscreen', label: t('workshop.fullScreen2'), title: fullscreen ? t('workshop.exitFullScreenEsc') : t('workshop.fullScreen'), on: fullscreen, pressed: fullscreen, run: toggleFullscreen } satisfies RailTool] : []),
    { id: 'image', icon: 'image', label: t('rail.exportImage'), run: () => onSaveImage(snapshotName) },
    ...(!flatView ? [{ id: 'tableflip', icon: 'tableflip', label: t('rail.tableFlip'), run: onFlipTable } satisfies RailTool] : []),
    { id: 'palette', icon: 'command', label: '⌘K', title: t('workshop.searchLinesAndCommandsK'), run: onPalette },
  ]
  return { primary, secondary }
}
