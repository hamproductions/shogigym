import { useEffect, useState } from 'react'
import { bakeFlat, type Baked } from '../board3d/bake'
import { loadPieceSet } from '../pieceSets'
import { loadPieceFont, useSettings } from '../settings'

const bakeCache = new Map<string, Baked>()

export function useBakedPieces(enabled = true) {
  const settings = useSettings()
  const key = `${settings.pieceStyle}|${settings.pieceFinish}|${settings.pieceFont}|${settings.pieceSet}|${settings.pieceMaterial}|${settings.pieceGrain}|${settings.boardStyle}|${settings.coords}`
  const [ready, setReady] = useState<Baked | null>(null)
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null)
  const error = failure?.key === key ? failure.message : null
  const cached = bakeCache.get(key)
  if (cached && ready !== cached) setReady(cached)
  useEffect(() => {
    if (!enabled || bakeCache.has(key)) return
    const controller = new AbortController()
    void Promise.all([loadPieceFont(settings.pieceFont), loadPieceSet(settings.pieceSet), loadPieceFont('mincho')]).then(() => {
      if (controller.signal.aborted || bakeCache.has(key)) return
      return bakeFlat(Math.min(512, Math.round(256 * Math.min(2, window.devicePixelRatio || 1))), controller.signal).then((baked) => {
        if (controller.signal.aborted) return
        bakeCache.set(key, baked)
        if (bakeCache.size > 8) bakeCache.delete(bakeCache.keys().next().value!)
        setReady(baked)
      })
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setFailure({ key, message: error instanceof Error ? error.message : String(error) })
    })
    return () => {
      controller.abort()
    }
  }, [key, settings.pieceFont, settings.pieceSet, enabled])
  return { baked: cached ?? ready, loading: enabled && !cached && !error, error }
}
