import { useEffect, useState } from 'react'
import { useSettings } from '@/appearance/settings'
import type { Mode } from '@/app/types'
import { useLatest } from './useLatest'

export function useView(mode?: Mode) {
  const settings = useSettings()
  const [tilted, setTilted] = useState(false)
  const [orbit, setOrbit] = useState(false)
  const [hideUi, setHideUi] = useState(false)
  const [showControl, setShowControl] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const flatView = settings.environment === 'flat' || settings.environment === 'diagram' || settings.environment === 'broadcast'
  const camera = useLatest({ orbit, tilted })
  useEffect(() => {
    if (mode !== 'view') return
    const previous = camera.current
    setOrbit(true)
    setTilted(false)
    return () => {
      setOrbit(previous.orbit)
      setTilted(previous.tilted)
    }
  }, [mode])
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'h' || e.metaKey || e.ctrlKey || e.altKey || (e.target instanceof Element && e.target.closest('input, textarea, select')))
        return
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
