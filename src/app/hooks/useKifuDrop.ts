import { useEffect } from 'react'
import { decodeKifuFile } from '@/utils/kifu'
import { useLatest } from './useLatest'

/** Drop a kifu file anywhere on the page to load it. `onText` returns an error message or null. */
export function useKifuDrop(onText: (text: string) => string | null, onError: (message: string) => void) {
  const latest = useLatest({ onText, onError })
  useEffect(() => {
    const hasFiles = (e: DragEvent) => !!e.dataTransfer?.types.includes('Files')
    const over = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault()
    }
    const drop = async (e: DragEvent) => {
      const file = e.dataTransfer?.files?.[0]
      if (!file) return
      e.preventDefault()
      const error = latest.current.onText(decodeKifuFile(await file.arrayBuffer()))
      if (error) latest.current.onError(error)
    }
    window.addEventListener('dragover', over)
    window.addEventListener('drop', drop)
    return () => {
      window.removeEventListener('dragover', over)
      window.removeEventListener('drop', drop)
    }
  }, [latest])
}
