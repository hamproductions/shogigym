import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { parseMoves } from 'tsshogi'
import { mainStrategies } from '../../data/strategies'
import { COURSES, type Course } from '../../model'
import { moveText, positionOf } from '../../shogi'
import { setupOf } from '../lib/book'
import { openPieceViewer } from '../lib/events'
import { getSettings, setSettings } from '../settings'
import { MODES, type Mode } from '../types'

export type Command = { id: string; label: string; hint?: string; run: () => void }

const ALIASES: Record<string, string> = {
  mino: '美濃',
  takamino: '高美濃',
  ginkan: '銀冠',
  anaguma: '穴熊',
  millennium: 'ミレニアム',
  yagura: '矢倉',
  funagakoi: '舟囲い',
  shikenbisha: '四間飛車',
  sankenbisha: '三間飛車',
  nakabisha: '中飛車',
  mukaibisha: '向かい飛車',
  ibisha: '居飛車',
  furibisha: '振り飛車',
  aifuri: '相振',
  kyusen: '急戦',
  bogin: '棒銀',
  fujii: '藤井',
  tateishi: '立石',
  ishida: '石田',
  sabaki: '捌',
  kuzushi: '崩',
  hidari: '左美濃',
  static: '居飛車',
  ranging: '振り飛車',
  castle: '囲',
}

type CommandActions = { sfen: string; setMode: (m: Mode) => void; flip: () => void; tilt: () => void; openCourse: (c: Course) => void; play: (usi: string) => void; newGame: () => void }

export function useCommands({ sfen, setMode, flip, tilt, openCourse, play, newGame }: CommandActions) {
  const { t } = useTranslation()
  return useCallback(
    (query: string): Command[] => {
      const q = query.trim().toLowerCase()
      const out: Command[] = []
      if (q) {
        const position = positionOf(sfen)
        const direct = position.createMoveByUSI(query.trim())
        const [parsed] = direct && position.isValidMove(direct) ? [[direct]] : parseMoves(position, query.trim())
        const move = parsed?.[0]
        if (move && position.isValidMove(move)) out.push({ id: `play-${move.usi}`, label: t('palette.play', { move: moveText(sfen, move.usi) }), run: () => play(move.usi) })
      }
      const base: Command[] = [
        ...MODES.map((m) => ({ id: `mode-${m.id}`, label: t('palette.modeCommand', { name: t(`modes.${m.id}.name`) }), hint: t(`modes.${m.id}.hint`), run: () => setMode(m.id) })),
        { id: 'flip', label: t('palette.flipTheBoard'), hint: 'F', run: flip },
        { id: 'viewer', label: t('palette.pieceViewerDebug'), run: openPieceViewer },
        { id: 'tilt', label: t('palette.tiltTheBoard'), hint: 'T', run: tilt },
        { id: 'new', label: t('palette.newGameFromTheStart'), run: newGame },
        ...mainStrategies().map((s) => ({ id: `main-${s.id}`, label: `${t('strategy.switchMain')}: ${s.ja}`, hint: s.en, run: () => (setSettings({ mainStrategy: s.id }), setMode('lesson')) })),
        ...COURSES.map((c) => ({ id: `course-${c.id}`, label: c.title, hint: setupOf(c, getSettings().mainStrategy)?.ja, run: () => openCourse(c) })),
      ]
      const terms = [q, ...Object.entries(ALIASES).filter(([en]) => q.length >= 3 && en.startsWith(q)).map(([, ja]) => ja)]
      return [...out, ...base.filter((c) => !q || terms.some((term) => `${c.label} ${c.hint ?? ''}`.toLowerCase().includes(term)))].slice(0, 12)
    },
    [sfen, setMode, flip, tilt, openCourse, play, newGame, t],
  )
}
