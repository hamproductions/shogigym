import rules from '../../../vendor/taikyoku-engine/rules_data.h?raw'
import { useEffect, useRef } from 'react'
import { useSettings } from '@/appearance/settings'
import { SPRITE_BOX } from '@/rendering/sprites'
import { bakeTaikyoku, bakedKey, taikyokuSprites } from './bake'
import { catalog, type Cell } from './notation'

type Direction = [number, number]
type Atom = { kind: number; directions: Direction[]; range: number; mode: number; jumps: number[]; tail: number; screens: number; geom: number }

const section = (name: string) => {
  const match = rules.match(new RegExp(`\\b${name}\\[[^;=]*=\\s*\\{([\\s\\S]*?)\\};`))
  if (!match) throw new Error(`Missing native movement table: ${name}`)
  return match[1]
}
const rows = (name: string) => [...section(name).matchAll(/\{([^{}]*)\}/g)].map((match) => match[1].split(',').map(Number))
const directions = rows('DIRS') as Direction[]
const atoms = rows('ATOMS')
const offsets = section('ATOM_OFF').split(',').map(Number)
const pieces = [...section('PIECES').matchAll(/\{"[^"]*","([^"]*)",(\d+),-?\d+,\d+,\d+,-?\d+\}/g)]

const movementRules = new Map<string, Atom[]>(
  pieces.map((piece, index) => [
    `${piece[2] === '1' ? '+' : ''}${piece[1]}`,
    atoms.slice(offsets[index], offsets[index + 1]).map(([kind, start, count, range, mode, d0, d1, tail, screens, geom]) => ({
      kind,
      directions: directions.slice(start, start + count),
      range,
      mode,
      jumps: [d0, d1].filter(Boolean),
      tail,
      screens,
      geom,
    })),
  ]),
)

export function MovementGuide({ cell, lang }: { cell: Cell; lang: string }) {
  const settings = useSettings()
  const piece = useRef<SVGImageElement>(null)
  useEffect(() => {
    const controller = new AbortController()
    const cache = taikyokuSprites(settings)
    const show = (image: HTMLCanvasElement) => piece.current?.setAttribute('href', image.toDataURL())
    const image = cache.get(bakedKey(cell))
    if (image) show(image)
    else
      void bakeTaikyoku(
        [cell],
        controller.signal,
        (key, image) => {
          if (controller.signal.aborted) return
          cache.set(key, image)
          show(image)
        },
        settings,
      ).catch((error) => {
        if (!controller.signal.aborted) console.warn('movement piece bake failed', error)
      })
    return () => controller.abort()
  }, [cell.key, cell.side, settings])
  const info = catalog[cell.key]
  const moves = movementRules.get(cell.key)
  if (!moves || !info) return null
  const ja = lang === 'ja'
  const sign = cell.side === 'b' ? 1 : -1
  const extent = Math.max(
    3,
    ...moves.flatMap((atom) =>
      atom.directions.map(
        ([x, y]) =>
          Math.max(Math.abs(x), Math.abs(y)) *
          (atom.kind === 0 ? Math.min(7, atom.range) : atom.kind === 2 ? Math.max(...atom.jumps) + (atom.tail < 36 ? atom.tail : 0) : 1),
      ),
    ),
  )
  const special = [...new Set(moves.filter((atom) => atom.kind >= 2).map((atom) => atom.kind))]
  const descriptions: Record<number, string> = ja
    ? {
        2: '跳んでから、同じ方向に進めます。',
        3: '途中の駒を跳び越えて進めます。',
        4: '途中で一度、方向を曲げられます。',
        5: '２回動けます。途中で止まる、取って戻る、その場に留まることもできます。',
        6: '同格以上の駒は跳び越せません。間に駒がなければ、同格以上の敵の駒も取れます。下位の駒は味方も含め、途中で取って進めます。',
      }
    : {
        2: 'Jump, then continue in the same direction.',
        3: 'Continue past intervening pieces.',
        4: 'May turn once during the move.',
        5: 'Move twice; may stop after one step, capture and return, or stay in place.',
        6: 'Cannot jump over equal or higher ranks. With a clear path, may capture an equal or higher-ranked enemy. Lower-ranked pieces along the path are captured, including friendly pieces.',
      }
  const dot = (x: number, y: number, blue: boolean, key: string, mode = 0) => (
    <circle
      key={key}
      cx={x * sign}
      cy={-y * sign}
      r="0.17"
      className={blue ? 'tk-rule-jump' : 'tk-rule-step'}
      fill={mode === 1 ? 'none' : undefined}
      strokeWidth={mode === 1 ? 0.1 : 0}
    />
  )
  const ray = (x: number, y: number, key: string, start = 0.85, dashed = false) => (
    <path
      key={key}
      d={`M${x * start * sign} ${-y * start * sign}L${x * (extent - 0.3) * sign} ${-y * (extent - 0.3) * sign}`}
      className="tk-rule-slide"
      strokeDasharray={dashed ? '0.3 0.2' : undefined}
    />
  )
  return (
    <div className="tk-rule-guide">
      <svg
        viewBox={`${-extent - 0.3} ${-extent - 0.3} ${2 * extent + 0.6} ${2 * extent + 0.6}`}
        role="img"
        aria-label={`${info.k} ${ja ? 'の動き方' : 'movement rules'}`}
      >
        <rect x={-extent - 0.2} y={-extent - 0.2} width={2 * extent + 0.4} height={2 * extent + 0.4} className="tk-rule-border" />
        {Array.from({ length: 2 * extent }, (_, index) => {
          const offset = index - extent + 0.5
          return <path key={index} d={`M${offset} ${-extent - 0.2}V${extent + 0.2}M${-extent - 0.2} ${offset}H${extent + 0.2}`} className="tk-rule-grid" />
        })}
        {moves.flatMap((atom, index) => {
          if (atom.kind === 5)
            return Array.from({ length: 25 }, (_, n) => {
              const x = (n % 5) - 2
              const y = Math.floor(n / 5) - 2
              return x || y ? dot(x, y, true, `${index}/${n}`) : null
            })
          return atom.directions.flatMap(([x, y], d) => {
            const key = `${index}/${d}`
            if (atom.kind === 0)
              return atom.range >= 36
                ? [ray(x, y, key)]
                : Array.from({ length: atom.range }, (_, n) => dot(x * (n + 1), y * (n + 1), false, `${key}/${n}`, atom.mode))
            if (atom.kind === 1) return [dot(x, y, Math.max(Math.abs(x), Math.abs(y)) > 1, key, atom.mode)]
            if (atom.kind === 2)
              return [
                ...atom.jumps.map((distance) => dot(x * distance, y * distance, true, `${key}/${distance}`)),
                ...(atom.tail >= 36
                  ? [ray(x, y, `${key}/tail`, Math.min(...atom.jumps) + 0.3)]
                  : atom.jumps.flatMap((distance) =>
                      Array.from({ length: atom.tail }, (_, n) => dot(x * (distance + n + 1), y * (distance + n + 1), false, `${key}/tail/${distance}/${n}`)),
                    )),
              ]
            if (atom.kind === 3 || atom.kind === 6) return [ray(x, y, key, 0.85, true)]
            const turns: Direction[] =
              atom.geom === 0
                ? [
                    [-y, x],
                    [y, -x],
                  ]
                : [
                    [x, -y],
                    [-x, y],
                  ]
            return [
              ray(x, y, key),
              ...turns.map(([tx, ty], t) => (
                <path key={`${key}/${t}`} d={`M${x * 2 * sign} ${-y * 2 * sign}l${tx * 2 * sign} ${-ty * 2 * sign}`} className="tk-rule-turn" />
              )),
            ]
          })
        })}
        <image
          ref={piece}
          x={-SPRITE_BOX / 2}
          y={-SPRITE_BOX / 2}
          width={SPRITE_BOX}
          height={SPRITE_BOX}
          transform={cell.side === 'w' ? 'rotate(180)' : undefined}
        />
      </svg>
      <div className="tk-rule-legend">
        <span className="tk-rule-step">● {ja ? '一目ずつ進む' : 'Step to a marked square'}</span>
        <span className="tk-rule-step">━ {ja ? '線の方向に走る' : 'Slide along the line'}</span>
        <span className="tk-rule-jump">● {ja ? '跳び・連続移動' : 'Jump / multi-step move'}</span>
        {special.map((kind) => (
          <p key={kind}>{descriptions[kind]}</p>
        ))}
        {moves.some((atom) => atom.mode === 1 || atom.mode === 2) && (
          <p>{ja ? '白抜きは移動のみ。取る時だけの動きもあります。' : 'Hollow marks: non-capturing moves. Some moves apply only to captures.'}</p>
        )}
      </div>
    </div>
  )
}
