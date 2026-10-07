import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Color } from 'tsshogi'
import { formationName, formationOf } from '@/utils/formation'
import { formationTagsAt, formationOpeningAt } from '@/utils/formationTags'
import { hasLegalMove, positionOf } from '@/utils/shogi'
import { say } from '@/utils/voice'
import { useSettings } from '@/appearance/settings'
import { detectTesuji, type Tesuji } from '@/app/tesuji'
import type { BoardSession } from './useBoardSession'
import { useTransient } from './useTransient'

export type Announcement = { side: Color; name: string; kind: string; key: number; tesuji?: boolean }

const QUIET_NAMES = ['居玉', '居飛車']

export function useAnnouncements({ sfen, preview, mode, cursor, game, sfens, position }: BoardSession) {
  const { t, i18n } = useTranslation()
  const { showTesuji, environment } = useSettings()
  const three = environment === 'traditional' || environment === 'casual'
  const [announce, setAnnounce] = useTransient<Announcement>(1800)
  const [tesujiNote, setTesujiNote] = useTransient<Tesuji & { at: number }>(6000)
  const announced = useRef<{ start: string; seen: Set<string> }>({ start: '', seen: new Set() })
  const lastCursor = useRef(0)
  useEffect(() => {
    const stepped = cursor === lastCursor.current + 1
    lastCursor.current = cursor
    if (announced.current.start !== game.start || cursor === 0) {
      const startPosition = positionOf(game.start)
      const seen = new Set<string>()
      for (const color of [Color.BLACK, Color.WHITE]) {
        const f = formationOf(startPosition, color)
        for (const name of [f.strategy, f.castle]) if (name) seen.add(`${color}|${name}`)
      }
      announced.current = { start: game.start, seen }
    }
    if (preview || mode === 'tsume' || cursor === 0) return
    const tesuji = showTesuji && stepped && sfens[cursor - 1] ? detectTesuji(sfens[cursor - 1], game.moves[cursor - 1]) : null
    if (stepped && position.checked) {
      if (hasLegalMove(position)) say('王手', true)
      else if (!three) say('ありがとうございました', true)
    }
    if (tesuji) {
      setAnnounce({ side: positionOf(sfens[cursor - 1]).color, name: tesuji.ja, kind: t('app.tesuji'), key: Date.now(), tesuji: true })
      setTesujiNote({ ...tesuji, at: cursor })
    }
    const tags = formationTagsAt(sfens, game.moves, cursor, game.detectionPreset)
    if (stepped && !tesuji) {
      const side = positionOf(sfens[cursor - 1]).color
      const technique = tags[side === Color.BLACK ? 0 : 1].findLast((tag) => tag.kind === 'technique' && tag.ply === cursor)
      if (showTesuji && technique) {
        setAnnounce({ side, name: formationName(technique.name, i18n.language), kind: t('app.tesuji'), key: Date.now(), tesuji: true })
      }
    }
    if (!formationOpeningAt(sfens, game.moves, cursor, game.detectionPreset)) return
    for (const color of [Color.BLACK, Color.WHITE]) {
      for (const tag of tags[color === Color.BLACK ? 0 : 1].filter((tag) => tag.ply === cursor && tag.kind !== 'technique')) {
        const name = tag.name
        const kind = t(tag.kind === 'strategy' ? 'app.strategy' : 'app.castle')
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
  }, [
    sfen,
    preview,
    mode,
    cursor,
    game.start,
    game.moves,
    game.detectionPreset,
    sfens,
    position,
    t,
    i18n.language,
    setAnnounce,
    setTesujiNote,
    showTesuji,
    three,
  ])
  const onMoveLanded = (landedSfen: string) => {
    if (landedSfen === sfen && !preview && mode !== 'tsume' && cursor > 0 && position.checked && !hasLegalMove(position)) say('ありがとうございました', true)
  }
  return { announce, onMoveLanded, tesujiNote: showTesuji && tesujiNote && tesujiNote.at === cursor ? tesujiNote : null }
}
