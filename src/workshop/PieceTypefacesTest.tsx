import { useEffect, useState } from 'react'
import { PieceType } from 'tsshogi'
import { bakePreviews } from './board3d/bake'
import { PIECE_TYPEFACES, pieceSetForFace } from './pieceDesigns'
import { loadPieceSet, PIECE_SETS, type PieceSet } from './pieceSets'
import { loadPieceFont, useSettings, type PieceAppearance } from './settings'
import '../styles/dialogs.css'

const TYPES: { type: PieceType; label: string }[] = [
  { type: PieceType.KING, label: '王' },
  { type: PieceType.ROOK, label: '飛' },
  { type: PieceType.BISHOP, label: '角' },
  { type: PieceType.GOLD, label: '金' },
  { type: PieceType.SILVER, label: '銀' },
  { type: PieceType.KNIGHT, label: '桂' },
  { type: PieceType.LANCE, label: '香' },
  { type: PieceType.PAWN, label: '歩' },
  { type: PieceType.DRAGON, label: '龍' },
  { type: PieceType.HORSE, label: '馬' },
  { type: PieceType.PROM_SILVER, label: '全' },
  { type: PieceType.PROM_KNIGHT, label: '圭' },
  { type: PieceType.PROM_LANCE, label: '杏' },
  { type: PieceType.PROM_PAWN, label: 'と' },
]

export default function PieceTypefacesTest() {
  const st = useSettings()
  const [rows, setRows] = useState<{ set: PieceSet; images: string[] }[]>()
  const [error, setError] = useState<string>()
  const key = `${st.pieceFont}|${st.pieceStyle}|${st.pieceGuide}|${st.pieceMaterial}|${st.pieceColor}|${st.pieceGrain}|${st.pieceFinish}`
  useEffect(() => {
    const controller = new AbortController()
    setRows(undefined)
    setError(undefined)
    const sets = PIECE_TYPEFACES.map((family) => pieceSetForFace(family, st.pieceStyle))
    const uniqueSets = [...new Set(sets)]
    const appearance = (pieceSet: PieceSet): PieceAppearance => ({ pieceSet, pieceFont: st.pieceFont, pieceStyle: st.pieceStyle, pieceGuide: st.pieceGuide, pieceMaterial: st.pieceMaterial, pieceColor: st.pieceColor, pieceGrain: st.pieceGrain, pieceFinish: st.pieceFinish })
    const options = PIECE_TYPEFACES.map((family, index) => ({ key: `typeface:${family}`, ...appearance(sets[index]) }))
    void Promise.all([...uniqueSets.map((set) => loadPieceSet(set, st.pieceGuide)), loadPieceFont(st.pieceFont)])
      .then(() => bakePreviews(options, controller.signal, TYPES.map(({ type }) => type), (previewKey, images) => {
        if (!controller.signal.aborted) setRows((current) => [...(current ?? []), { set: previewKey.slice('typeface:'.length) as PieceSet, images }])
      }))
      .then((previews) => {
        if (!controller.signal.aborted) setRows(PIECE_TYPEFACES.map((set) => ({ set, images: previews.get(`typeface:${set}`) ?? [] })))
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(String(reason))
      })
    return () => controller.abort()
  }, [key, st.pieceFont, st.pieceStyle, st.pieceGuide, st.pieceMaterial, st.pieceColor, st.pieceGrain, st.pieceFinish])
  return (
    <main className="ws-komadai-test ws-typeface-test" aria-busy={!rows && !error}>
      <header className="ws-typeface-test-header">
        <h1>Piece typeface renderer</h1>
        <p>{st.pieceStyle} · {st.pieceGuide} · {st.pieceMaterial} · {st.pieceColor} · {st.pieceGrain} · {st.pieceFinish}</p>
      </header>
      {!rows && !error && <p>Rendering with current global settings…</p>}
      {error && <p role="alert">{error}</p>}
      {rows?.map(({ set, images }) => (
        <section className="ws-typeface-test-set" key={set}>
          <h2>{PIECE_SETS[set].label}</h2>
          <div className="ws-typeface-test-grid">
            {images.map((image, index) => (
              <figure key={TYPES[index].type} title={TYPES[index].label}>
                <img src={image} alt={TYPES[index].label} width={180} height={180} />
              </figure>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
