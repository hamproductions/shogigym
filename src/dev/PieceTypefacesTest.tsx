import { useEffect, useState } from 'react'
import { PieceType } from 'tsshogi'
import { bakePreviews } from '@/rendering/board3d/bake'
import { PIECE_TYPEFACES, pieceSetForFace } from '@/appearance/pieceDesigns'
import { loadPieceSet, PIECE_SETS, type PieceSet } from '@/appearance/pieceSets'
import { loadPieceFont, useSettings, type PieceAppearance } from '@/appearance/settings'
import { styled } from 'styled-system/jsx'
import { DevPage } from './pieces.styles'

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
    const appearance = (pieceSet: PieceSet): PieceAppearance => ({
      pieceSet,
      pieceFont: st.pieceFont,
      pieceStyle: st.pieceStyle,
      pieceGuide: st.pieceGuide,
      pieceMaterial: st.pieceMaterial,
      pieceColor: st.pieceColor,
      pieceGrain: st.pieceGrain,
      pieceFinish: st.pieceFinish,
    })
    const options = PIECE_TYPEFACES.map((family, index) => ({ key: `typeface:${family}`, ...appearance(sets[index]) }))
    void Promise.all([...uniqueSets.map((set) => loadPieceSet(set, st.pieceGuide)), loadPieceFont(st.pieceFont)])
      .then(() =>
        bakePreviews(
          options,
          controller.signal,
          TYPES.map(({ type }) => type),
          (previewKey, images) => {
            if (!controller.signal.aborted) setRows((current) => [...(current ?? []), { set: previewKey.slice('typeface:'.length) as PieceSet, images }])
          },
        ),
      )
      .then((previews) => {
        if (!controller.signal.aborted) setRows(PIECE_TYPEFACES.map((set) => ({ set, images: previews.get(`typeface:${set}`) ?? [] })))
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(String(reason))
      })
    return () => controller.abort()
  }, [key, st.pieceFont, st.pieceStyle, st.pieceGuide, st.pieceMaterial, st.pieceColor, st.pieceGrain, st.pieceFinish])
  return (
    <DevPage boxSizing="border-box" w="min(1760px, 100%)" mx="auto" aria-busy={!rows && !error}>
      <styled.header
        display="grid"
        gridTemplateColumns="minmax(0, 1fr) auto"
        alignItems="end"
        gap="{spacing.2} {spacing.4}"
        mb="4"
        pb="3"
        borderBottom="1px solid {colors.border}"
        _phone={{ alignItems: 'flex-start', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1' }}
      >
        <styled.h1 m="0" fontSize="xl">
          Piece typeface renderer
        </styled.h1>
        <styled.p m="0" color="fg.muted" fontSize="sm" textAlign="right" _phone={{ textAlign: 'left' }}>
          {st.pieceStyle} · {st.pieceGuide} · {st.pieceMaterial} · {st.pieceColor} · {st.pieceGrain} · {st.pieceFinish}
        </styled.p>
      </styled.header>
      {!rows && !error && <p>Rendering with current global settings…</p>}
      {error && <p role="alert">{error}</p>}
      {rows?.map(({ set, images }) => (
        <styled.section key={set} mb="4" p="clamp({spacing.3}, 1.5vw, {spacing.5})" border="1px solid {colors.border}" borderRadius="lg" bg="panel">
          <styled.h2 m="0 0 {spacing.2}" fontSize="md">
            {PIECE_SETS[set].label}
          </styled.h2>
          <styled.div display="grid" gridTemplateColumns="repeat(auto-fit, minmax(min(100%, 220px), 1fr))" gap="clamp({spacing.2}, 1.25vw, {spacing.4})">
            {images.map((image, index) => (
              <styled.figure
                key={TYPES[index].type}
                title={TYPES[index].label}
                display="grid"
                minW="0"
                gap="2"
                m="0"
                p="2"
                border="1px solid {colors.border}"
                borderRadius="md"
                bg="card"
              >
                <styled.img
                  src={image}
                  alt={TYPES[index].label}
                  htmlWidth={180}
                  htmlHeight={180}
                  display="block"
                  w="100%"
                  aspectRatio="1"
                  borderRadius="sm"
                  bg="#f5e3bd"
                  objectFit="contain"
                />
              </styled.figure>
            ))}
          </styled.div>
        </styled.section>
      ))}
    </DevPage>
  )
}
