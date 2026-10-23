import { useEffect, useRef, useState } from 'react'
import { Color, PieceType, promotedPieceType } from 'tsshogi'
import { spriteKey, type Baked, type PromotionAtlas } from '@/rendering/sprites'
import { loadBoardStyle } from '@/appearance/boardStyles'
import { loadPieceSet } from '@/appearance/pieceSets'
import { loadPieceFont, useSettings, type Settings } from '@/appearance/settings'

const promotionCache = new Map<string, PromotionAtlas>()
const promotionTypes = [PieceType.PAWN, PieceType.LANCE, PieceType.KNIGHT, PieceType.SILVER, PieceType.BISHOP, PieceType.ROOK]

async function atlasFromSprites(baked: Baked, types: PieceType[]): Promise<PromotionAtlas> {
  const columns = 4
  const rows = Math.ceil(types.length / columns)
  const images = await Promise.all(
    types.map(async (type) => {
      const image = new Image()
      image.src = baked.pieces.get(spriteKey(type, Color.BLACK, true))!
      await image.decode()
      return image
    }),
  )
  const cell = images[0].naturalWidth
  const canvas = document.createElement('canvas')
  canvas.width = columns * cell
  canvas.height = rows * cell
  const ctx = canvas.getContext('2d')!
  images.forEach((image, i) => ctx.drawImage(image, (i % columns) * cell, Math.floor(i / columns) * cell, cell, cell))
  return { image: canvas.toDataURL('image/png'), types, columns, rows }
}

export function usePromotionFaces(enabled: boolean, canBake = true) {
  const settings = useSettings()
  const latest = useRef(settings)
  useEffect(() => {
    latest.current = settings
  }, [settings])
  const key = `${settings.pieceStyle}|${settings.pieceFinish}|${settings.pieceFont}|${settings.pieceSet}|${settings.pieceGuide}|${settings.pieceMaterial}|${settings.pieceColor}|${settings.pieceGrain}|${settings.environment}`
  const [ready, setReady] = useState<{ key: string; faces: PromotionAtlas } | null>(null)
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null)
  const [progress, setProgress] = useState<{ key: string; done: number; total: number } | null>(null)
  useEffect(() => {
    if (!enabled || promotionCache.has(key)) return
    const controller = new AbortController()
    const snapshot = latest.current
    const flat = bakeCache.get(bakeKey(snapshot))
    if (flat) {
      const types = promotionTypes.flatMap((type) => [type, promotedPieceType(type)])
      atlasFromSprites(flat, types).then(
        (faces) => {
          if (controller.signal.aborted) return
          promotionCache.set(key, faces)
          if (promotionCache.size > 4) promotionCache.delete(promotionCache.keys().next().value!)
          setReady({ key, faces })
        },
        (error: unknown) => {
          if (!controller.signal.aborted) setFailure({ key, message: error instanceof Error ? error.message : String(error) })
        },
      )
      return () => controller.abort()
    }
    if (!canBake) return
    void Promise.all([loadPieceFont(snapshot.pieceFont), loadPieceSet(snapshot.pieceSet, snapshot.pieceGuide), import('@/rendering/board3d/bake')])
      .then(async ([, , { bakePromotionAtlas }]) => {
        if (controller.signal.aborted) return
        const types = promotionTypes.flatMap((type) => [type, promotedPieceType(type)])
        const faces = await bakePromotionAtlas(snapshot, types, controller.signal, (done, total) => {
          if (!controller.signal.aborted) setProgress({ key, done, total })
        })
        const image = new Image()
        image.src = faces.image
        await image.decode()
        if (controller.signal.aborted) return
        promotionCache.set(key, faces)
        if (promotionCache.size > 4) promotionCache.delete(promotionCache.keys().next().value!)
        setReady({ key, faces })
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setFailure({ key, message: error instanceof Error ? error.message : String(error) })
      })
    return () => controller.abort()
  }, [enabled, canBake, key])
  return {
    faces: promotionCache.get(key) ?? (ready?.key === key ? ready.faces : null),
    error: failure?.key === key ? failure.message : null,
    progress: { phase: 'previews' as const, done: progress?.key === key ? progress.done : 0, total: promotionTypes.length * 2 },
  }
}

const bakeCache = new Map<string, Baked>()
type BakeJob = { controller: AbortController; promise: Promise<Baked>; users: number }
const jobs = new Map<string, BakeJob>()

function acquireBake(key: string, settings: Settings, scope: 'board' | 'furigoma') {
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
        return bakeFlat(
          Math.min(512, Math.round(256 * Math.min(2, window.devicePixelRatio || 1))),
          controller.signal,
          settings,
          scope === 'furigoma' ? [PieceType.PAWN, PieceType.PROM_PAWN] : undefined,
          scope === 'furigoma' ? [Color.BLACK] : undefined,
        )
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

const bakeKey = (settings: Settings) =>
  `appearance-v17|${settings.pieceStyle}|${settings.pieceFinish}|${settings.pieceFont}|${settings.pieceSet}|${settings.pieceGuide}|${settings.pieceMaterial}|${settings.pieceColor}|${settings.pieceGrain}|${settings.boardStyle}|${settings.coords}|${settings.environment}`

export function useBakedPieces(enabled = true, scope: 'board' | 'furigoma' = 'board') {
  const settings = useSettings()
  const fullKey = bakeKey(settings)
  const key = scope === 'furigoma' ? `${fullKey}|furigoma` : fullKey
  const [ready, setReady] = useState<Baked | null>(null)
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null)
  const error = failure?.key === key ? failure.message : null
  const cached = (scope === 'furigoma' ? bakeCache.get(fullKey) : null) ?? bakeCache.get(key)
  useEffect(() => {
    if (!enabled || cached) return
    let live = true
    const job = acquireBake(key, settings, scope)
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
  }, [key, enabled, settings, scope, cached])
  return { baked: cached ?? ready, loading: enabled && !cached && !error, error }
}
