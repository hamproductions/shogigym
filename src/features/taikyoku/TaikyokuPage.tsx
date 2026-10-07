import '@/styles/controls.css'
import './taikyoku.css'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/app/ui/Button'
import { Segmented } from '@/app/ui/Segmented'
import { cx } from '@/app/ui/cx'
import { useSettings } from '@/appearance/settings'
import { TaikyokuBoard, keyOf, type BoardHandle, type TargetKind } from './TaikyokuBoard'
import { TaikyokuBoard3D } from './TaikyokuBoard3D'
import { catalog, cellAt, same, squareName, type EngineMove, type Pos } from './notation'
import { PLY_LIMIT, useTaikyoku, type LogEntry, type MoveEvent, type Strength } from './useTaikyoku'

// The single documented modern game: Japanese TV, 2004.
const RECORD = { plies: 3805, seconds: 32 * 3600 + 41 * 60 }

function webglSupported() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return !!gl
  } catch {
    return false
  }
}

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]

const duration = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`
}

export function TaikyokuPage({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation()
  const { lang } = useSettings()
  const board = useRef<BoardHandle>(null)
  const [log, setLog] = useState<LogEntry[]>([])
  const [selected, setSelected] = useState<Pos | null>(null)
  const [inspected, setInspected] = useState<Pos | null>(null)
  const [view, setView] = useState<'3d' | 'map'>(() => (webglSupported() ? '3d' : 'map'))
  const [setup, setSetup] = useState<{ done: number; total: number } | null>(null)
  const [choice, setChoice] = useState<{ to: Pos; options: EngineMove[] } | null>(null)

  const pieceName = useCallback(
    (key: string) => {
      const info = catalog[key]
      return info ? (lang === 'ja' ? info.k || key : info.n) : key
    },
    [lang],
  )

  const onEvent = useCallback(
    (entry: Omit<LogEntry, 'text'>) => {
      const e: MoveEvent = entry.event
      const lines = t(`taikyoku.say.${e.kind}`, { returnObjects: true }) as string[]
      const vars: Record<string, string> = {
        piece: 'piece' in e ? pieceName(e.piece) : '',
        n: 'n' in e ? String(e.n) : '',
        own: 'own' in e ? String(e.own) : '',
        ply: 'ply' in e ? String(e.ply) : String(entry.ply),
        who: t(entry.side === 'b' ? 'taikyoku.sente' : 'taikyoku.gote'),
      }
      const pool = (Array.isArray(lines) ? lines : [String(lines)]).filter((l) => !(l.includes('{own}') && e.kind === 'capture' && e.own === 0))
      const text = pick(pool).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '')
      setLog((old) => (entry.ply === 0 ? [{ ...entry, text }] : [{ ...entry, text }, ...old].slice(0, 40)))
    },
    [t, pieceName],
  )

  const { game, thinking, score, auto, setAuto, strength, setStrength, winner, error, play, undo, reset } = useTaikyoku(onEvent)

  const humanTurn = !!game && !winner && !auto && !thinking && game.snap.turn === 'b'

  // legal moves of the selected piece, grouped by the square the player taps
  const byTarget = useMemo(() => {
    const map = new Map<string, EngineMove[]>()
    if (!game || !selected || !humanTurn) return map
    for (const m of game.legal) {
      if (!same(m.from, selected)) continue
      const stays = same(m.from, m.to)
      if (stays && !(m.mid && cellAt(game.snap.grid, m.mid))) continue // jitto: the pass button
      const at = stays && m.mid ? m.mid : m.to
      const key = keyOf(at)
      map.set(key, [...(map.get(key) ?? []), m])
    }
    return map
  }, [game, selected, humanTurn])

  const jitto = useMemo(
    () =>
      game && selected && humanTurn
        ? game.legal.find((m) => same(m.from, selected) && same(m.to, selected) && !(m.mid && cellAt(game.snap.grid, m.mid)))
        : undefined,
    [game, selected, humanTurn],
  )

  const targets = useMemo(() => {
    const map = new Map<string, TargetKind>()
    if (!game) return map
    byTarget.forEach((_, key) => {
      const [file, rank] = key.split(',').map(Number)
      map.set(key, cellAt(game.snap.grid, { file, rank }) ? 'capture' : 'step')
    })
    choice?.options.forEach((m) => {
      if (m.mid && !same(m.mid, choice.to)) map.set(keyOf(m.mid), 'via')
    })
    return map
  }, [game, byTarget, choice])

  const commit = useCallback(
    (move: EngineMove) => {
      setSelected(null)
      setInspected(null)
      setChoice(null)
      play(move)
    },
    [play],
  )

  const onCell = useCallback(
    (pos: Pos) => {
      if (!game) return
      const piece = cellAt(game.snap.grid, pos)
      if (humanTurn && selected) {
        const options = byTarget.get(keyOf(pos))
        if (options?.length === 1) return commit(options[0])
        if (options) return setChoice({ to: pos, options })
      }
      setChoice(null)
      if (humanTurn && piece?.side === 'b' && game.legal.some((m) => same(m.from, pos))) {
        setSelected(same(pos, selected ?? { file: 0, rank: 0 }) ? null : pos)
        setInspected(null)
        return
      }
      setSelected(null)
      setInspected(piece ? pos : null)
    },
    [game, humanTurn, selected, byTarget, commit],
  )

  const focusPos = selected ?? inspected
  const focusCell = game && focusPos ? cellAt(game.snap.grid, focusPos) : null
  const info = focusCell ? catalog[focusCell.key] : null
  const promoted = info?.p ? catalog[info.p] : null

  const optionLabel = (m: EngineMove) => {
    const base = same(m.from, m.to) ? t('taikyoku.opt.igui') : m.mid ? t('taikyoku.opt.via', { square: squareName(m.mid) }) : t('taikyoku.opt.move')
    return m.promote ? `${base} · ${t('taikyoku.opt.promote')}` : base
  }

  const status = (() => {
    if (error) return t('taikyoku.status.error')
    if (!game) return t('taikyoku.status.loading')
    if (winner) return t('taikyoku.status.won', { who: t(winner === 'b' ? 'taikyoku.sente' : 'taikyoku.gote') })
    if (game.moves.length >= PLY_LIMIT) return t('taikyoku.status.limit')
    if (thinking) return t('taikyoku.status.thinking')
    if (auto) return t('taikyoku.status.auto')
    return t('taikyoku.status.yourMove')
  })()

  const cp = score?.cp ?? 0
  const plies = game?.moves.length ?? 0
  const pace = RECORD.seconds / RECORD.plies

  return (
    <div className="app-shell tk-shell">
      <header className="tk-top">
        <Button variant="icon" onClick={onBack} aria-label={t('taikyoku.back')}>
          ←
        </Button>
        <h1>
          <span className="tk-title-ja">大局将棋</span>
          <span className="tk-title-en">Taikyoku shogi</span>
        </h1>
        <span className="tk-badge">36 × 36</span>
      </header>

      <div className="tk-body">
        <section className="tk-stage" aria-label={t('taikyoku.board')}>
          {game && view === '3d' && (
            <TaikyokuBoard3D
              ref={board}
              snap={game.snap}
              selected={selected}
              inspected={inspected}
              targets={targets}
              last={game.last}
              onCell={onCell}
              onProgress={(done, total) => setSetup(done >= total ? null : { done, total })}
            />
          )}
          {game && view === 'map' && (
            <TaikyokuBoard
              ref={board}
              snap={game.snap}
              selected={selected}
              inspected={inspected}
              targets={targets}
              last={game.last}
              lang={lang === 'ja' ? 'ja' : 'en'}
              onCell={onCell}
            />
          )}
          {setup && view === '3d' && (
            <div className="tk-setup" role="status">
              {t('taikyoku.setup', { done: setup.done, total: setup.total })}
            </div>
          )}
          {!game && !error && <div className="tk-loading">{t('taikyoku.status.loading')}</div>}
          <div className="tk-zoom">
            <Button
              variant="icon"
              on={view === '3d'}
              onClick={() => setView(view === '3d' ? 'map' : '3d')}
              title={t('taikyoku.zoom.view')}
              aria-label={t('taikyoku.zoom.view')}
            >
              {view === '3d' ? '3D' : '2D'}
            </Button>
            <Button variant="icon" onClick={() => board.current?.fit()} title={t('taikyoku.zoom.fit')} aria-label={t('taikyoku.zoom.fit')}>
              ⤢
            </Button>
            <Button
              variant="icon"
              onClick={() => board.current?.focus({ file: 18, rank: 6 }, 22)}
              title={t('taikyoku.zoom.mine')}
              aria-label={t('taikyoku.zoom.mine')}
            >
              ☗
            </Button>
            <Button
              variant="icon"
              disabled={!game?.last}
              onClick={() => game?.last && board.current?.focus(game.last.to, 44)}
              title={t('taikyoku.zoom.last')}
              aria-label={t('taikyoku.zoom.last')}
            >
              ◎
            </Button>
          </div>
          {choice && (
            <div className="tk-choice" role="group" aria-label={t('taikyoku.opt.title')}>
              <span>{t('taikyoku.opt.title')}</span>
              {choice.options.map((m) => (
                <Button key={m.text} onClick={() => commit(m)}>
                  {optionLabel(m)}
                </Button>
              ))}
              <Button variant="ghost" onClick={() => setChoice(null)}>
                {t('taikyoku.opt.cancel')}
              </Button>
            </div>
          )}
        </section>

        <aside className="tk-side">
          <div className={cx('tk-status', thinking && 'busy', winner && 'over')} role="status">
            <strong>{status}</strong>
            {game && (
              <span className="tk-muted">
                {t('taikyoku.legal', { n: game.legal.length })} · {t('taikyoku.ply', { n: plies })}
              </span>
            )}
          </div>

          {game && (
            <div className="tk-armies" aria-label={t('taikyoku.armies')}>
              <span>
                ☗ {t('taikyoku.sente')} <b>{game.snap.counts.b}</b>
              </span>
              <span className="tk-bar" aria-hidden>
                <i style={{ width: `${(game.snap.counts.b / Math.max(1, game.snap.counts.b + game.snap.counts.w)) * 100}%` }} />
              </span>
              <span>
                <b>{game.snap.counts.w}</b> {t('taikyoku.gote')} ☖
              </span>
            </div>
          )}

          <div className="tk-card tk-piece">
            {info && focusCell ? (
              <>
                <div className={cx('tk-tile', focusCell.side === 'w' && 'flip', focusCell.key.startsWith('+') && 'promoted')} aria-hidden>
                  <span>{(focusCell.side === 'w' && info.k2) || info.k || focusCell.key.replace('+', '')}</span>
                </div>
                <div>
                  <b>{lang === 'ja' ? info.k || info.n : info.n}</b>
                  <div className="tk-muted">
                    {lang === 'ja' ? info.n : info.k} · {squareName(focusPos!)} · {t(focusCell.side === 'b' ? 'taikyoku.sente' : 'taikyoku.gote')}
                  </div>
                  <div className="tk-muted">
                    {promoted ? t('taikyoku.promotesTo', { piece: lang === 'ja' ? promoted.k || promoted.n : promoted.n }) : t('taikyoku.noPromotion')}
                    {info.r ? ` · ${t('taikyoku.royal')}` : ''}
                  </div>
                </div>
              </>
            ) : (
              <span className="tk-muted">{t('taikyoku.hint')}</span>
            )}
            {jitto && (
              <Button onClick={() => commit(jitto)} title={t('taikyoku.jittoHint')}>
                {t('taikyoku.jitto')}
              </Button>
            )}
          </div>

          <div className="tk-controls">
            <Button variant="primary" onClick={reset}>
              {t('taikyoku.new')}
            </Button>
            <Button onClick={undo} disabled={!plies || auto}>
              {t('taikyoku.undo')}
            </Button>
            <Button on={auto} onClick={() => setAuto(!auto)} disabled={!!winner || !game}>
              {auto ? t('taikyoku.auto.stop') : t('taikyoku.auto.start')}
            </Button>
          </div>
          <div className="tk-setting">
            <span>{t('taikyoku.strength.label')}</span>
            <Segmented<Strength>
              value={strength}
              onChange={setStrength}
              label={t('taikyoku.strength.label')}
              options={[
                { v: 'nap', t: t('taikyoku.strength.nap') },
                { v: 'normal', t: t('taikyoku.strength.normal') },
                { v: 'deep', t: t('taikyoku.strength.deep') },
              ]}
            />
          </div>

          <div className="tk-card tk-marathon">
            <div className="tk-row">
              <b>{t('taikyoku.marathon.title')}</b>
              <span className="tk-muted">
                {plies.toLocaleString()} / {RECORD.plies.toLocaleString()}
              </span>
            </div>
            <progress max={RECORD.plies} value={Math.min(plies, RECORD.plies)} aria-label={t('taikyoku.marathon.title')} />
            <p className="tk-muted">{t('taikyoku.marathon.clock', { time: duration(plies * pace) })}</p>
            {score && <p className="tk-muted">{t('taikyoku.eval', { cp: `${cp > 0 ? '+' : ''}${cp}`, depth: score.depth })}</p>}
          </div>

          <ol className="tk-log" aria-live="polite" aria-label={t('taikyoku.commentary')}>
            {log.map((entry) => (
              <li key={entry.id}>
                {entry.ply > 0 && <span className="tk-ply">{entry.ply}</span>}
                {entry.text}
              </li>
            ))}
          </ol>

          <details className="tk-card tk-facts">
            <summary>{t('taikyoku.facts.title')}</summary>
            <ul>
              {(t('taikyoku.facts.items', { returnObjects: true }) as string[]).map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </details>
        </aside>
      </div>
    </div>
  )
}
