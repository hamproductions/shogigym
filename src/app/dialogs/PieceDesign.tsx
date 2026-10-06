import '@/appearance/previews.css'
import type { TFunction } from 'i18next'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Color, PieceType, promotedPieceType } from 'tsshogi'
import { faceText } from '@/rendering/koma'
import { bakePreviews } from '@/rendering/board3d/bake'
import { finishProfile } from '@/rendering/board3d/relief'
import { pieceSurface } from '@/rendering/board3d/textures'
import { useTranslation } from 'react-i18next'
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
  setSettings,
  useSettings,
  type BoardStyle,
  type PieceMaterial,
  type PieceGrain,
  type PieceFont,
  type PieceAppearance,
  type PieceFinish,
  type Settings,
} from '@/appearance/settings'
import { BOARD_STYLES } from '@/appearance/boardStyles'

const FONTS = Object.keys(PIECE_FONTS) as PieceFont[]
const BOARD_STYLE_KEYS = Object.keys(BOARD_STYLES) as BoardStyle[]
const asset = (group: string, key: string) => `${import.meta.env.BASE_URL}previews/${group}/${key}.webp`
const guideImage = (name: string, guide: string) => `${import.meta.env.BASE_URL}pieces/prepared/guides/${name}.${guide}.png?v=16`

type Guide = 'none' | 'movement' | 'dots' | 'lines'
const GUIDE_CLASS: Record<Guide, string> = { none: '', movement: ' with-marks', dots: ' with-guide', lines: ' with-guide' }
const isLettering = (set: PieceSet) => set === 'letters' || set === 'broadcast'

function SurfaceSample({ appearance }: { appearance: PieceAppearance }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    ref.current?.getContext('2d')?.drawImage(pieceSurface(42, appearance), 0, 0)
  }, [appearance])
  return <canvas ref={ref} width={256} height={256} className="app-surface-sample" />
}

function GuideImage({ guide, code, sampleGuide }: { guide: Guide; code: string; sampleGuide: string }) {
  if (guide === 'none') return null
  return <img src={guideImage(guide === 'movement' ? code : sampleGuide, guide)} alt="" />
}

function GuideSvg({ set, font, code, guide, sampleGuide }: { set: PieceSet; font: PieceFont; code: 'FU' | 'KI'; guide: Guide; sampleGuide: string }) {
  const { t } = useTranslation()
  const spec = PIECE_FONTS[font]
  const type = code === 'KI' ? PieceType.GOLD : PieceType.PAWN
  return (
    <svg className="app-guide-sample" width={82} height={82} viewBox="0 0 256 256" aria-label={t('settings.oneCharacterGuide')}>
      {isLettering(set) ? (
        <text x={128} y={60} dominantBaseline="central" textAnchor="middle" fill="#0e0804" fontFamily={spec.family} fontWeight={spec.weight} fontSize={100}>
          {faceText(type, Color.BLACK, 'one')}
        </text>
      ) : (
        <image href={pieceGlyphUrl(set, code)} x={0} y={0} width={256} height={118} preserveAspectRatio="xMidYMid meet" />
      )}
      <image href={guideImage(sampleGuide, guide)} x={0} y={138} width={256} height={118} preserveAspectRatio="xMidYMid meet" />
    </svg>
  )
}

function GlyphSample({
  set,
  font,
  style = 'one',
  code = 'FU',
  guide = 'none',
}: {
  set: PieceSet
  font: PieceFont
  style?: 'one' | 'two'
  code?: 'FU' | 'KI'
  guide?: Guide
}) {
  const [sampleGuide] = useState(() => ['KI', 'GI', 'KE', 'KA'][Math.floor(Math.random() * 4)])
  const lettering = isLettering(set)
  useEffect(() => {
    if (lettering) void loadPieceFont(font)
  }, [lettering, font])
  if (guide === 'lines' || guide === 'dots') return <GuideSvg set={set} font={font} code={code} guide={guide} sampleGuide={sampleGuide} />
  const type = code === 'KI' ? PieceType.GOLD : PieceType.PAWN
  const className = `app-glyph-sample${GUIDE_CLASS[guide]}`
  if (!lettering)
    return (
      <span className={className}>
        <img className="app-prepared-glyph" src={pieceGlyphUrl(set, code)} alt={faceText(type, Color.BLACK, style)} />
        <GuideImage guide={guide} code={code} sampleGuide={sampleGuide} />
      </span>
    )
  const spec = PIECE_FONTS[font]
  return (
    <span className={className} style={{ fontFamily: spec.family, fontWeight: spec.weight, fontSize: style === 'two' ? 32 : undefined }}>
      <span>{faceText(type, Color.BLACK, style)}</span>
      <GuideImage guide={guide} code={code} sampleGuide={sampleGuide} />
    </span>
  )
}

const SAMPLE_TYPES = [PieceType.KING, PieceType.ROOK, PieceType.BISHOP, PieceType.GOLD, PieceType.SILVER, PieceType.PAWN, PieceType.KNIGHT, PieceType.LANCE]
type PreviewFace = PieceType | 'GY'
const EMPTY_IMAGES = new Map<PreviewFace, string>()
const setPreviewCache = new Map<string, Map<PreviewFace, string>>()

function usePieceSetImages() {
  const { pieceSet, pieceFont, pieceStyle, pieceGuide, pieceMaterial, pieceColor, pieceGrain, pieceFinish } = useSettings()
  const key = `appearance-v17|${pieceSet}|${pieceFont}|${pieceStyle}|${pieceGuide}|${pieceMaterial}|${pieceColor}|${pieceGrain}|${pieceFinish}`
  const [ready, setReady] = useState<{ key: string; images: Map<PreviewFace, string> }>()
  const [failure, setFailure] = useState<{ key: string; message: string }>()
  useEffect(() => {
    if (setPreviewCache.has(key)) return
    const controller = new AbortController()
    const appearance = { pieceSet, pieceFont, pieceStyle, pieceGuide, pieceMaterial, pieceColor, pieceGrain, pieceFinish }
    const types = [...new Set(SAMPLE_TYPES.flatMap((type) => [type, promotedPieceType(type)]))]
    void Promise.all([loadPieceSet(pieceSet, pieceGuide), loadPieceFont(pieceFont)])
      .then(() =>
        bakePreviews(
          [
            { key: 'set', ...appearance },
            { key: 'king-back', ...appearance, color: Color.WHITE, types: [PieceType.KING] },
          ],
          controller.signal,
          types,
        ),
      )
      .then((previews) => {
        if (controller.signal.aborted) return
        const baked = new Map<PreviewFace, string>(types.map((type, i) => [type, previews.get('set')![i]]))
        baked.set('GY', previews.get('king-back')![0])
        setPreviewCache.set(key, baked)
        if (setPreviewCache.size > 8) setPreviewCache.delete(setPreviewCache.keys().next().value!)
        setReady({ key, images: baked })
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setFailure({ key, message: String(error) })
      })
    return () => {
      controller.abort()
      setFailure(undefined)
    }
  }, [key, pieceSet, pieceFont, pieceStyle, pieceGuide, pieceMaterial, pieceColor, pieceGrain, pieceFinish])
  const cached = setPreviewCache.get(key)
  const error = failure?.key === key ? failure.message : undefined
  return { images: cached ?? ready?.images ?? EMPTY_IMAGES, error, loading: !cached && ready?.key !== key && !error }
}

function withFlip(flipped: PieceType[], type: PieceType, on: boolean) {
  if (!on) return flipped.filter((item) => item !== type)
  return flipped.includes(type) ? flipped : [...flipped, type]
}

function StickyPiecePreview() {
  const { t } = useTranslation()
  const { pieceStyle } = useSettings()
  const { images, loading, error } = usePieceSetImages()
  const [flipped, setFlipped] = useState<PieceType[]>([])
  const flip = (type: PieceType, on: boolean) => setFlipped((prev) => withFlip(prev, type, on))
  return (
    <div className="app-sticky-piece-preview app-full-set-preview" aria-label={t('settings.pieceSetPreview')} aria-busy={loading}>
      {images.size > 0 &&
        SAMPLE_TYPES.map((type) => {
          const promoted: PreviewFace = type === PieceType.KING ? 'GY' : promotedPieceType(type)
          const canFlip = promoted !== type
          const on = flipped.includes(type)
          return (
            <button
              key={type}
              type="button"
              className="app-sample-tile"
              disabled={!canFlip}
              aria-label={faceText(type, Color.BLACK, pieceStyle)}
              aria-pressed={canFlip ? on : undefined}
              onMouseEnter={() => canFlip && flip(type, true)}
              onMouseLeave={() => flip(type, false)}
              onFocus={() => canFlip && flip(type, true)}
              onBlur={() => flip(type, false)}
              onClick={() => flip(type, !on)}
            >
              <span className={`app-sample-flip${on ? ' on' : ''}`}>
                {images.has(type) && <img src={images.get(type)} alt="" />}
                {canFlip && images.has(promoted) && <img className="back" src={images.get(promoted)} alt="" />}
              </span>
            </button>
          )
        })}
      {(loading || error) && <output className="app-preview-status">{error ?? t('settings.renderingPreview')}</output>}
    </div>
  )
}

function groupClass(label: string, t: TFunction) {
  if (label === t('settings.typeface')) return ' app-typeface-options'
  if (label === t('settings.type') || label === t('settings.guideStyle')) return ' app-type-options'
  return ''
}

function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { key: string; label: string; preview?: ReactNode }[]
  value: string
  onChange: (key: string) => void
}) {
  const { t } = useTranslation()
  return (
    <section className={`app-option-group${groupClass(label, t)}`}>
      <p className="app-muted">{label}</p>
      <div className="app-design-options">
        {options.map((option) => (
          <button type="button" key={option.key} aria-pressed={value === option.key} onClick={() => onChange(option.key)}>
            {option.preview && <span className="app-option-preview">{option.preview}</span>}
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

const FINISH_HEIGHT: Partial<Record<PieceFinish, number>> = { oshi: 5, kaki: 10, moriage: 16, fukabori: -20, hori: -14, molded: -14 }

function FinishShape({ finish, relief, profile }: { finish: PieceFinish; relief: number; profile: string }) {
  if (finish === 'insatsu' || finish === 'horiume') return <path d="M40 25H80" stroke="#15110d" strokeWidth={finish === 'insatsu' ? 1 : 2} />
  if (relief < 0)
    return (
      <>
        <polygon points={`40,25 ${profile} 80,25`} fill="#f7f1df" />
        <polyline points={profile} fill="none" stroke="#080604" strokeWidth="2" />
      </>
    )
  return <polygon points={`40,25 ${profile} 80,25`} fill="#15110d" />
}

function FinishSection({ finish }: { finish: PieceFinish }) {
  const { t } = useTranslation()
  const spec = PIECE_FINISHES[finish]
  const surface = 25
  const height = FINISH_HEIGHT[finish] ?? 0
  const profile = Array.from({ length: 41 }, (_, i) => {
    const x = 40 + i
    const distance = 1 - Math.abs(i - 20) / 20
    return `${x},${surface - finishProfile(finish, distance) * height}`
  }).join(' ')
  const filled = finish === 'horiume' || finish === 'moriage'
  return (
    <svg className="app-finish-section" viewBox="0 0 120 60" aria-label={t('settings.finishCrossSection', { finish: spec.label })}>
      <rect width="120" height="60" fill="#f7f1df" />
      <path d="M4 25H116V56H4Z" fill="#ebc574" />
      {filled && <path d="M40 25H80L60 44Z" fill="#15110d" />}
      <FinishShape finish={finish} relief={spec.relief} profile={profile} />
    </svg>
  )
}

const finishPreviewCache = new Map<string, Map<string, string[]>>()

function finishRequest(appearance: PieceAppearance, pieceFinish: PieceFinish) {
  return { key: `finish:${pieceFinish}`, ...appearance, pieceFinish }
}

function useFinishImages() {
  const { pieceSet, pieceFont, pieceStyle, pieceGuide, pieceMaterial, pieceColor, pieceGrain } = useSettings()
  const key = `finish-coating-v9|${pieceFinishOptions(pieceMaterial).join(',')}|${pieceSet}|${pieceFont}|${pieceStyle}|${pieceGuide}|${pieceMaterial}|${pieceColor}|${pieceGrain}`
  const [ready, setReady] = useState<{ key: string; images: Map<string, string[]> }>()
  const [failure, setFailure] = useState<{ key: string; message: string }>()
  useEffect(() => {
    if (finishPreviewCache.has(key)) return
    const controller = new AbortController()
    const appearance = { pieceSet, pieceFont, pieceStyle, pieceGuide, pieceMaterial, pieceColor, pieceGrain }
    void Promise.all([loadPieceSet(pieceSet, pieceGuide), loadPieceFont(pieceFont)])
      .then(() =>
        bakePreviews(
          pieceFinishOptions(pieceMaterial).map((pieceFinish) => finishRequest(appearance, pieceFinish)),
          controller.signal,
          [PieceType.KING],
        ),
      )
      .then((baked) => {
        if (controller.signal.aborted) return
        finishPreviewCache.set(key, baked)
        if (finishPreviewCache.size > 8) finishPreviewCache.delete(finishPreviewCache.keys().next().value!)
        setReady({ key, images: baked })
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setFailure({ key, message: String(error) })
      })
    return () => {
      controller.abort()
      setFailure(undefined)
    }
  }, [key, pieceSet, pieceFont, pieceStyle, pieceGuide, pieceMaterial, pieceColor, pieceGrain])
  return { images: finishPreviewCache.get(key) ?? (ready?.key === key ? ready.images : undefined), error: failure?.key === key ? failure.message : undefined }
}

function FinishOptions() {
  const { t } = useTranslation()
  const { pieceMaterial } = useSettings()
  const { images, error } = useFinishImages()
  if (!images)
    return (
      <section className="app-finish-options" aria-busy={!error}>
        <p className="app-muted">{t('settings.finish')}</p>
        <p className="app-muted">
          <output>{error ?? t('settings.renderingFinishPreviews')}</output>
        </p>
      </section>
    )
  return (
    <div className="app-finish-options">
      <OptionGroup
        label={t('settings.finish')}
        options={pieceFinishOptions(pieceMaterial).map((finish) => ({
          key: finish,
          label: PIECE_FINISHES[finish].label,
          preview: (
            <>
              <span className="app-finish-render">
                <img src={images.get(`finish:${finish}`)?.[0]} alt="" />
              </span>
              <FinishSection finish={finish} />
              <span className="app-finish-coating">{PIECE_FINISHES[finish].coating === 'lacquer' ? t('settings.lacquer') : t('settings.paint')}</span>
            </>
          ),
        }))}
        value={selectedPieceFinish()}
        onChange={(finish) => setSettings({ pieceFinish: finish as PieceFinish })}
      />
    </div>
  )
}

type Style = 'one' | 'two'

function currentFaces(set: PieceSet, style: Style): Style {
  const family = pieceFamily(set)
  if (family === 'orangain') return 'two'
  const pair = PIECE_FACE_PAIRS[family]
  if (pair) return pair[1] === set ? 'two' : 'one'
  return family === 'letters' ? style : 'one'
}

function styleForFamily(set: PieceSet, faces: Style): Style {
  if (set === 'orangain') return 'two'
  return set === 'letters' || PIECE_FACE_PAIRS[set] ? faces : 'one'
}

function buildPresets(t: TFunction): { key: string; label: string; patch: PieceAppearance }[] {
  return [
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
}

const TYPEFACE_NAMES: Partial<Record<PieceSet, string>> = { sunfish_hitomoji: 'Sunfish', kanji_brown: 'Ka-hu', shogi_bnw: 'Shogi' }
const TYPEFACE_KEYS: Partial<Record<PieceSet, string>> = {
  kaishoa_one: 'settings.kaishoA',
  '1kanji_3d': 'settings.lishogiKanji',
  simple_kanji: 'settings.simpleKanji',
  hitomoji: 'settings.hitomoji',
  pixel: 'settings.pixel',
}

function typefaceLabel(key: PieceSet, t: TFunction) {
  const name = TYPEFACE_NAMES[key]
  if (name) return name
  const translation = TYPEFACE_KEYS[key]
  return translation ? t(translation) : PIECE_SETS[key].label
}

const GUIDE_STYLE_KEYS = { lines: 'settings.guideLines', dots: 'settings.guideDots', movement: 'settings.guideMarks' } as const

function PresetOptions() {
  const { t } = useTranslation()
  const st = useSettings()
  const presets = buildPresets(t)
  return (
    <OptionGroup
      label={t('settings.preset')}
      options={presets.map((preset) => ({
        ...preset,
        preview: <GlyphSample set={preset.patch.pieceSet!} font={preset.patch.pieceFont ?? st.pieceFont} style={preset.patch.pieceStyle} code="KI" />,
      }))}
      value={presets.find((preset) => Object.entries(preset.patch).every(([name, value]) => st[name as keyof Settings] === value))?.key ?? ''}
      onChange={(key) => {
        const preset = presets.find((item) => item.key === key)
        if (preset) setSettings(preset.patch)
      }}
    />
  )
}

function TypefaceOptions() {
  const { t } = useTranslation()
  const st = useSettings()
  const currentFamily = pieceFamily(st.pieceSet)
  const faces = currentFaces(st.pieceSet, st.pieceStyle)
  const changeFamily = (pieceSet: PieceSet) => {
    const pieceStyle = styleForFamily(pieceSet, faces)
    setSettings({ pieceSet: pieceSetForFace(pieceSet, pieceStyle), pieceStyle, pieceGuide: pieceSet === 'orangain' ? 'none' : st.pieceGuide })
  }
  return (
    <>
      <OptionGroup
        label={t('settings.typeface')}
        options={PIECE_TYPEFACES.map((key) => ({ key, label: typefaceLabel(key, t), preview: <GlyphSample set={key} font={st.pieceFont} /> }))}
        value={currentFamily}
        onChange={(key) => changeFamily(key as PieceSet)}
      />
      {currentFamily === 'letters' && (
        <OptionGroup
          label={t('settings.font')}
          options={FONTS.map((key) => ({ key, label: PIECE_FONTS[key].label, preview: <GlyphSample set="letters" font={key} /> }))}
          value={st.pieceFont}
          onChange={(key) => setSettings({ pieceFont: key as PieceFont })}
        />
      )}
    </>
  )
}

function FaceOptions() {
  const { t } = useTranslation()
  const st = useSettings()
  const currentFamily = pieceFamily(st.pieceSet)
  const paired = !!PIECE_FACE_PAIRS[currentFamily]
  const lettering = currentFamily === 'letters'
  const twoOnly = currentFamily === 'orangain'
  const faces = currentFaces(st.pieceSet, st.pieceStyle)
  const activeGuide = st.pieceGuide === 'none' ? 'lines' : st.pieceGuide
  const changeFace = (key: string) => {
    const pieceStyle = key === 'two' ? 'two' : 'one'
    const pieceGuide = key === 'movement' || key === 'dots' || key === 'lines' ? key : 'none'
    setSettings({ pieceStyle, pieceGuide, pieceSet: pieceSetForFace(currentFamily, pieceStyle) })
  }
  return (
    <>
      <OptionGroup
        label={t('settings.type')}
        options={(twoOnly ? ['two'] : ['one', ...(lettering || paired ? ['two'] : []), 'guide']).map((key) => ({
          key,
          label: key === 'guide' ? t('settings.oneCharacterGuide') : t(key === 'one' ? 'settings.oneCharacter' : 'settings.twoCharacters'),
          preview: (
            <GlyphSample
              set={paired ? pieceSetForFace(currentFamily, key === 'two' ? 'two' : 'one') : st.pieceSet}
              font={st.pieceFont}
              style={key === 'two' ? 'two' : 'one'}
              guide={key === 'guide' ? activeGuide : 'none'}
            />
          ),
        }))}
        value={st.pieceGuide === 'none' ? faces : 'guide'}
        onChange={(key) => changeFace(key === 'guide' ? activeGuide : key)}
      />

      {st.pieceGuide !== 'none' && (
        <OptionGroup
          label={t('settings.guideStyle')}
          options={(['lines', 'dots', 'movement'] as const).map((key) => ({
            key,
            label: t(GUIDE_STYLE_KEYS[key]),
            preview: <img className="app-prepared-glyph" src={guideImage('KI', key)} alt="" />,
          }))}
          value={st.pieceGuide}
          onChange={(key) => setSettings({ pieceGuide: key as typeof st.pieceGuide })}
        />
      )}
    </>
  )
}

function glassBackground(tone: string) {
  return `linear-gradient(135deg, rgba(${tone},0.35), rgba(255,255,255,0.85) 48%, rgba(${tone},0.2) 52%, rgba(${tone},0.5))`
}

function MaterialOptions() {
  const { t } = useTranslation()
  const st = useSettings()
  return (
    <>
      <OptionGroup
        label={t('settings.color')}
        options={Object.entries(PIECE_COLORS).map(([key, spec]) => ({
          key,
          label: spec.label,
          preview: <span className="app-color-swatch" style={{ background: `rgb(${(spec.tone ?? PIECE_MATERIALS[st.pieceMaterial].tone).join(',')})` }} />,
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
            <span
              className="app-color-swatch"
              style={{
                background: key === 'glass' ? glassBackground(spec.tone.join(',')) : `rgb(${spec.tone.join(',')})`,
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
            preview: (
              <SurfaceSample appearance={{ pieceSet: 'letters', pieceMaterial: st.pieceMaterial, pieceColor: 'natural', pieceGrain: key as PieceGrain }} />
            ),
          }))}
          value={st.pieceGrain}
          onChange={(key) => setSettings({ pieceGrain: key as PieceGrain })}
        />
      )}
    </>
  )
}

export function DesignOptions() {
  const st = useSettings()
  return (
    <>
      <StickyPiecePreview />
      <PresetOptions />
      <TypefaceOptions />
      <FaceOptions />
      <MaterialOptions />
      <FinishOptions />

      <p className="app-muted app-credit">{PIECE_FINISHES[selectedPieceFinish()].hint}</p>
      {PIECE_SETS[st.pieceSet].credit && <p className="app-muted app-credit">{PIECE_SETS[st.pieceSet].credit}</p>}
    </>
  )
}

export function BoardOptions() {
  const { t } = useTranslation()
  const st = useSettings()
  return (
    <OptionGroup
      label={t('settings.boardWood')}
      options={BOARD_STYLE_KEYS.map((key) => ({ key, label: BOARD_STYLES[key].label, preview: <img src={asset('boards', key)} alt="" /> }))}
      value={st.boardStyle}
      onChange={(key) => setSettings({ boardStyle: key as BoardStyle })}
    />
  )
}
