import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Color } from 'tsshogi'
import { formationName, formationOf } from '../../formation'
import { hasLegalMove, positionOf } from '../../shogi'
import { say } from '../lib/voice'
import { detectTesuji, type Tesuji } from '../tesuji'
import type { BoardSession } from './useBoardSession'
import { useTransient } from './useTransient'

export type Announcement = { side: Color; name: string; kind: string; key: number; tesuji?: boolean }

const QUIET_NAMES = ['居玉', '居飛車']

export function useAnnouncements({ sfen, preview, mode, cursor, game, sfens, position }: BoardSession) {
  const { t, i18n } = useTranslation()
  const [announce, setAnnounce] = useTransient<Announcement>(1800)
  const [tesujiNote, setTesujiNote] = useTransient<Tesuji & { at: number }>(6000)
  const announced = useRef<{ start: string; seen: Set<string> }>({ start: '', seen: new Set() })
  const lastCursor = useRef(0)
  useEffect(() => {
    const stepped = cursor === lastCursor.current + 1
    lastCursor.current = cursor
    if (announced.current.start !== game.start) {
      const startPosition = positionOf(game.start)
      const seen = new Set<string>()
      for (const color of [Color.BLACK, Color.WHITE]) {
        const f = formationOf(startPosition, color)
        for (const name of [f.strategy, f.castle]) if (name) seen.add(`${color}|${name}`)
      }
      announced.current = { start: game.start, seen }
    }
    if (preview || mode === 'tsume' || cursor === 0) return
    const tesuji = stepped && sfens[cursor - 1] ? detectTesuji(sfens[cursor - 1], game.moves[cursor - 1]) : null
    if (stepped && position.checked) say(hasLegalMove(position) ? '王手' : '詰み', true)
    if (tesuji) {
      say(tesuji.ja)
      setAnnounce({ side: positionOf(sfens[cursor - 1]).color, name: tesuji.ja, kind: t('app.tesuji'), key: Date.now(), tesuji: true })
      setTesujiNote({ ...tesuji, at: cursor })
    }
    for (const color of [Color.BLACK, Color.WHITE]) {
      const f = formationOf(position, color)
      for (const [name, kind] of [
        [f.strategy, t('app.strategy')],
        [f.castle, t('app.castle')],
      ] as const) {
        if (!name || QUIET_NAMES.includes(name)) continue
        const id = `${color}|${name}`
        if (announced.current.seen.has(id)) continue
        announced.current.seen.add(id)
        if (!stepped) continue
        say(name)
        setAnnounce({ side: color, name: formationName(name, i18n.language), kind, key: Date.now() })
        return
      }
    }
  }, [sfen, preview, mode, cursor, game.start, game.moves, sfens, position, t, setAnnounce, setTesujiNote])
  return { announce, tesujiNote: tesujiNote && tesujiNote.at === cursor ? tesujiNote : null }
}
