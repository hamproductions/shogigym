import './settings.css'
import '@/appearance/previews.css'
import { useEffect, useRef, useState } from 'react'
import { Color, PieceType, promotedPieceType } from 'tsshogi'
import { faceText } from '@/rendering/koma'
import { bakePreviews } from '@/rendering/board3d/bake'
import { finishProfile } from '@/rendering/board3d/relief'
import { pieceSurface } from '@/rendering/board3d/textures'
import { useTranslation } from 'react-i18next'
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

type SettingsTab = 'general' | 'board' | 'pieces' | 'play' | 'about'
const FONTS = Object.keys(PIECE_FONTS) as PieceFont[]
const BOARD_STYLE_KEYS = Object.keys(BOARD_STYLES) as BoardStyle[]
const asset = (group: string, key: string) => `${import.meta.env.BASE_URL}previews/${group}/${key}.webp`

function SurfaceSample({ appearance }: { appearance: PieceAppearance }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    ref.current?.getContext('2d')?.drawImage(pieceSurface(42, appearance), 0, 0)
  }, [appearance])
  return <canvas ref={ref} width={256} height={256} className="app-surface-sample" />
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
      <svg className="app-guide-sample" width={82} height={82} viewBox="0 0 256 256" aria-label={t('settings.oneCharacterGuide')}>
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
  const guideClass = guide === 'none' ? '' : guide === 'movement' ? ' with-marks' : ' with-guide'
  if (set !== 'letters' && set !== 'broadcast' && guide === 'none')
    return <img className="app-prepared-glyph" src={pieceGlyphUrl(set, code)} alt={faceText(type, Color.BLACK, style)} />
  if (set !== 'letters' && set !== 'broadcast')
    return (
      <span className={`app-glyph-sample${guideClass}`}>
        <img className="app-prepared-glyph" src={pieceGlyphUrl(set, code)} alt={faceText(type, Color.BLACK, style)} />
        {guide !== 'none' && (
          <img src={`${import.meta.env.BASE_URL}pieces/prepared/guides/${guide === 'movement' ? code : sampleGuide}.${guide}.png?v=16`} alt="" />
        )}
      </span>
    )
  const spec = PIECE_FONTS[font]
  return (
    <span className={`app-glyph-sample${guideClass}`} style={{ fontFamily: spec.family, fontWeight: spec.weight, fontSize: style === 'two' ? 32 : undefined }}>
      <span>{faceText(type, Color.BLACK, style)}</span>
      {guide !== 'none' && (
        <img src={`${import.meta.env.BASE_URL}pieces/prepared/guides/${guide === 'movement' ? code : sampleGuide}.${guide}.png?v=16`} alt="" />
      )}
    </span>
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
              aria-label={faceText(type, Color.BLACK, st.pieceStyle)}
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
      {(loading || error) && (
        <span className="app-preview-status" role="status">
          {error ?? t('settings.renderingPreview')}
        </span>
      )}
    </div>
  )
}

function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { key: string; label: string; preview?: React.ReactNode }[]
  value: string
  onChange: (key: string) => void
}) {
  const { t } = useTranslation()
  return (
    <section
      className={`app-option-group${label === t('settings.typeface') ? ' app-typeface-options' : label === t('settings.type') || label === t('settings.guideStyle') ? ' app-type-options' : ''}`}
    >
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
    <svg className="app-finish-section" viewBox="0 0 120 60" role="img" aria-label={t('settings.finishCrossSection', { finish: spec.label })}>
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
    </svg>
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
      <section className="app-finish-options" aria-busy={!error}>
        <p className="app-muted">{t('settings.finish')}</p>
        <p className="app-muted" role="status">
          {error ?? t('settings.renderingFinishPreviews')}
        </p>
      </section>
    )
  return (
    <div className="app-finish-options">
      <OptionGroup
        label={t('settings.finish')}
        options={pieceFinishOptions(st.pieceMaterial).map((key) => ({
          key,
          label: PIECE_FINISHES[key].label,
          preview: (
            <>
              <span className="app-finish-render">
                {images ? <img src={images.get(`finish:${key}`)?.[0]} alt="" /> : <span role="status">{error ?? t('settings.renderingPreview')}</span>}
              </span>
              <FinishSection finish={key} />
              <span className="app-finish-coating">{PIECE_FINISHES[key].coating === 'lacquer' ? t('settings.lacquer') : t('settings.paint')}</span>
            </>
          ),
        }))}
        value={selectedPieceFinish()}
        onChange={(key) => setSettings({ pieceFinish: key as typeof st.pieceFinish })}
      />
    </div>
  )
}

function DesignOptions() {
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
      <StickyPiecePreview />
      <OptionGroup
        label={t('settings.preset')}
        options={presets.map((preset) => ({
          ...preset,
          preview: <GlyphSample set={preset.patch.pieceSet!} font={preset.patch.pieceFont ?? st.pieceFont} style={preset.patch.pieceStyle} code="KI" />,
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
          preview: <GlyphSample set={key} font={st.pieceFont} />,
        }))}
        value={currentFamily}
        onChange={(key) => changeFamily(key as PieceSet)}
      />
      {lettering && (
        <OptionGroup
          label={t('settings.font')}
          options={FONTS.map((key) => ({ key, label: PIECE_FONTS[key].label, preview: <GlyphSample set="letters" font={key} /> }))}
          value={st.pieceFont}
          onChange={(key) => setSettings({ pieceFont: key as PieceFont })}
        />
      )}
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
            preview: <img className="app-prepared-glyph" src={`${import.meta.env.BASE_URL}pieces/prepared/guides/KI.${key}.png?v=16`} alt="" />,
          }))}
          value={st.pieceGuide}
          onChange={(key) => setSettings({ pieceGuide: key as typeof st.pieceGuide })}
        />
      )}
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
            preview: (
              <SurfaceSample appearance={{ pieceSet: 'letters', pieceMaterial: st.pieceMaterial, pieceColor: 'natural', pieceGrain: key as PieceGrain }} />
            ),
          }))}
          value={st.pieceGrain}
          onChange={(key) => setSettings({ pieceGrain: key as PieceGrain })}
        />
      )}
      <FinishOptions />

      <p className="app-muted app-credit">{PIECE_FINISHES[selectedPieceFinish()].hint}</p>
      {PIECE_SETS[st.pieceSet].credit && <p className="app-muted app-credit">{PIECE_SETS[st.pieceSet].credit}</p>}
    </>
  )
}

function BoardOptions() {
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

export function SettingsDialog({ onClose, level, onLevel }: { onClose: () => void; level: Level; onLevel: (l: Level) => void }) {
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
    <Dialog label={t('settings.settings')} className="app-settings" onBackdrop={onClose}>
      <DialogHeader title={t('settings.settings')} closeLabel={t('settings.closeSettings')} closeTitle={t('settings.closeEsc')} onClose={onClose} />
      <Tabs items={tabs} value={tab} onChange={setTab} />
      <div className="app-settings-body">
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
            <SegmentedField<Level>
              label={t('settings.shogiKnowledge')}
              value={level}
              options={[
                { v: 'rules', t: t('settings.iKnowTheRules') },
                { v: 'new', t: t('settings.newToShogi') },
              ]}
              onChange={onLevel}
            />
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
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                disabled={!st.sound}
                value={st.volume}
                aria-label={t('settings.volume')}
                onChange={(e) => setSettings({ volume: Number(e.target.value) })}
                onMouseUp={() => playSound('move')}
              />
            </SettingRow>
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
            {st.voice && <p className="app-muted app-credit">{t('settings.voiceCredit')}</p>}
          </>
        )}
        {tab === 'about' && (
          <section className="app-about-section">
            <h3>
              Shogi Gym 将棋ジム <span className="app-muted">v{VERSION}</span>
            </h3>
            <p className="app-muted">{t('settings.aboutDescription')}</p>
            <div className="app-actions">
              <a href="https://github.com/hamproductions/shogigym" target="_blank" rel="noreferrer">
                {t('settings.repository')}
              </a>
              <a href="https://github.com/hamproductions/shogigym/blob/main/CHANGELOG.md" target="_blank" rel="noreferrer">
                {t('settings.changelog')}
              </a>
              <a href="https://github.com/hamproductions/shogigym#sources-and-licenses" target="_blank" rel="noreferrer">
                {t('settings.credits')}
              </a>
            </div>
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
            <p className="app-muted app-credit">{t('settings.showTesujiHint')}</p>
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
              <p className="app-muted app-credit">{t('settings.charactersCredit')}</p>
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
              <p className="app-muted app-credit">{t('settings.powerModeHint')}</p>
            )}
          </>
        )}
        {tab === 'pieces' && (
          <>
            <DesignOptions />
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
      </div>
    </Dialog>
  )
}
