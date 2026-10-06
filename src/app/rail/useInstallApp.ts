import { useEffect, useState } from 'react'

type InstallPrompt = Event & { prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }> }

let globalInstallPrompt: InstallPrompt | null = null

const retainInstallPrompt = (event: Event) => {
  event.preventDefault()
  globalInstallPrompt = event as InstallPrompt
}

if (typeof document !== 'undefined') {
  globalThis.addEventListener('beforeinstallprompt', retainInstallPrompt)
  import.meta.hot?.dispose(() => globalThis.removeEventListener('beforeinstallprompt', retainInstallPrompt))
}

export function useInstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(() => globalInstallPrompt)
  const [installed, setInstalled] = useState(false)
  const [help, setHelp] = useState(false)
  useEffect(() => {
    if (!help) return
    const close = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      setHelp(false)
    }
    globalThis.addEventListener('keydown', close, true)
    return () => globalThis.removeEventListener('keydown', close, true)
  }, [help])
  useEffect(() => {
    const media = globalThis.matchMedia('(display-mode: standalone), (display-mode: fullscreen)')
    const sync = () => setInstalled(media.matches || !!(navigator as Navigator & { standalone?: boolean }).standalone)
    const available = (event: Event) => {
      event.preventDefault()
      globalInstallPrompt = event as InstallPrompt
      setPrompt(event as InstallPrompt)
    }
    const complete = () => {
      setInstalled(true)
      globalInstallPrompt = null
      setPrompt(null)
      setHelp(false)
    }
    sync()
    media.addEventListener('change', sync)
    globalThis.addEventListener('beforeinstallprompt', available)
    globalThis.addEventListener('appinstalled', complete)
    return () => {
      media.removeEventListener('change', sync)
      globalThis.removeEventListener('beforeinstallprompt', available)
      globalThis.removeEventListener('appinstalled', complete)
    }
  }, [])
  const install = async () => {
    const activePrompt = prompt || globalInstallPrompt
    if (!activePrompt) return setHelp(true)
    globalInstallPrompt = null
    setPrompt(null)
    try {
      await activePrompt.prompt()
    } catch {
      setHelp(true)
    }
  }
  return { installed, install, help, closeHelp: () => setHelp(false) }
}
