import { useEffect, useState } from 'react'

type InstallPrompt = Event & { prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }> }

export function useInstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null)
  const [installed, setInstalled] = useState(false)
  const [help, setHelp] = useState(false)
  useEffect(() => {
    if (!help) return
    const close = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      setHelp(false)
    }
    window.addEventListener('keydown', close, true)
    return () => window.removeEventListener('keydown', close, true)
  }, [help])
  useEffect(() => {
    const media = window.matchMedia('(display-mode: standalone), (display-mode: fullscreen)')
    const sync = () => setInstalled(media.matches || !!(navigator as Navigator & { standalone?: boolean }).standalone)
    const available = (event: Event) => {
      event.preventDefault()
      setPrompt(event as InstallPrompt)
    }
    const complete = () => {
      setInstalled(true)
      setPrompt(null)
      setHelp(false)
    }
    sync()
    media.addEventListener('change', sync)
    window.addEventListener('beforeinstallprompt', available)
    window.addEventListener('appinstalled', complete)
    return () => {
      media.removeEventListener('change', sync)
      window.removeEventListener('beforeinstallprompt', available)
      window.removeEventListener('appinstalled', complete)
    }
  }, [])
  const install = async () => {
    if (!prompt) return setHelp(true)
    setPrompt(null)
    try {
      await prompt.prompt()
    } catch {
      setHelp(true)
    }
  }
  return { installed, install, help, closeHelp: () => setHelp(false) }
}
