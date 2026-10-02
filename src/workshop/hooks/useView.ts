import { useEffect, useState } from 'react'
import { useSettings } from '../settings'

export function useView() {
  const settings = useSettings()
  const [tilted, setTilted] = useState(false)
  const [orbit, setOrbit] = useState(false)
  const [hideUi, setHideUi] = useState(false)
  const [showControl, setShowControl] = useState(false)
  const [fullscreen, setFullscreen] = useState(() => !!document.fullscreenElement)
  const flatView = settings.environment === 'flat' || settings.environment === 'diagram' || settings.environment === 'broadcast'
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'h' || e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement).closest('input, textarea, select')) return
      setHideUi((v) => !v)
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])
  useEffect(() => {
    const on = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', on)
    return () => document.removeEventListener('fullscreenchange', on)
  }, [])
  const toggleFullscreen = () => void (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen())
  return { tilted, setTilted, orbit, setOrbit, hideUi, setHideUi, showControl, setShowControl, fullscreen, toggleFullscreen, flatView }
}

export type View = ReturnType<typeof useView>
