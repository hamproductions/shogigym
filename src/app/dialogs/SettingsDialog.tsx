import { useEffect, useRef, useState } from 'react'
import { Color, PieceType, promotedPieceType } from 'tsshogi'
import { faceText } from '@/rendering/koma'
import { bakePreviews } from '@/rendering/board3d/bake'
import { finishProfile } from '@/rendering/board3d/relief'
import { pieceSurface } from '@/rendering/board3d/textures'
import { useTranslation } from 'react-i18next'
import { css } from 'styled-system/css'
import { Box, styled, Wrap } from 'styled-system/jsx'
import { say } from '@/utils/voice'
import { EngineSettings } from '@/app/EngineSettings'
import { loadPieceSet, pieceGlyphUrl, PIECE_SETS, type PieceSet } from '@/appearance/pieceSets'
import { PIECE_FACE_PAIRS, PIECE_TYPEFACES, pieceFamily, pieceSetForFace } from '@/appearance/pieceDesigns'
import {
  loadPieceFont,
  PIECE_COLORS,
  PIECE_FINISHES,
  PIECE_FONTS,
  PIECE_MATERIALS,
  PIECE_GRAINS,
  pieceFinishOptions,
  selectedPieceFinish,
  playSound,
  setSettings,
  useSettings,
  type BoardStyle,
  type Environment,
  type Lang,
  type PieceMaterial,
  type PieceGrain,
  type PieceFont,
  type PieceAppearance,
  type PieceFinish,
} from '@/appearance/settings'
import { BOARD_STYLES } from '@/appearance/boardStyles'
import type { Theme } from '@/utils/theme'
import type { Level } from '@/app/types'
import { Dialog, DialogHeader } from '@/app/ui/Dialog'
import { SegmentedField, SettingRow } from '@/app/ui/Segmented'
import { Tabs } from '@/app/ui/Tabs'
import { VERSION } from '@/utils/version'
import { GlyphFace, GuideMarks, OptionButton, OptionGrid, OptionPreview, PreviewCanvas, PreviewImage } from './previews.styles'
import { Slider, Text } from '@/components/ui'

type SettingsTab = 'general' | 'board' | 'pieces' | 'play' | 'about'
const FONTS = Object.keys(PIECE_FONTS) as PieceFont[]
const BOARD_STYLE_KEYS = Object.keys(BOARD_STYLES) as BoardStyle[]
const asset = (group: string, key: string) => `${import.meta.env.BASE_URL}previews/${group}/${key}.webp`

const ColorSwatch = styled('span', { base: { w: '100%', h: '100%', borderRadius: 'sm' } })

const FlipFace = styled('img', {
  base: { position: 'absolute', inset: '-18%', w: '136%', h: '136%', maxW: 'none', objectFit: 'contain', backfaceVisibility: 'hidden' },
})

const PreparedGlyph = styled('img', {
  base: {
    w: 'var(--prepared-size, 82px)',
    h: 'var(--prepared-size, 82px)',
    maxW: 'var(--prepared-max, none)',
    aspectRatio: '1',
    objectFit: 'contain',
  },
})

function SurfaceSample({ piece }: { piece: PieceAppearance }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    ref.current?.getContext('2d')?.drawImage(pieceSurface(42, piece), 0, 0)
  }, [piece])
  return <PreviewCanvas ref={ref} htmlWidth={256} htmlHeight={256} />
}

function GlyphSample({
  set,
  face: font,
  style = 'one',
  code = 'FU',
  guide = 'none',
}: {
  set: PieceSet
  face: PieceFont
  style?: 'one' | 'two'
  code?: 'FU' | 'KI'
  guide?: 'none' | 'movement' | 'dots' | 'lines'
}) {
  const { t } = useTranslation()
  const [sampleGuide] = useState(() => ['KI', 'GI', 'KE', 'KA'][Math.floor(Math.random() * 4)])
  useEffect(() => {
    if (set === 'letters' || set === 'broadcast') void loadPieceFont(font)
  }, [set, font])
  const type = code === 'KI' ? PieceType.GOLD : PieceType.PAWN
  if (guide === 'lines' || guide === 'dots') {
    const spec = PIECE_FONTS[font]
    return (
      <svg data-guide-sample width={82} height={82} viewBox="0 0 256 256" aria-label={t('settings.oneCharacterGuide')}>
        {set !== 'letters' && set !== 'broadcast' ? (
          <image href={pieceGlyphUrl(set, code)} x={0} y={0} width={256} height={118} preserveAspectRatio="xMidYMid meet" />
        ) : (
          <text x={128} y={60} dominantBaseline="central" textAnchor="middle" fill="#0e0804" fontFamily={spec.family} fontWeight={spec.weight} fontSize={100}>
            {faceText(type, Color.BLACK, 'one')}
          </text>
        )}
        <image
          href={`${import.meta.env.BASE_URL}pieces/prepared/guides/${sampleGuide}.${guide}.png?v=16`}
          x={0}
          y={138}
          width={256}
          height={118}
          preserveAspectRatio="xMidYMid meet"
        />
      </svg>
    )
  }
  const marks = guide === 'movement'
  if (set !== 'letters' && set !== 'broadcast' && guide === 'none')
    return <PreparedGlyph data-prepared src={pieceGlyphUrl(set, code)} alt={faceText(type, Color.BLACK, style)} />
  if (set !== 'letters' && set !== 'broadcast')
    return (
      <GlyphFace marks={marks} data-glyph-sample>
        <styled.img
          position={marks ? 'relative' : undefined}
          zIndex={marks ? '1' : undefined}
          w={marks ? '82px' : undefined}
          h={marks ? '82px' : undefined}
          aspectRatio={marks ? '1' : undefined}
          objectFit={marks ? 'contain' : undefined}
          data-prepared
          src={pieceGlyphUrl(set, code)}
          alt={faceText(type, Color.BLACK, style)}
        />
        {guide !== 'none' && (
          <GuideMarks src={`${import.meta.env.BASE_URL}pieces/prepared/guides/${guide === 'movement' ? code : sampleGuide}.${guide}.png?v=16`} alt="" />
        )}
      </GlyphFace>
    )
  const spec = PIECE_FONTS[font]
  return (
    <GlyphFace marks={marks} data-glyph-sample style={{ fontFamily: spec.family, fontWeight: spec.weight, fontSize: style === 'two' ? 32 : undefined }}>
      <styled.span position={marks ? 'relative' : undefined} zIndex={marks ? '1' : undefined}>
        {faceText(type, Color.BLACK, style)}
      </styled.span>
      {guide !== 'none' && (
        <GuideMarks src={`${import.meta.env.BASE_URL}pieces/prepared/guides/${guide === 'movement' ? code : sampleGuide}.${guide}.png?v=16`} alt="" />
      )}
    </GlyphFace>
  )
}

const SAMPLE_TYPES = [PieceType.KING, PieceType.ROOK, PieceType.BISHOP, PieceType.GOLD, PieceType.SILVER, PieceType.PAWN, PieceType.KNIGHT, PieceType.LANCE]
type PreviewFace = PieceType | 'GY'
const setPreviewCache = new Map<string, Map<PreviewFace, string>>()

function StickyPiecePreview() {
  const { t } = useTranslation()
  const st = useSettings()
  const [images, setImages] = useState<Map<PreviewFace, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const key = `appearance-v17|${st.pieceSet}|${st.pieceFont}|${st.pieceStyle}|${st.pieceGuide}|${st.pieceMaterial}|${st.pieceColor}|${st.pieceGrain}|${st.pieceFinish}`
  useEffect(() => {
    const cached = setPreviewCache.get(key)
    setError(undefined)
    if (cached) {
      setImages(cached)
      setLoading(false)
      return
    }
    const controller = new AbortController()
    const types = [...new Set(SAMPLE_TYPES.flatMap((type) => [type, promotedPieceType(type)]))]
    setLoading(true)
    void Promise.all([loadPieceSet(st.pieceSet, st.pieceGuide), loadPieceFont(st.pieceFont)])
      .then(() =>
        bakePreviews(
          [
            { key: 'set', ...st },
            { key: 'king-back', ...st, color: Color.WHITE, types: [PieceType.KING] },
          ],
          controller.signal,
          types,
        ),
      )
      .then((previews) => {
        if (!controller.signal.aborted) {
          const images = new Map<PreviewFace, string>(types.map((type, i) => [type, previews.get('set')![i]]))
          images.set('GY', previews.get('king-back')![0])
          setPreviewCache.set(key, images)
          if (setPreviewCache.size > 8) setPreviewCache.delete(setPreviewCache.keys().next().value!)
          setImages(images)
          setLoading(false)
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setError(String(error))
          setLoading(false)
        }
      })
    return () => controller.abort()
  }, [key, st.pieceSet, st.pieceFont, st.pieceStyle, st.pieceGuide, st.pieceMaterial, st.pieceColor, st.pieceGrain, st.pieceFinish])
  const [flipped, setFlipped] = useState<PieceType[]>([])
  const flip = (type: PieceType, on: boolean) =>
    setFlipped((prev) => (on ? (prev.includes(type) ? prev : [...prev, type]) : prev.filter((item) => item !== type)))
  return (
    <styled.div
      position="sticky"
      top="calc(-1 * {spacing.2})"
      zIndex="2"
      display="grid"
      gridTemplateColumns="repeat(8, minmax(0, 1fr))"
      gridTemplateRows="auto"
      alignItems="center"
      gap="1"
      p="2"
      bg="panel"
      borderBottom="1px solid {colors.border}"
      css={{ '&:has(> span:only-child)': { minH: '110px', placeItems: 'center' } }}
      aria-label={t('settings.pieceSetPreview')}
      aria-busy={loading}
    >
      {images.size > 0 &&
        SAMPLE_TYPES.map((type) => {
          const promoted: PreviewFace = type === PieceType.KING ? 'GY' : promotedPieceType(type)
          const canFlip = promoted !== type
          const on = flipped.includes(type)
          return (
            <styled.button
              key={type}
              type="button"
              flex="1 0 76px"
              w="100%"
              maxW="110px"
              h="auto"
              minW="0"
              aspectRatio="0.85"
              border="0"
              p="0"
              bg="transparent"
              perspective="500px"
              cursor="pointer"
              _disabled={{ opacity: '1', cursor: 'default' }}
              disabled={!canFlip}
              aria-label={faceText(type, Color.BLACK, st.pieceStyle)}
              aria-pressed={canFlip ? on : undefined}
              onMouseEnter={() => canFlip && flip(type, true)}
              onMouseLeave={() => flip(type, false)}
              onFocus={() => canFlip && flip(type, true)}
              onBlur={() => flip(type, false)}
              onClick={() => flip(type, !on)}
            >
              <styled.span
                position="relative"
                display="block"
                w="100%"
                h="100%"
                transformStyle="preserve-3d"
                transition="transform 0.35s ease"
                css={{ '&[data-on]': { transform: 'rotateX(180deg)' } }}
                data-on={on || undefined}
              >
                {images.has(type) && <FlipFace src={images.get(type)} alt="" />}
                {canFlip && images.has(promoted) && <FlipFace data-back transform="rotateX(180deg)" src={images.get(promoted)} alt="" />}
              </styled.span>
            </styled.button>
          )
        })}
      {(loading || error) && (
        <styled.span gridColumn="1 / -1" fontSize="xs" color="fg.muted" css={{ '&:only-child': { p: '3' } }} role="status">
          {error ?? t('settings.renderingPreview')}
        </styled.span>
      )}
    </styled.div>
  )
}

function OptionGroup({
  label,
  options,
  value,
  onChange,
  finish = false,
}: {
  label: string
  options: { key: string; label: string; preview?: React.ReactNode }[]
  value: string
  onChange: (key: string) => void
  finish?: boolean
}) {
  const { t } = useTranslation()
  const kind = finish
    ? 'finish'
    : label === t('settings.typeface')
      ? 'typeface'
      : label === t('settings.type') || label === t('settings.guideStyle')
        ? 'type'
        : 'plain'
  return (
    <section>
      <Text tone="muted" size="sm" mt="3" mx="0" mb="2">
        {label}
      </Text>
      <OptionGrid kind={kind}>
        {options.map((option) => (
          <OptionButton type="button" key={option.key} kind={kind} aria-pressed={value === option.key} onClick={() => onChange(option.key)}>
            {option.preview && <OptionPreview kind={kind}>{option.preview}</OptionPreview>}
            <span>{option.label}</span>
          </OptionButton>
        ))}
      </OptionGrid>
    </section>
  )
}

function FinishSection({ finish }: { finish: PieceFinish }) {
  const { t } = useTranslation()
  const spec = PIECE_FINISHES[finish]
  const surface = 25
  const profile = Array.from({ length: 41 }, (_, i) => {
    const x = 40 + i
    const distance = 1 - Math.abs(i - 20) / 20
    const height =
      finish === 'oshi'
        ? 5
        : finish === 'kaki'
          ? 10
          : finish === 'moriage'
            ? 16
            : finish === 'fukabori'
              ? -20
              : finish === 'hori' || finish === 'molded'
                ? -14
                : 0
    return `${x},${surface - finishProfile(finish, distance) * height}`
  }).join(' ')
  const filled = finish === 'horiume' || finish === 'moriage'
  return (
    <styled.svg flex="none" w="100%" h="50px" viewBox="0 0 120 60" role="img" aria-label={t('settings.finishCrossSection', { finish: spec.label })}>
      <rect width="120" height="60" fill="#f7f1df" />
      <path d="M4 25H116V56H4Z" fill="#ebc574" />
      {filled && <path d="M40 25H80L60 44Z" fill="#15110d" />}
      {finish === 'insatsu' || finish === 'horiume' ? (
        <path d="M40 25H80" stroke="#15110d" strokeWidth={finish === 'insatsu' ? 1 : 2} />
      ) : spec.relief < 0 ? (
        <>
          <polygon points={`40,25 ${profile} 80,25`} fill="#f7f1df" />
          <polyline points={profile} fill="none" stroke="#080604" strokeWidth="2" />
        </>
      ) : (
        <polygon points={`40,25 ${profile} 80,25`} fill="#15110d" />
      )}
    </styled.svg>
  )
}

const finishPreviewCache = new Map<string, Map<string, string[]>>()

function FinishOptions() {
  const { t } = useTranslation()
  const st = useSettings()
  const key = `finish-coating-v9|${pieceFinishOptions(st.pieceMaterial).join()}|${st.pieceSet}|${st.pieceFont}|${st.pieceStyle}|${st.pieceGuide}|${st.pieceMaterial}|${st.pieceColor}|${st.pieceGrain}`
  const [ready, setReady] = useState<{ key: string; images: Map<string, string[]> }>()
  const [error, setError] = useState<string>()
  const images = finishPreviewCache.get(key) ?? (ready?.key === key ? ready.images : undefined)
  useEffect(() => {
    setError(undefined)
    if (finishPreviewCache.has(key)) return
    const controller = new AbortController()
    const appearance = {
      pieceSet: st.pieceSet,
      pieceFont: st.pieceFont,
      pieceStyle: st.pieceStyle,
      pieceGuide: st.pieceGuide,
      pieceMaterial: st.pieceMaterial,
      pieceColor: st.pieceColor,
      pieceGrain: st.pieceGrain,
    }
    void Promise.all([loadPieceSet(st.pieceSet, st.pieceGuide), loadPieceFont(st.pieceFont)])
      .then(() =>
        bakePreviews(
          pieceFinishOptions(st.pieceMaterial).map((pieceFinish) => ({ key: `finish:${pieceFinish}`, ...appearance, pieceFinish })),
          controller.signal,
          [PieceType.KING],
        ),
      )
      .then((images) => {
        if (!controller.signal.aborted) {
          finishPreviewCache.set(key, images)
          if (finishPreviewCache.size > 8) finishPreviewCache.delete(finishPreviewCache.keys().next().value!)
          setReady({ key, images })
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setError(String(error))
      })
    return () => controller.abort()
  }, [key, st.pieceSet, st.pieceFont, st.pieceStyle, st.pieceGuide, st.pieceMaterial, st.pieceColor, st.pieceGrain])
  if (!images)
    return (
      <section data-finish-options aria-busy={!error}>
        <Text tone="muted" size="sm" my="1em">
          {t('settings.finish')}
        </Text>
        <Text tone="muted" size="sm" my="1em" role="status">
          {error ?? t('settings.renderingFinishPreviews')}
        </Text>
      </section>
    )
  return (
    <div data-finish-options>
      <OptionGroup
        finish
        label={t('settings.finish')}
        options={pieceFinishOptions(st.pieceMaterial).map((key) => ({
          key,
          label: PIECE_FINISHES[key].label,
          preview: (
            <>
              <styled.span display="grid" placeItems="center" w="100%" h="140px" overflow="hidden">
                {images ? (
                  <styled.img w="100%" h="140px" objectFit="cover" src={images.get(`finish:${key}`)?.[0]} alt="" />
                ) : (
                  <span role="status">{error ?? t('settings.renderingPreview')}</span>
                )}
              </styled.span>
              <FinishSection finish={key} />
              <styled.span fontSize="xs" color="fg.muted">
                {PIECE_FINISHES[key].coating === 'lacquer' ? t('settings.lacquer') : t('settings.paint')}
              </styled.span>
            </>
          ),
        }))}
        value={selectedPieceFinish()}
        onChange={(key) => setSettings({ pieceFinish: key as typeof st.pieceFinish })}
      />
    </div>
  )
}

function DesignOptions({ customFace = false }: { customFace?: boolean } = {}) {
  const { t } = useTranslation()
  const st = useSettings()
  const currentFamily = pieceFamily(st.pieceSet)
  const lettering = currentFamily === 'letters'
  const pair = PIECE_FACE_PAIRS[currentFamily]
  const paired = !!pair
  const twoOnly = currentFamily === 'orangain'
  const faces = twoOnly ? 'two' : pair ? (pair[1] === st.pieceSet ? 'two' : 'one') : lettering ? st.pieceStyle : 'one'
  const changeFace = (key: string) => {
    const pieceStyle = key === 'two' ? 'two' : 'one'
    const pieceGuide = key === 'movement' || key === 'dots' || key === 'lines' ? key : 'none'
    setSettings({ pieceStyle, pieceGuide, pieceSet: pieceSetForFace(currentFamily, pieceStyle) })
  }
  const changeFamily = (pieceSet: PieceSet) => {
    const pieceStyle = pieceSet === 'orangain' ? 'two' : pieceSet === 'letters' || PIECE_FACE_PAIRS[pieceSet] ? faces : 'one'
    setSettings({ pieceSet: pieceSetForFace(pieceSet, pieceStyle), pieceStyle, pieceGuide: pieceSet === 'orangain' ? 'none' : st.pieceGuide })
  }
  const presets: { key: string; label: string; patch: PieceAppearance }[] = [
    {
      key: 'classic',
      label: t('settings.presetClassic'),
      patch: {
        pieceSet: 'letters',
        pieceFont: 'mincho',
        pieceStyle: 'two',
        pieceGuide: 'none',
        pieceMaterial: 'satsuma',
        pieceColor: 'natural',
        pieceGrain: 'masame',
        pieceFinish: 'hori',
      },
    },
    {
      key: 'elegant',
      label: t('settings.presetElegant'),
      patch: {
        pieceSet: 'ryoko_1kanji',
        pieceFont: 'kaisho',
        pieceStyle: 'one',
        pieceGuide: 'none',
        pieceMaterial: 'mikura',
        pieceColor: 'natural',
        pieceGrain: 'itame',
        pieceFinish: 'moriage',
      },
    },
    {
      key: 'plastic',
      label: t('settings.presetPlastic'),
      patch: {
        pieceSet: 'sunfish_hitomoji',
        pieceFont: 'mincho',
        pieceStyle: 'one',
        pieceGuide: 'none',
        pieceMaterial: 'plastic',
        pieceColor: 'light',
        pieceGrain: 'masame',
        pieceFinish: 'oshi',
      },
    },
    {
      key: 'broadcast',
      label: t('settings.presetBroadcast'),
      patch: {
        pieceSet: 'broadcast',
        pieceFont: 'kaisho',
        pieceStyle: 'one',
        pieceGuide: 'none',
        pieceMaterial: 'plastic',
        pieceColor: 'light',
        pieceGrain: 'masame',
        pieceFinish: 'oshi',
      },
    },
  ]
  return (
    <>
      {!customFace && (
        <>
          <StickyPiecePreview />
          <OptionGroup
            label={t('settings.preset')}
            options={presets.map((preset) => ({
              ...preset,
              preview: <GlyphSample set={preset.patch.pieceSet!} face={preset.patch.pieceFont ?? st.pieceFont} style={preset.patch.pieceStyle} code="KI" />,
            }))}
            value={presets.find((preset) => Object.entries(preset.patch).every(([key, value]) => st[key as keyof typeof st] === value))?.key ?? ''}
            onChange={(key) => setSettings(presets.find((preset) => preset.key === key)!.patch)}
          />
          <OptionGroup
            label={t('settings.typeface')}
            options={PIECE_TYPEFACES.map((key) => ({
              key,
              label:
                key === 'sunfish_hitomoji'
                  ? 'Sunfish'
                  : key === 'kaishoa_one'
                    ? t('settings.kaishoA')
                    : key === 'kanji_brown'
                      ? 'Ka-hu'
                      : key === 'shogi_bnw'
                        ? 'Shogi'
                        : key === '1kanji_3d'
                          ? t('settings.lishogiKanji')
                          : key === 'simple_kanji'
                            ? t('settings.simpleKanji')
                            : key === 'hitomoji'
                              ? t('settings.hitomoji')
                              : key === 'pixel'
                                ? t('settings.pixel')
                                : PIECE_SETS[key].label,
              preview: <GlyphSample set={key} face={st.pieceFont} />,
            }))}
            value={currentFamily}
            onChange={(key) => changeFamily(key as PieceSet)}
          />
        </>
      )}
      {(lettering || customFace) && (
        <OptionGroup
          label={t('settings.font')}
          options={FONTS.map((key) => ({ key, label: PIECE_FONTS[key].label, preview: <GlyphSample set="letters" face={key} /> }))}
          value={st.pieceFont}
          onChange={(key) => setSettings({ pieceFont: key as PieceFont })}
        />
      )}
      {!customFace && (
        <>
          <OptionGroup
            label={t('settings.type')}
            options={(twoOnly ? ['two'] : ['one', ...(lettering || paired ? ['two'] : []), 'guide']).map((key) => ({
              key,
              label: key === 'guide' ? t('settings.oneCharacterGuide') : t(key === 'one' ? 'settings.oneCharacter' : 'settings.twoCharacters'),
              preview: (
                <GlyphSample
                  set={paired ? pieceSetForFace(currentFamily, key === 'two' ? 'two' : 'one') : st.pieceSet}
                  face={st.pieceFont}
                  style={key === 'two' ? 'two' : 'one'}
                  guide={key === 'guide' ? (st.pieceGuide === 'none' ? 'lines' : st.pieceGuide) : 'none'}
                />
              ),
            }))}
            value={st.pieceGuide === 'none' ? faces : 'guide'}
            onChange={(key) => changeFace(key === 'guide' ? (st.pieceGuide === 'none' ? 'lines' : st.pieceGuide) : key)}
          />

          {st.pieceGuide !== 'none' && (
            <OptionGroup
              label={t('settings.guideStyle')}
              options={(['lines', 'dots', 'movement'] as const).map((key) => ({
                key,
                label: t(key === 'dots' ? 'settings.guideDots' : key === 'movement' ? 'settings.guideMarks' : 'settings.guideLines'),
                preview: <PreparedGlyph data-prepared src={`${import.meta.env.BASE_URL}pieces/prepared/guides/KI.${key}.png?v=16`} alt="" />,
              }))}
              value={st.pieceGuide}
              onChange={(key) => setSettings({ pieceGuide: key as typeof st.pieceGuide })}
            />
          )}
        </>
      )}
      <OptionGroup
        label={t('settings.color')}
        options={Object.entries(PIECE_COLORS).map(([key, spec]) => ({
          key,
          label: spec.label,
          preview: <ColorSwatch style={{ background: `rgb(${(spec.tone ?? PIECE_MATERIALS[st.pieceMaterial].tone).join(',')})` }} />,
        }))}
        value={st.pieceColor}
        onChange={(key) => setSettings({ pieceColor: key as typeof st.pieceColor })}
      />
      <OptionGroup
        label={t('settings.material')}
        options={Object.entries(PIECE_MATERIALS).map(([key, spec]) => ({
          key,
          label: spec.label,
          preview: (
            <ColorSwatch
              style={{
                background:
                  key === 'glass'
                    ? `linear-gradient(135deg, rgba(${spec.tone.join(',')},0.35), rgba(255,255,255,0.85) 48%, rgba(${spec.tone.join(',')},0.2) 52%, rgba(${spec.tone.join(',')},0.5))`
                    : `rgb(${spec.tone.join(',')})`,
                boxShadow: key === 'glass' ? 'inset 0 0 0 1px rgba(255,255,255,0.7)' : undefined,
              }}
            />
          ),
        }))}
        value={st.pieceMaterial}
        onChange={(key) => {
          const pieceMaterial = key as PieceMaterial
          setSettings({ pieceMaterial, pieceFinish: pieceFinishOptions(pieceMaterial).includes(st.pieceFinish) ? st.pieceFinish : 'oshi' })
        }}
      />
      {!['plastic', 'glass', 'frostedGlass'].includes(st.pieceMaterial) && (
        <OptionGroup
          label={t('settings.grain')}
          options={Object.entries(PIECE_GRAINS).map(([key, spec]) => ({
            key,
            label: spec.label,
            preview: <SurfaceSample piece={{ pieceSet: 'letters', pieceMaterial: st.pieceMaterial, pieceColor: 'natural', pieceGrain: key as PieceGrain }} />,
          }))}
          value={st.pieceGrain}
          onChange={(key) => setSettings({ pieceGrain: key as PieceGrain })}
        />
      )}
      <FinishOptions />

      <Text tone="muted" size="2xs" mt="0" mb="2">
        {PIECE_FINISHES[selectedPieceFinish()].hint}
      </Text>
      {!customFace && PIECE_SETS[st.pieceSet].credit && (
        <Text tone="muted" size="2xs" mt="0" mb="2">
          {PIECE_SETS[st.pieceSet].credit}
        </Text>
      )}
    </>
  )
}

function BoardOptions() {
  const { t } = useTranslation()
  const st = useSettings()
  return (
    <OptionGroup
      label={t('settings.boardWood')}
      options={BOARD_STYLE_KEYS.map((key) => ({
        key,
        label: BOARD_STYLES[key].label,
        preview: <PreviewImage src={asset('boards', key)} alt="" />,
      }))}
      value={st.boardStyle}
      onChange={(key) => setSettings({ boardStyle: key as BoardStyle })}
    />
  )
}

export function SettingsDialog({
  onClose,
  level,
  onLevel,
  availableTabs,
  customFace = false,
}: {
  onClose: () => void
  level?: Level
  onLevel?: (l: Level) => void
  availableTabs?: SettingsTab[]
  customFace?: boolean
}) {
  const { t } = useTranslation()
  const st = useSettings()
  const [tab, setTab] = useState<SettingsTab>('general')
  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'general', label: t('settings.general') },
    { id: 'board', label: t('settings.board') },
    { id: 'pieces', label: t('settings.pieces') },
    { id: 'play', label: t('settings.playAi') },
    { id: 'about', label: t('settings.about') },
  ]
  return (
    <Dialog
      label={t('settings.settings')}
      className="app-settings"
      display="flex"
      flexDirection="column"
      w="min(720px, 100%)"
      maxH="min(620px, 100%)"
      p="0"
      overflow="hidden"
      _tight={{ maxH: '100%' }}
      css={{ '&:has([data-finish-options])': { w: 'min(1080px, 100%)' } }}
      positionerClassName={css({ alignItems: 'flex-start', pt: 'max({spacing.4}, 8vh)' })}
      onBackdrop={onClose}
    >
      <DialogHeader
        title={t('settings.settings')}
        closeLabel={t('settings.closeSettings')}
        closeTitle={t('settings.closeEsc')}
        pt="3"
        pr="3"
        pb="1"
        pl="5"
        onClose={onClose}
      />
      <Tabs items={availableTabs ? tabs.filter(({ id }) => availableTabs.includes(id)) : tabs} value={tab} onChange={setTab} flex="none" px="4" />
      <Box flex="1" minH="0" overflowY="auto" pt="2" px="5" pb="5">
        {tab === 'general' && (
          <>
            <SegmentedField<Lang>
              label={t('settings.language')}
              value={st.lang}
              options={[
                { v: 'en', t: 'English' },
                { v: 'ja', t: '日本語' },
              ]}
              onChange={(v) => setSettings({ lang: v })}
            />
            <SegmentedField<Theme>
              label={t('settings.appearance')}
              value={st.theme}
              options={[
                { v: 'system', t: t('settings.themeSystem') },
                { v: 'light', t: t('settings.themeLight') },
                { v: 'dark', t: t('settings.themeDark') },
              ]}
              onChange={(v) => setSettings({ theme: v })}
            />
            {level && onLevel && (
              <SegmentedField<Level>
                label={t('settings.shogiKnowledge')}
                value={level}
                options={[
                  { v: 'rules', t: t('settings.iKnowTheRules') },
                  { v: 'new', t: t('settings.newToShogi') },
                ]}
                onChange={onLevel}
              />
            )}
            <SegmentedField
              label={t('settings.soundEffects')}
              value={st.sound}
              options={[
                { v: true, t: t('settings.on') },
                { v: false, t: t('settings.off') },
              ]}
              onChange={(v) => setSettings({ sound: v })}
            />
            <SettingRow label={t('settings.volume')}>
              <Slider.Root
                w="min(220px, 100%)"
                justifySelf="end"
                _phone={{ w: '100%', justifySelf: 'stretch' }}
                min={0}
                max={1}
                step={0.05}
                disabled={!st.sound}
                value={[st.volume]}
                aria-label={[t('settings.volume')]}
                onValueChange={({ value }) => setSettings({ volume: value[0] })}
                onValueChangeEnd={() => playSound('move')}
              >
                <Slider.Control>
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumbs />
                </Slider.Control>
              </Slider.Root>
            </SettingRow>
            {!customFace && (
              <>
                <SegmentedField
                  label={t('settings.voice')}
                  value={st.voice}
                  options={[
                    { v: true, t: t('settings.on') },
                    { v: false, t: t('settings.off') },
                  ]}
                  onChange={(v) => {
                    setSettings({ voice: v })
                    if (v) say('四間飛車', true)
                  }}
                />
                {st.voice && (
                  <Text tone="muted" size="2xs" mt="0" mb="2">
                    {t('settings.voiceCredit')}
                  </Text>
                )}{' '}
              </>
            )}
          </>
        )}
        {tab === 'about' && (
          <section>
            <styled.h3 display="flex" flexWrap="wrap" alignItems="baseline" gap="2">
              Shogi Gym 将棋ジム{' '}
              <Text as="span" tone="muted" fontSize="0.85em">
                v{VERSION}
              </Text>
            </styled.h3>
            <Text tone="muted" size="sm" my="1em">
              {t('settings.aboutDescription')}
            </Text>
            <Wrap gap="3" align="center">
              <a href="https://github.com/hamproductions/shogigym" target="_blank" rel="noreferrer">
                {t('settings.repository')}
              </a>
              <a href="https://github.com/hamproductions/shogigym/blob/main/CHANGELOG.md" target="_blank" rel="noreferrer">
                {t('settings.changelog')}
              </a>
              <a href="https://github.com/hamproductions/shogigym#sources-and-licenses" target="_blank" rel="noreferrer">
                {t('settings.credits')}
              </a>
            </Wrap>
          </section>
        )}
        {tab === 'board' && (
          <>
            <SegmentedField<Environment>
              label={t('settings.setting')}
              value={st.environment}
              options={[
                { v: 'traditional', t: t('settings.traditional') },
                { v: 'casual', t: t('settings.casual') },
                { v: 'battlefield', t: st.lang === 'ja' ? '合戦場' : 'Battlefield' },
                { v: 'flat', t: t('settings.2d') },
                { v: 'diagram', t: t('settings.diagram') },
                { v: 'broadcast', t: t('settings.broadcast') },
              ]}
              onChange={(v) => setSettings({ environment: v })}
            />
            <SegmentedField
              label={t('settings.boardCoordinates')}
              value={st.coords}
              options={[
                { v: true, t: t('settings.showWiderMargin') },
                { v: false, t: t('settings.hide') },
              ]}
              onChange={(v) => setSettings({ coords: v })}
            />
            <SegmentedField
              label={t('settings.showTesuji')}
              value={st.showTesuji}
              options={[
                { v: true, t: t('settings.on') },
                { v: false, t: t('settings.off') },
              ]}
              onChange={(v) => setSettings({ showTesuji: v })}
            />
            <Text tone="muted" size="2xs" mt="0" mb="2">
              {t('settings.showTesujiHint')}
            </Text>
            <BoardOptions />
            {(st.environment === 'traditional' || st.environment === 'casual') && (
              <SegmentedField
                label={t('settings.characters')}
                value={st.characters}
                options={[
                  { v: true, t: t('settings.on') },
                  { v: false, t: t('settings.off') },
                ]}
                onChange={(v) => setSettings({ characters: v })}
              />
            )}
            {(st.environment === 'traditional' || st.environment === 'casual') && st.characters && (
              <Text tone="muted" size="2xs" mt="0" mb="2">
                {t('settings.charactersCredit')}
              </Text>
            )}
            {st.environment !== 'flat' && st.environment !== 'diagram' && st.environment !== 'broadcast' && (
              <SegmentedField
                label={t('settings.powerMode')}
                value={st.power}
                options={[
                  { v: true, t: t('settings.on') },
                  { v: false, t: t('settings.off') },
                ]}
                onChange={(v) => setSettings({ power: v })}
              />
            )}
            {st.environment !== 'flat' && st.environment !== 'diagram' && st.environment !== 'broadcast' && st.power && (
              <Text tone="muted" size="2xs" mt="0" mb="2">
                {t('settings.powerModeHint')}
              </Text>
            )}
          </>
        )}
        {tab === 'pieces' && (
          <>
            <DesignOptions customFace={customFace} />
          </>
        )}
        {tab === 'play' && (
          <>
            <SegmentedField
              label={t('settings.thinkingTime')}
              value={st.thinkMs}
              options={[
                { v: 500, t: t('settings.fast') },
                { v: 1500, t: t('settings.normal') },
                { v: 4000, t: t('settings.deep') },
              ]}
              onChange={(v) => setSettings({ thinkMs: v })}
            />
            <SegmentedField
              label={t('settings.candidateMovesShown')}
              value={st.candidates}
              options={[
                { v: 1, t: '1' },
                { v: 2, t: '2' },
                { v: 3, t: '3' },
                { v: 5, t: '5' },
              ]}
              onChange={(v) => setSettings({ candidates: v })}
            />
            <EngineSettings />
          </>
        )}
      </Box>
    </Dialog>
  )
}
