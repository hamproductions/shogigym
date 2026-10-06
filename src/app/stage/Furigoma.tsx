import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Color, PieceType } from 'tsshogi'
import type { Side } from '@/utils/shogi'
import { playSound, useSettings } from '@/appearance/settings'
import { Button } from '@/app/ui/Button'
import { Dialog, DialogHeader } from '@/app/ui/Dialog'
import { useBakedPieces } from '@/app/hooks/useBakedPieces'
import { spriteKey } from '@/rendering/sprites'
import { say, sayFurigomaResult } from '@/utils/voice'

type Translate = (key: string, options?: Record<string, unknown>) => string

interface FallingPawn {
  image: HTMLImageElement
  z: number
  yaw: number
  x: number
  y: number
  vx: number
  vy: number
  angle: number
  spin: number
  target: number
  contacts: number
  settled: boolean
}

function resultText({ spectator, ja, pawns, side, t }: { spectator: boolean; ja: boolean; pawns: number; side: Side; t: Translate }) {
  const tokins = 5 - pawns
  if (spectator) return t('watch.furigomaResult', { pawns, tokins, side: t(`common.${side}`) })
  if (ja) return `歩${pawns}枚・と金${tokins}枚：あなたは${side === 'sente' ? '先手' : '後手'}`
  return `${pawns} pawns · ${tokins} tokins: you play ${side === 'sente' ? 'Sente' : 'Gote'}`
}

function pieceLabel(face: boolean, ja: boolean) {
  if (face) return ja ? '歩' : 'Pawn'
  return ja ? 'と金' : 'Tokin'
}

function statusText({ error, result, loading, ja }: { error: boolean; result: string | null; loading: boolean; ja: boolean }) {
  if (error) return ja ? '振り駒を読み込めませんでした' : 'Could not load furigoma'
  if (result !== null) return result
  if (loading) return ja ? '振り駒を読み込んでいます…' : 'Loading furigoma…'
  return ja ? '歩を投げています…' : 'Tossing five pawns…'
}

function startHint({ spectator, ja, t }: { spectator: boolean; ja: boolean; t: Translate }) {
  if (spectator) return t('watch.starting')
  return ja ? 'どこかをクリックして対局開始' : 'Click anywhere to start'
}

function createPawn(host: HTMLElement, face: boolean, i: number, ja: boolean): FallingPawn {
  const image = document.createElement('img')
  image.alt = pieceLabel(face, ja)
  Object.assign(image.style, {
    position: 'absolute',
    width: '22%',
    height: '34%',
    objectFit: 'contain',
    left: '50%',
    top: '58%',
    transformOrigin: 'center',
  })
  host.append(image)
  return {
    image,
    z: (i % 2 ? 0.13 : -0.12) + (Math.random() - 0.5) * 0.1,
    yaw: Math.random() * 360,
    x: (i - 2) * 0.035,
    y: 0.85 + Math.random() * 0.1,
    vx: (i - 2) * 0.18,
    vy: 0.6 + Math.random() * 0.4,
    angle: Math.random() * Math.PI,
    spin: 12 + Math.random() * 6,
    target: face ? 0 : Math.PI,
    contacts: 0,
    settled: false,
  }
}

function stepPawn(item: FallingPawn, dt: number) {
  item.vy -= 3 * dt
  item.y += item.vy * dt
  item.x += item.vx * dt
  item.angle += item.spin * dt
  if (item.y < 0) {
    item.y = 0
    item.vy *= -0.32
    item.vx *= 0.8
    item.spin *= 0.65
    if (!item.contacts) playSound('move')
    item.contacts++
    if (item.contacts > 2 && item.vy < 0.1) {
      item.vy = 0
      item.angle = item.target + (item.angle - item.target) * Math.exp(-dt * 18)
      if (Math.abs(item.angle - item.target) < 0.015 && Math.abs(item.vx) < 0.01) {
        item.angle = item.target
        item.settled = true
      }
    }
  }
  if (Math.abs(item.x) > 0.4) {
    item.x = Math.sign(item.x) * 0.4
    item.vx *= -0.35
  }
}

function separatePawns(items: FallingPawn[]) {
  for (let i = 0; i < items.length; i++)
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i]
      const b = items[j]
      if (a.y > 0.1 || b.y > 0.1) continue
      const distance = b.x - a.x
      if (Math.abs(distance) >= 0.145) continue
      const separation = (0.145 - Math.abs(distance)) / 2
      const direction = distance >= 0 ? 1 : -1
      a.x -= direction * separation
      b.x += direction * separation
    }
}

export function Furigoma({ onDone, onCancel, spectator = false }: { onDone: (side: Side) => void; onCancel: () => void; spectator?: boolean }) {
  const { t } = useTranslation()
  const settings = useSettings()
  const host = useRef<HTMLDivElement>(null)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  }, [onDone])
  const [result, setResult] = useState<string | null>(null)
  const [side, setSide] = useState<Side | null>(null)
  const [loading, setLoading] = useState(true)
  const ja = settings.lang === 'ja'
  const sprites = useBakedPieces()
  useEffect(() => {
    if (!spectator || !side) return
    const timer = setTimeout(() => done.current(side), 2500)
    return () => clearTimeout(timer)
  }, [spectator, side])
  useEffect(() => {
    const cancel = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopImmediatePropagation()
        onCancel()
      }
    }
    globalThis.addEventListener('keydown', cancel, true)
    return () => globalThis.removeEventListener('keydown', cancel, true)
  }, [onCancel])
  useEffect(() => {
    if (sprites.loading || !sprites.baked) return
    let live = true
    say(spectator ? '振り駒を行います' : 'あなたの振り歩先です', true)
    playSound('clatter')
    let frame = 0
    const finish = (faces: boolean[]) => {
      const pawns = faces.filter(Boolean).length
      const winner: Side = pawns >= 3 ? 'sente' : 'gote'
      setResult(resultText({ spectator, ja, pawns, side: winner, t }))
      sayFurigomaResult(pawns, spectator)
      setSide(winner)
    }
    if (host.current && sprites.baked) {
      const faces = Array.from({ length: 5 }, () => Math.random() < 0.5)
      const items = faces.map((face, i) => createPawn(host.current!, face, i, ja))
      setLoading(false)
      let previous = performance.now()
      const render = (now: number) => {
        if (!live || !host.current) return
        const dt = Math.min(0.03, (now - previous) / 1000)
        previous = now
        items.forEach((item) => {
          if (!item.settled) stepPawn(item, dt)
          const pawn = Math.cos(item.angle) >= 0
          item.image.src = sprites.baked!.pieces.get(spriteKey(pawn ? PieceType.PAWN : PieceType.PROM_PAWN, Color.BLACK, true))!
          item.image.style.transform = `translate(calc(-50% + ${item.x * host.current!.clientWidth}px), calc(-50% - ${(item.y * 0.55 - item.z) * host.current!.clientHeight}px)) scaleY(${Math.max(0.06, Math.abs(Math.cos(item.angle)))}) rotate(${item.y > 0 ? item.angle * 15 : item.yaw}deg)`
        })
        separatePawns(items)
        if (items.some((item) => !item.settled)) frame = requestAnimationFrame(render)
        else finish(faces)
      }
      frame = requestAnimationFrame(render)
      return () => {
        live = false
        cancelAnimationFrame(frame)
        items.forEach(({ image }) => image.remove())
      }
    }
  }, [ja, sprites.baked, sprites.loading, spectator, t])
  return (
    <div
      role="presentation"
      onClick={(event) => {
        if ((event.target as HTMLElement).closest('button')) return
        if (side) done.current(side)
      }}
    >
      <Dialog label={ja ? '振り駒' : 'Furigoma'} className="app-furigoma">
        <DialogHeader title={ja ? '振り駒' : 'Furigoma'} closeLabel={ja ? 'キャンセル' : 'Cancel'} onClose={onCancel} />
        <div
          ref={host}
          style={{
            position: 'relative',
            width: '100%',
            height: 'min(36vh, 280px)',
            overflow: 'hidden',
            borderRadius: 12,
            background: `url(${sprites.baked?.board ?? ''}) center / cover`,
            margin: '16px 0',
          }}
        />
        <p>
          <output>{statusText({ error: !!sprites.error, result, loading, ja })}</output>
        </p>
        <div className="app-actions">
          <Button
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation()
              onCancel()
            }}
          >
            {ja ? 'キャンセル' : 'Cancel'}
          </Button>
          {side && <span>{startHint({ spectator, ja, t })}</span>}
        </div>
      </Dialog>
    </div>
  )
}
