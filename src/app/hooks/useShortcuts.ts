import { useEffect } from 'react'
import type { BoardSession } from './useBoardSession'
import type { View } from './useView'
import { getSettings, setSettings } from '../../appearance/settings'

type Shortcuts = {
  session: BoardSession
  view: View
  palette: boolean
  togglePalette: () => void
  dialogOpen: boolean
  closeDialogs: () => void
  overlayOpen: boolean
  replyMove: string | undefined
  studyMove: string | undefined
  commit: (usi: string) => void
  autoplayAllowed: boolean
  togglePanel: () => void
  toggleEscape: () => void
  toggleWatch: () => void
}

export function useShortcuts({ session, view, palette, togglePalette, dialogOpen, closeDialogs, overlayOpen, replyMove, studyMove, commit, autoplayAllowed, togglePanel, toggleEscape, toggleWatch }: Shortcuts) {
  const { preview, promotion, playing, nav, play, setPlaying, setPromotion, setSelection, setPeekFrom, setFlipped, exitPreview, modeRef } = session
  const { orbit, setOrbit, hideUi, setHideUi, flatView, setTilted, setShowControl } = view
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        togglePalette()
        return
      }
      if (palette || (event.target as HTMLElement).tagName === 'INPUT' || (event.target as HTMLElement).tagName === 'TEXTAREA') return
      if (event.key === ' ' && document.activeElement instanceof HTMLElement && document.activeElement.tagName === 'BUTTON') document.activeElement.blur()
      if (event.key === 'Escape') {
        if (dialogOpen) return closeDialogs()
        if (overlayOpen) return
        if (promotion) {
          setPromotion(null)
          setSelection(null)
          return
        }
        if (orbit) return setOrbit(false)
        if (hideUi) return setHideUi(false)
      }
      if (preview) {
        if (event.key === 'ArrowRight') nav.forward()
        else if (event.key === 'ArrowLeft') nav.back()
        else if (event.key === 'Escape') exitPreview()
        else if (event.key === ' ') {
          event.preventDefault()
          setPlaying((v) => !v)
        }
        return
      }
      if (event.key === 'ArrowRight' && replyMove) {
        event.preventDefault()
        play(replyMove)
        return
      }
      if (event.key === ' ') {
        event.preventDefault()
        if (modeRef.current === 'view') return toggleWatch()
        if (replyMove && !playing) play(replyMove)
        else if (studyMove) commit(studyMove)
        else if (autoplayAllowed) setPlaying((v) => !v)
        return
      }
      if (event.key === 'ArrowLeft') nav.back()
      else if (event.key === 'ArrowRight') nav.forward()
      else if (event.key === 'Home') nav.first()
      else if (event.key === 'End') nav.last()
      else if (event.key === 'f') setFlipped((v) => !v)
      else if (event.key === 'p') togglePanel()
      else if (event.key === 'm' && !event.metaKey && !event.ctrlKey) {
        const { sound, volume } = getSettings()
        setSettings(sound && volume > 0 ? { sound: false } : { sound: true, volume: volume || 0.6 })
        return
      }
      else if (event.key === 't' && !flatView) setTilted((v) => !v)
      else if (event.key === 'c' && !event.metaKey && !event.ctrlKey) setShowControl((v) => !v)
      else if (event.key === 'k' && modeRef.current === 'tsume') toggleEscape()
      else if (event.key === 'Escape') {
        setSelection(null)
        setPeekFrom(null)
      } else return
      setSelection(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
}
