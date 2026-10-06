import { useEffect, type Dispatch, type SetStateAction } from 'react'
import { scrollPanelTop } from '@/app/hooks/useLayout'
import type { Mode } from '@/app/types'
import { tossSide, type useFurigoma } from '@/app/useFurigoma'
import { VIEWER_EVENT } from '@/utils/events'

const AUTO_START_MS = 2500

interface ShellEffects {
  mode: Mode
  cursor: number
  previewOpen: boolean
  lessonDone: boolean
  furigoma: ReturnType<typeof useFurigoma>
  startWatch: (side: 'sente' | 'gote') => void
  setShowViewer: Dispatch<SetStateAction<boolean>>
}

/** Window-level effects of the application shell: piece viewer event, panel scrolling and the watch toss auto-start. */
export function useShellEffects({ mode, cursor, previewOpen, lessonDone, furigoma, startWatch, setShowViewer }: ShellEffects) {
  const { pendingFurigoma, setPendingFurigoma, furigomaFaces } = furigoma
  useEffect(() => {
    if (mode !== 'view' || !pendingFurigoma || !furigomaFaces) return
    const timer = setTimeout(() => {
      startWatch(tossSide(furigomaFaces))
      setPendingFurigoma(false)
    }, AUTO_START_MS)
    return () => clearTimeout(timer)
  }, [mode, pendingFurigoma, furigomaFaces, startWatch, setPendingFurigoma])

  useEffect(() => {
    const open = () => setShowViewer(true)
    globalThis.addEventListener(VIEWER_EVENT, open)
    return () => globalThis.removeEventListener(VIEWER_EVENT, open)
  }, [setShowViewer])

  useEffect(() => {
    // `mode` is always a non-empty string: the effect re-runs (and scrolls) whenever it changes.
    if (mode) scrollPanelTop()
  }, [mode])
  const studyScrollKey = mode === 'lesson' || mode === 'drill' || mode === 'tsume' ? `${mode}|${cursor}|${previewOpen}|${lessonDone}` : ''
  useEffect(() => {
    if (studyScrollKey) scrollPanelTop(true)
  }, [studyScrollKey])
}
