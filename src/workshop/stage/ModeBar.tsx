import { useTranslation } from 'react-i18next'
import { moveText } from '../../shogi'
import { useSession } from '../hooks/session'
import { Icon } from '../icons'
import { sideMark } from '../lib/notation'
import type { Spar } from '../modes/spar/useSpar'
import { STRENGTH, TIME_CONTROLS, setSettings, useSettings } from '../settings'
import { MODES, isGameMode, type LessonMode } from '../types'
import { Button } from '../ui/Button'
import { cx } from '../ui/cx'

type ModeBarProps = {
  title: string
  instruction: string
  lessonMode: LessonMode
  sheetUp: boolean
  panelHidden: boolean
  onPanel: (hidden: boolean) => void
  spar: Spar
  evalRate: number | null
}

function EvalChip({ rate }: { rate: number }) {
  const { t } = useTranslation()
  return (
    <span className="ws-eval-chip" title={t('workshop.winChance', { value: Math.round(rate * 100), value2: 100 - Math.round(rate * 100) })}>
      <span className="ws-eval-label">{t('workshop.winChanceShort')}</span>
      <span className="ws-eval-track">
        <span style={{ width: `${rate * 100}%` }} />
      </span>
      <b>
        {rate >= 0.5 ? '☗' : '☖'} {Math.round(Math.max(rate, 1 - rate) * 100)}%
      </b>
    </span>
  )
}

export function ModeBar({ title, instruction, lessonMode, sheetUp, panelHidden, onPanel, spar, evalRate }: ModeBarProps) {
  const { t } = useTranslation()
  const settings = useSettings()
  const ja = settings.lang === 'ja'
  const { mode, course, lastMove, prevSfen, plyBase, preview, cursor, toMove, nav, position, gameOver } = useSession()
  const seal = !ja ? <Icon name={MODES.find((m) => m.id === mode)!.icon} size={22} /> : mode === 'lesson' && course ? t(lessonMode === 'study' ? 'modes.sealStudy' : 'modes.sealQuiz') : t(`modes.${mode}.name`)
  return (
    <header className={`ws-modebar${sheetUp ? ' sheet-up' : ''} m-${mode}${mode === 'lesson' ? ` l-${lessonMode}` : ''}`}>
      <span className="ws-modebar-seal">{seal}</span>
      <span className="ws-modebar-text">
        <strong>{title}</strong>
        <span>{instruction}</span>
      </span>
      <span className="ws-lastmove">
        {lastMove && prevSfen ? (
          <>
            <span className="ws-ply">{t('workshop.move', { value: plyBase + (preview ? preview.base + preview.step : cursor) })}</span>
            <strong>{moveText(prevSfen, lastMove)}</strong>
          </>
        ) : (
          <span className="ws-ply">{plyBase > 0 ? t('workshop.afterMove', { plyBase }) : t('workshop.startPosition')}</span>
        )}
        <span className={`ws-turn ${toMove}`}>{t('workshop.toMove', { side: sideMark(toMove) })}</span>
      </span>
      {isGameMode(mode) && (
        <Button size="sm" variant="ghost" className={cx('ws-help-toggle', settings.assist && 'on')} onClick={() => setSettings({ assist: !settings.assist })} title={settings.assist ? t('workshop.helpIsOnEvalBar') : t('workshop.noHelpClickToShow')} aria-pressed={settings.assist}>
          {settings.assist ? t('workshop.coachOn') : t('workshop.coachOff')}
        </Button>
      )}
      {!panelHidden && (
        <div className="ws-mini-nav">
          <Button size="sm" className="ws-mini-wide" onClick={() => onPanel(true)} title={t('workshop.boardOnlyHideThePanel')} aria-label={t('workshop.hideThePanel')}>
            <Icon name="panel" size={16} />
            <span>{t('workshop.hidePanel')}</span>
          </Button>
        </div>
      )}
      {panelHidden && (
        <div className="ws-mini-nav">
          {mode === 'spar' && !spar.resigned && !gameOver && (
            <Button size="sm" onClick={spar.takeBack} disabled={spar.lastUserMove < 0} title={t('workshop.takeBackYourLastMove2')} aria-label={t('workshop.takeBack')}>
              {t('workshop.takeBack')}
            </Button>
          )}
          <Button size="sm" onClick={nav.back} disabled={!nav.canBack} title={t('workshop.back')} aria-label={t('workshop.back2')}>
            <Icon name="prev" size={16} />
          </Button>
          <Button size="sm" onClick={nav.forward} disabled={!nav.canForward} title={t('workshop.forward')} aria-label={t('workshop.forward2')}>
            <Icon name="next" size={16} />
          </Button>
          <Button size="sm" className="ws-mini-wide" onClick={() => onPanel(false)} title={t('workshop.showThePanelP')} aria-label={t('workshop.showThePanel')}>
            <Icon name="panel" size={16} />
            <span>{t('workshop.panel')}</span>
          </Button>
        </div>
      )}
      {mode === 'spar' && (
        <Button variant={spar.erred ? 'secondary' : 'primary'} className="ws-game-setup" onClick={() => spar.setNewGameOpen(true)} title={`${STRENGTH[settings.opponent].label} · ${TIME_CONTROLS[settings.timeControl].label}`}>
          {t('newGame.button')}
        </Button>
      )}
      {evalRate !== null && <EvalChip rate={evalRate} />}
      {position.checked && !gameOver && <span className="ws-check">{t('workshop.check')}</span>}
    </header>
  )
}
