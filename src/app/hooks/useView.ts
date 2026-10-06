import { useEffect, useState, useSyncExternalStore } from 'react'
import { useSettings } from '@/appearance/settings'
import type { Mode } from '@/app/types'

const subscribeFullscreen = (onChange: () => void) => {
  document.addEventListener('fullscreenchange', onChange)
  return () => document.removeEventListener('fullscreenchange', onChange)
}
const isFullscreen = () => !!document.fullscreenElement
const serverFullscreen = () => false

const toggleFullscreen = () => void (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen())

interface Camera {
  orbit: boolean
  tilted: boolean
}

export function useView(mode?: Mode) {
  const settings = useSettings()
  const [tilted, setTilted] = useState(false)
  const [orbit, setOrbit] = useState(false)
  const [hideUi, setHideUi] = useState(false)
  const [showControl, setShowControl] = useState(false)
  const fullscreen = useSyncExternalStore(subscribeFullscreen, isFullscreen, serverFullscreen)
  const flatView = settings.environment === 'flat' || settings.environment === 'diagram' || settings.environment === 'broadcast'
  // Watching a game forces the orbit camera; the previous camera is restored on leaving.
  const [saved, setSaved] = useState<Camera | null>(null)
  if (mode === 'view' && !saved) {
    setSaved({ orbit, tilted })
    setOrbit(true)
    setTilted(false)
  } else if (mode !== 'view' && saved) {
    setSaved(null)
    setOrbit(saved.orbit)
    setTilted(saved.tilted)
  }
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'h' || e.metaKey || e.ctrlKey || e.altKey || (e.target instanceof Element && e.target.closest('input, textarea, select')))
        return
      setHideUi((v) => !v)
    }
    globalThis.addEventListener('keydown', on)
    return () => globalThis.removeEventListener('keydown', on)
  }, [])
  return { tilted, setTilted, orbit, setOrbit, hideUi, setHideUi, showControl, setShowControl, fullscreen, toggleFullscreen, flatView }
}

export type View = ReturnType<typeof useView>
