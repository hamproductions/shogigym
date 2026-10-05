import './pieces.css'
import { useEffect, useState } from 'react'
import { handSnapshots, type HandSnapshot } from '@/rendering/board3d/komadai'
import { loadPieceFont, useSettings } from '@/appearance/settings'
import { loadPieceSet } from '@/appearance/pieceSets'

const ORDER = ['P', 'P', 'B', 'P', 'S', 'G', 'P', 'N', 'L', 'P', 'R', 'G', 'S', 'N', 'L', 'P', 'P', 'P', 'P']
const PAWNS_FIRST = ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'L', 'L', 'N', 'N', 'S', 'S', 'G', 'G', 'B', 'R']

function handSfen(pieces: string[]) {
  const counts = new Map<string, number>()
  for (const p of pieces) counts.set(p, (counts.get(p) ?? 0) + 1)
  const hand = ['R', 'B', 'G', 'S', 'N', 'L', 'P']
    .filter((p) => counts.get(p))
    .map((p) => `${counts.get(p)! > 1 ? counts.get(p) : ''}${p}`)
    .join('')
  return `4k4/9/9/9/9/9/9/9/4K4 b ${hand} 1`
}

const SERIES = [
  { title: 'Typical capture order', order: ORDER },
  { title: 'Pawns first', order: PAWNS_FIRST },
]

export default function KomadaiTest() {
  const st = useSettings()
  const [shots, setShots] = useState<HandSnapshot[][] | null>(null)
  useEffect(() => {
    let live = true
    Promise.all([loadPieceFont(st.pieceFont), loadPieceSet(st.pieceSet, st.pieceGuide)])
      .catch(() => undefined)
      .then(() => {
        if (live)
          setShots(
            SERIES.map((s) =>
              handSnapshots(
                s.order.map((_, i) => handSfen(s.order.slice(0, i + 1))),
                360,
              ),
            ),
          )
      })
    return () => {
      live = false
    }
  }, [st.pieceFont, st.pieceSet, st.pieceGuide, st.pieceFinish])
  return (
    <main className="app-komadai-test">
      <h1>駒台 layout test: 1 to 19 pieces in hand</h1>
      {!shots && <p>Rendering…</p>}
      {shots &&
        SERIES.map((s, k) => (
          <section key={s.title}>
            <h2>{s.title}</h2>
            <div className="app-komadai-grid">
              {shots[k].map((shot, i) => (
                <figure key={i}>
                  <img src={shot.url} alt={`${i + 1} pieces`} width={180} height={180} />
                  <figcaption>
                    {i + 1}: {s.order.slice(0, i + 1).join('')} · {shot.mode}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ))}
    </main>
  )
}
