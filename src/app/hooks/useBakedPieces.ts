import { useEffect, useState } from 'react'
import type { Baked } from '@/rendering/sprites'
import { loadBoardStyle } from '@/appearance/boardStyles'
import { loadPieceSet } from '@/appearance/pieceSets'
import { loadPieceFont, useSettings, type Settings } from '@/appearance/settings'

const bakeCache = new Map<string, Baked>()
type BakeJob = { controller: AbortController; promise: Promise<Baked>; users: number }
const jobs = new Map<string, BakeJob>()

function acquireBake(key: string, settings: Settings) {
  const existing = jobs.get(key)
  if (existing && !existing.controller.signal.aborted) {
    existing.users++
    return existing
  }
  const controller = new AbortController()
  const job: BakeJob = {
    controller,
    users: 1,
    promise: Promise.all([
      loadBoardStyle(settings.boardStyle),
      loadPieceFont(settings.pieceFont),
      loadPieceSet(settings.pieceSet, settings.pieceGuide),
      loadPieceFont('mincho'),
      import('@/rendering/board3d/bake'),
    ])
      .then(([, , , , { bakeFlat }]) => {
        controller.signal.throwIfAborted()
        return bakeFlat(Math.min(512, Math.round(256 * Math.min(2, window.devicePixelRatio || 1))), controller.signal, settings)
      })
      .then((baked) => {
        controller.signal.throwIfAborted()
        bakeCache.set(key, baked)
        if (bakeCache.size > 8) bakeCache.delete(bakeCache.keys().next().value!)
        return baked
      })
      .finally(() => {
        if (jobs.get(key) === job) jobs.delete(key)
      }),
  }
  jobs.set(key, job)
  return job
}

export function useBakedPieces(enabled = true) {
  const settings = useSettings()
  const key = `appearance-v17|${settings.pieceStyle}|${settings.pieceFinish}|${settings.pieceFont}|${settings.pieceSet}|${settings.pieceGuide}|${settings.pieceMaterial}|${settings.pieceColor}|${settings.pieceGrain}|${settings.boardStyle}|${settings.coords}|${settings.environment}`
  const [ready, setReady] = useState<Baked | null>(null)
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null)
  const error = failure?.key === key ? failure.message : null
  const cached = bakeCache.get(key)
  useEffect(() => {
    if (!enabled || bakeCache.has(key)) return
    let live = true
    const job = acquireBake(key, settings)
    void job.promise.then(
      (baked) => {
        if (live) setReady(baked)
      },
      (error: unknown) => {
        if (live && !job.controller.signal.aborted) setFailure({ key, message: error instanceof Error ? error.message : String(error) })
      },
    )
    return () => {
      live = false
      if (--job.users === 0) job.controller.abort()
    }
  }, [key, enabled, settings])
  return { baked: cached ?? ready, loading: enabled && !cached && !error, error }
}
