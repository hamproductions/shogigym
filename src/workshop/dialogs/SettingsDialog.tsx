import { useState } from 'react'
import { Color, PieceType, promotedPieceType } from 'tsshogi'
import { faceText } from '../koma'
import { useBakedPieces } from '../hooks/useBakedPieces'
import { spriteKey } from '../board3d/bake'
import { useTranslation } from 'react-i18next'
import { say } from '../lib/voice'
import { EngineSettings } from '../EngineSettings'
import { PIECE_SETS, type PieceSet } from '../pieceSets'
import { PIECE_FINISHES, PIECE_FONTS, PIECE_MATERIALS, PIECE_GRAINS, pieceFinishOptions, selectedPieceFinish, playSound, setSettings, useSettings, type BoardStyle, type Environment, type Lang, type PieceFinish, type PieceMaterial, type PieceGrain, type PieceFont, type PieceStyle } from '../settings'
import type { Theme } from '../theme'
import type { Level } from '../types'
import { Dialog, DialogHeader } from '../ui/Dialog'
import { SegmentedField, SettingRow } from '../ui/Segmented'
import { Tabs } from '../ui/Tabs'

type SettingsTab = 'general' | 'board' | 'pieces' | 'play'

const SAMPLE_TYPES = [PieceType.KING, PieceType.ROOK, PieceType.BISHOP, PieceType.GOLD, PieceType.SILVER, PieceType.PAWN, PieceType.KNIGHT, PieceType.LANCE]

function PieceSample() {
  const { t } = useTranslation()
  const { baked, loading, error } = useBakedPieces()
  const [flipped, setFlipped] = useState<PieceType[]>([])
  return (
    <div className="ws-piece-sample" aria-label={t('settings.preview')} aria-busy={loading}>
      {baked ? SAMPLE_TYPES.map((type) => {
        const promoted = promotedPieceType(type)
        const canFlip = promoted !== type
        const on = flipped.includes(type)
        return (
          <button key={type} type="button" className="ws-sample-tile" disabled={!canFlip} aria-label={faceText(type, Color.BLACK, 'one')} aria-pressed={canFlip ? on : undefined} onMouseEnter={() => canFlip && setFlipped((prev) => prev.includes(type) ? prev : [...prev, type])} onMouseLeave={() => setFlipped((prev) => prev.filter((item) => item !== type))} onFocus={() => canFlip && setFlipped((prev) => prev.includes(type) ? prev : [...prev, type])} onBlur={() => setFlipped((prev) => prev.filter((item) => item !== type))}>
            <span className={`ws-sample-flip${on ? ' on' : ''}`}>
              <img src={baked.pieces.get(spriteKey(type, Color.BLACK, true))} alt="" />
              {canFlip && <img className="back" src={baked.pieces.get(spriteKey(promoted, Color.BLACK, true))} alt="" />}
            </span>
          </button>
        )
      }) : <span role="status">{error ?? t('settings.loadingEvalFile')}</span>}
    </div>
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
  ]
  return (
    <Dialog label={t('settings.settings')} className="ws-settings" onBackdrop={onClose}>
      <DialogHeader title={t('settings.settings')} closeLabel={t('settings.closeSettings')} closeTitle={t('settings.closeEsc')} onClose={onClose} />
      <Tabs items={tabs} value={tab} onChange={setTab} />
      <div className="ws-settings-body">
        {tab === 'general' && (
          <>
            <SegmentedField<Lang> label="Language / 言語" value={st.lang} options={[{ v: 'en', t: 'English' }, { v: 'ja', t: '日本語' }]} onChange={(v) => setSettings({ lang: v })} />
            <SegmentedField<Theme> label={t('settings.appearance')} value={st.theme} options={[{ v: 'system', t: t('settings.themeSystem') }, { v: 'light', t: t('settings.themeLight') }, { v: 'dark', t: t('settings.themeDark') }]} onChange={(v) => setSettings({ theme: v })} />
            <SegmentedField<Level> label={t('settings.shogiKnowledge')} value={level} options={[{ v: 'rules', t: t('settings.iKnowTheRules') }, { v: 'new', t: t('settings.newToShogi') }]} onChange={onLevel} />
            <SegmentedField label={t('settings.soundEffects')} value={st.sound} options={[{ v: true, t: t('settings.on') }, { v: false, t: t('settings.off') }]} onChange={(v) => setSettings({ sound: v })} />
            <SettingRow label={t('settings.volume')}>
              <input type="range" min={0} max={1} step={0.05} disabled={!st.sound} value={st.volume} aria-label={t('settings.volume')} onChange={(e) => setSettings({ volume: Number(e.target.value) })} onMouseUp={() => playSound('move')} />
            </SettingRow>
            <SegmentedField label={t('settings.voice')} value={st.voice} options={[{ v: true, t: t('settings.on') }, { v: false, t: t('settings.off') }]} onChange={(v) => {
              setSettings({ voice: v })
              if (v) say('四間飛車', true)
            }} />
            {st.voice && <p className="ws-muted ws-credit">{t('settings.voiceCredit')}</p>}
          </>
        )}
        {tab === 'board' && (
          <>
            <SegmentedField<Environment> label={t('settings.setting')} value={st.environment} options={[{ v: 'traditional', t: t('settings.traditional') }, { v: 'casual', t: t('settings.casual') }, { v: 'flat', t: t('settings.2d') }, { v: 'diagram', t: t('settings.diagram') }, { v: 'broadcast', t: t('settings.broadcast') }]} onChange={(v) => setSettings({ environment: v })} />
            <SegmentedField label={t('settings.boardCoordinates')} value={st.coords} options={[{ v: true, t: t('settings.showWiderMargin') }, { v: false, t: t('settings.hide') }]} onChange={(v) => setSettings({ coords: v })} />
            <SegmentedField<BoardStyle> label={t('settings.boardWood')} value={st.boardStyle} options={[{ v: 'kaya', t: t('settings.kaya') }, { v: 'shin-kaya', t: t('settings.light') }, { v: 'dark', t: t('settings.dark') }]} onChange={(v) => setSettings({ boardStyle: v })} />
            {(st.environment === 'traditional' || st.environment === 'casual') && <SegmentedField label={t('settings.characters')} value={st.characters} options={[{ v: true, t: t('settings.on') }, { v: false, t: t('settings.off') }]} onChange={(v) => setSettings({ characters: v })} />}
            {(st.environment === 'traditional' || st.environment === 'casual') && st.characters && <p className="ws-muted ws-credit">{t('settings.charactersCredit')}</p>}
            {st.environment !== 'flat' && st.environment !== 'diagram' && st.environment !== 'broadcast' && <SegmentedField label={t('settings.powerMode')} value={st.power} options={[{ v: true, t: t('settings.on') }, { v: false, t: t('settings.off') }]} onChange={(v) => setSettings({ power: v })} />}
            {st.environment !== 'flat' && st.environment !== 'diagram' && st.environment !== 'broadcast' && st.power && <p className="ws-muted ws-credit">{t('settings.powerModeHint')}</p>}
          </>
        )}
        {tab === 'pieces' && (
          <>
            <SegmentedField<PieceSet> label={t('settings.pieceSet')} value={st.pieceSet} options={(Object.keys(PIECE_SETS) as PieceSet[]).map((v) => ({ v, t: PIECE_SETS[v].label }))} onChange={(v) => setSettings(v === 'broadcast' ? { pieceSet: v, pieceMaterial: 'plastic', pieceFont: 'kaisho', pieceStyle: 'one', pieceFinish: 'insatsu' } : { pieceSet: v })} />
            <PieceSample />
            <SegmentedField<PieceMaterial> label={st.lang === 'ja' ? '駒材' : 'Material'} value={st.pieceMaterial} options={(Object.keys(PIECE_MATERIALS) as PieceMaterial[]).map((v) => ({ v, t: PIECE_MATERIALS[v].label }))} onChange={(v) => setSettings({ pieceMaterial: v, pieceFinish: pieceFinishOptions(v).includes(st.pieceFinish) ? st.pieceFinish : pieceFinishOptions(v)[0] })} />
            {st.pieceMaterial !== 'plastic' && <SegmentedField<PieceGrain> label={st.lang === 'ja' ? '木目' : 'Wood grain'} value={st.pieceGrain} options={(Object.keys(PIECE_GRAINS) as PieceGrain[]).map((v) => ({ v, t: PIECE_GRAINS[v].label }))} onChange={(v) => setSettings({ pieceGrain: v })} />}
            <SegmentedField<PieceFinish> label={t('settings.pieceFinish')} value={selectedPieceFinish()} options={pieceFinishOptions(st.pieceMaterial).map((v) => ({ v, t: PIECE_FINISHES[v].label }))} onChange={(v) => setSettings({ pieceFinish: v })} />
            <p className="ws-muted ws-credit">{PIECE_FINISHES[selectedPieceFinish()].hint}</p>
            {PIECE_SETS[st.pieceSet].credit && <p className="ws-muted ws-credit">{PIECE_SETS[st.pieceSet].credit}</p>}
            {(st.pieceSet === 'letters' || st.pieceSet === 'broadcast') && <SegmentedField<PieceFont> label={t('settings.pieceLettering')} value={st.pieceFont} options={(Object.keys(PIECE_FONTS) as PieceFont[]).map((v) => ({ v, t: PIECE_FONTS[v].label }))} onChange={(v) => setSettings({ pieceFont: v })} />}
            {(st.pieceSet === 'letters' || st.pieceSet === 'broadcast') && <SegmentedField<PieceStyle> label={t('settings.pieceFaces')} value={st.pieceStyle} options={[{ v: 'two', t: t('settings.twoCharacters') }, { v: 'one', t: t('settings.oneCharacter') }]} onChange={(v) => setSettings({ pieceStyle: v })} />}
          </>
        )}
        {tab === 'play' && (
          <>
            <SegmentedField label={t('settings.thinkingTime')} value={st.thinkMs} options={[{ v: 500, t: t('settings.fast') }, { v: 1500, t: t('settings.normal') }, { v: 4000, t: t('settings.deep') }]} onChange={(v) => setSettings({ thinkMs: v })} />
            <SegmentedField label={t('settings.candidateMovesShown')} value={st.candidates} options={[{ v: 1, t: '1' }, { v: 2, t: '2' }, { v: 3, t: '3' }, { v: 5, t: '5' }]} onChange={(v) => setSettings({ candidates: v })} />
            <EngineSettings />
          </>
        )}
      </div>
    </Dialog>
  )
}
