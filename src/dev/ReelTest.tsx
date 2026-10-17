import '@fontsource/yuji-boku/400.css'
import '@fontsource/shippori-mincho-b1/800.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Position } from 'tsshogi'
import { Board3D } from '@/rendering/Board3D'
import type { SceneState } from '@/rendering/board3d/types'
import { installVirtualClock, startVirtual, stepVirtual } from '@/utils/virtualClock'
import { setSettings } from '@/appearance/settings'
import { styled } from 'styled-system/jsx'
import { line } from './reel.styles'

if (new URLSearchParams(location.search).has('capture')) installVirtualClock()

type Shot = { at: number; pos: [number, number, number]; look: [number, number, number] }
type Beat = { at: number; sfen?: string; usi?: string }

const brush = "'Yuji Boku', 'Shippori Mincho B1', serif"

const label = { fontWeight: '800', fontSize: '22px', letterSpacing: '0.4em', color: '#e8a33c' }

const START = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1'
const MATE = 'ln1gkg1nl/6+P2/2sppps1p/2p3p2/p8/P1P1P3P/2NP1PP2/3s1KSR1/L1+b2G1NL w R2Pbgp 42'

const MOVES: Beat[] = [
  { at: 0, sfen: START },
  { at: 2.5, usi: '7g7f' },
  { at: 3.7, usi: '3c3d' },
  { at: 4.9, usi: '8h2b+' },
  { at: 6.5, usi: '3a2b' },
  { at: 10.2, sfen: MATE },
  { at: 10.6, usi: 'B*5g' },
  { at: 12.0, usi: '4h5h' },
  { at: 13.0, usi: '7i6i' },
]

const SHOTS: Shot[] = [
  { at: 0, pos: [-38, 7, 7], look: [0, 3, 0] },
  { at: 2.4, pos: [-23, 17, 5], look: [0, 0, 0] },
  { at: 4.6, pos: [-15, 13, 6], look: [0, 0, -1] },
  { at: 5.6, pos: [-7, 8, -1], look: [2, 0, -3] },
  { at: 7.8, pos: [0, 34, 1], look: [0, 0, 0] },
  { at: 10.2, pos: [25, 12, -3], look: [0, 0, -1] },
  { at: 12.6, pos: [14, 7, -5], look: [0, 0, -2] },
  { at: 15.2, pos: [27, 21, 7], look: [0, 1, 0] },
  { at: 19, pos: [31, 29, 9], look: [0, 3, 0] },
]

const FLASHES = [0.05, 2.4, 4.95, 10.2, 16.6]

const smooth = (u: number) => u * u * (3 - 2 * u)
const clamp01 = (u: number) => Math.min(1, Math.max(0, u))
const env = (t: number, a: number, b: number, fade = 0.25) => clamp01((t - a) / fade) * clamp01((b - t) / fade)

function camera(t: number) {
  const i = Math.max(
    0,
    SHOTS.findIndex((s, k) => t >= s.at && (SHOTS[k + 1]?.at ?? Infinity) > t),
  )
  const a = SHOTS[i]
  const b = SHOTS[i + 1] ?? a
  const u = b === a ? 0 : smooth(clamp01((t - a.at) / (b.at - a.at)))
  const lerp = (x: number[], y: number[]) => x.map((v, k) => v + (y[k] - v) * u) as [number, number, number]
  return { pos: lerp(a.pos, b.pos), look: lerp(a.look, b.look) }
}

export default function ReelTest() {
  const [t, setT] = useState(-1)
  const [position, setPosition] = useState(() => Position.newBySFEN(START)!)
  const [lastMove, setLastMove] = useState<string | undefined>()
  const done = useRef(0)
  const startAt = useRef(0)

  useEffect(() => {
    setSettings({ lang: 'en', environment: 'traditional', characters: true, power: true, sound: false, coords: true })
    const w = window as unknown as { __reel: () => void; __capture: () => void; __frame: (ms: number) => Promise<void> }
    w.__reel = () => {
      done.current = 0
      startAt.current = performance.now()
      setT(0)
    }
    w.__capture = () => {
      done.current = 0
      startAt.current = startVirtual()
      setT(0)
    }
    w.__frame = stepVirtual
  }, [])

  const running = t >= 0
  useEffect(() => {
    if (!running) return
    let frame = 0
    const tick = () => {
      const now = (performance.now() - startAt.current) / 1000
      const s = (window as unknown as { __dbg?: SceneState }).__dbg
      if (s?.controls) {
        const c = camera(now)
        s.camera.position.set(...c.pos)
        s.controls.target.set(...c.look)
        s.camera.lookAt(new THREE.Vector3(...c.look))
      }
      while (done.current < MOVES.length && MOVES[done.current].at <= now) {
        const beat = MOVES[done.current++]
        if (beat.sfen) {
          setPosition(Position.newBySFEN(beat.sfen)!)
          setLastMove(undefined)
        } else if (beat.usi) {
          setPosition((p) => {
            const next = p.clone()
            next.doMove(next.createMoveByUSI(beat.usi!)!)
            return next
          })
          setLastMove(beat.usi)
        }
      }
      setT(now)
      if (now < 19.5) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [running])

  const flash = useMemo(() => Math.max(0, ...FLASHES.map((f) => (t >= f ? Math.exp(-(t - f) * 9) : 0))), [t])
  const slam = (a: number) => 1 + 0.35 * Math.exp(-Math.max(0, t - a) * 14)

  return (
    <styled.div position="fixed" inset="0" bg="#0c0a08" fontFamily="sans">
      <styled.div position="absolute" inset="0" css={{ '& > .board3d': { position: 'absolute', inset: '0' } }}>
        <Board3D
          position={position}
          flipped={false}
          tilted={false}
          orbit
          lastMove={lastMove}
          selected={null}
          targets={[]}
          arrows={[]}
          onSquare={() => undefined}
          onHand={() => undefined}
          onDrop={() => undefined}
        />
      </styled.div>
      <styled.div position="absolute" inset="0" pointerEvents="none" color="#fff6e4">
        <styled.div
          position="absolute"
          left="7%"
          bottom="14%"
          display="grid"
          transformOrigin="left bottom"
          css={{
            '& span': label,
            '& strong': {
              fontFamily: brush,
              fontWeight: '400',
              fontSize: '170px',
              lineHeight: '1',
              textShadow: '0 0 40px rgba(232, 80, 40, 0.7), 0 6px 0 rgba(0, 0, 0, 0.5)',
            },
          }}
          style={{ opacity: env(t, 0.1, 2.35, 0.12), transform: `scale(${slam(0.1)})` }}
        >
          <span>SHOGI GYM</span>
          <strong>将棋ジム</strong>
        </styled.div>
        <div className={line()} style={{ opacity: env(t, 2.55, 4.85, 0.15), transform: `translateX(${(1 - smooth(clamp01((t - 2.55) / 0.3))) * -60}px)` }}>
          <strong>Learn openings</strong>
          <em>by playing them.</em>
        </div>
        <div className={line({ place: 'right' })} style={{ opacity: env(t, 5.05, 7.7, 0.15), transform: `scale(${slam(5.05)})` }}>
          <strong>Every move,</strong>
          <em>explained.</em>
        </div>
        <styled.div
          position="absolute"
          left="50%"
          top="44%"
          w="62%"
          borderRadius="14px"
          overflow="hidden"
          boxShadow="0 30px 80px rgba(0, 0, 0, 0.7), 0 0 0 2px rgba(232, 163, 60, 0.6)"
          css={{ '& img': { display: 'block', w: '100%' } }}
          style={{
            opacity: env(t, 7.9, 10.15, 0.2),
            transform: `translate(-50%, -50%) rotate(${-3 + 3 * smooth(clamp01((t - 7.9) / 0.5))}deg) scale(${0.82 + 0.18 * smooth(clamp01((t - 7.9) / 0.45))})`,
          }}
        >
          <img src="/.shots/promo/announce.png" alt="" />
        </styled.div>
        <div className={line({ place: 'bottom' })} style={{ opacity: env(t, 8.1, 10.15, 0.15) }}>
          <strong>Study. Quiz. Play the AI.</strong>
        </div>
        <styled.div
          css={{
            ...label,
            position: 'absolute',
            right: '7%',
            top: '10%',
            fontSize: '40px',
            color: '#ff5a3c',
            textShadow: '0 0 24px rgba(255, 70, 40, 0.8)',
            transformOrigin: 'right top',
          }}
          style={{ opacity: env(t, 10.3, 12.3, 0.15), transform: `scale(${slam(10.3)})` }}
        >
          POWER MODE
        </styled.div>
        <styled.div
          position="absolute"
          inset="0"
          display="grid"
          placeContent="center"
          justifyItems="center"
          gap="10px"
          background="radial-gradient(circle at 50% 50%, rgba(12, 10, 8, 0.55), rgba(12, 10, 8, 0.92))"
          css={{
            '& strong': { fontFamily: brush, fontWeight: '400', fontSize: '150px', lineHeight: '1', textShadow: '0 0 40px rgba(232, 80, 40, 0.6)' },
            '& span': { fontWeight: '700', fontSize: '30px' },
            '& em': { minH: '1.3em', fontStyle: 'normal', fontFamily: 'ui-monospace, monospace', fontSize: '28px', color: '#e8a33c' },
          }}
          style={{ opacity: clamp01((t - 16.6) / 0.35) }}
        >
          <strong style={{ transform: `scale(${slam(16.6)})` }}>将棋ジム</strong>
          <span>Shogi Gym · learn openings, beginner to 1–2 dan</span>
          <em>{'hamproductions.github.io/shogigym'.slice(0, Math.max(0, Math.floor((t - 17.1) * 28)))}</em>
        </styled.div>
        <styled.div position="absolute" inset="0" bg="#fff" mixBlendMode="screen" style={{ opacity: flash }} />
      </styled.div>
    </styled.div>
  )
}
