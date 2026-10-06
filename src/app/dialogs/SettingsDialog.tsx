import './settings.css'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { say } from '@/utils/voice'
import { EngineSettings } from '@/app/EngineSettings'
import { playSound, setSettings, useSettings, type Environment, type Lang } from '@/appearance/settings'
import type { Theme } from '@/utils/theme'
import type { Level } from '@/app/types'
import { Dialog, DialogHeader } from '@/app/ui/Dialog'
import { SegmentedField, SettingRow } from '@/app/ui/Segmented'
import { Tabs } from '@/app/ui/Tabs'
import { VERSION } from '@/utils/version'
import { BoardOptions, DesignOptions } from './PieceDesign'

type SettingsTab = 'general' | 'board' | 'pieces' | 'play' | 'about'

function GeneralTab({ level, onLevel }: { level: Level; onLevel: (l: Level) => void }) {
  const { t } = useTranslation()
  const st = useSettings()
  return (
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
  )
}

function AboutTab() {
  const { t } = useTranslation()
  return (
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
  )
}

function BoardTab() {
  const { t } = useTranslation()
  const st = useSettings()
  const hasCharacters = st.environment === 'traditional' || st.environment === 'casual'
  const hasPower = st.environment !== 'flat' && st.environment !== 'diagram' && st.environment !== 'broadcast'
  return (
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
      {hasCharacters && (
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
      {hasCharacters && st.characters && <p className="app-muted app-credit">{t('settings.charactersCredit')}</p>}
      {hasPower && (
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
      {hasPower && st.power && <p className="app-muted app-credit">{t('settings.powerModeHint')}</p>}
    </>
  )
}

function PlayTab() {
  const { t } = useTranslation()
  const st = useSettings()
  return (
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
  )
}

export function SettingsDialog({ onClose, level, onLevel }: { onClose: () => void; level: Level; onLevel: (l: Level) => void }) {
  const { t } = useTranslation()
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
        {tab === 'general' && <GeneralTab level={level} onLevel={onLevel} />}
        {tab === 'about' && <AboutTab />}
        {tab === 'board' && <BoardTab />}
        {tab === 'pieces' && <DesignOptions />}
        {tab === 'play' && <PlayTab />}
      </div>
    </Dialog>
  )
}
