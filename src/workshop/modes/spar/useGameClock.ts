import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Side } from '../../../shogi'
import { clockTime } from '../../lib/notation'
import { TIME_CONTROLS, useSettings } from '../../settings'

type TimeControlSpec = (typeof TIME_CONTROLS)[keyof typeof TIME_CONTROLS]
type ClockState = { sente: number; gote: number; byo: number; flagged: Side | null }

export type ClockFace = { text: string; active: boolean; low: boolean; out: boolean }

const freshClock = (tc: TimeControlSpec): ClockState => ({ sente: tc.main * 1000, gote: tc.main * 1000, byo: tc.byoyomi * 1000, flagged: null })

export function useGameClock({ enabled, toMove, atEnd, moveCount, stopped }: { enabled: boolean; toMove: Side; atEnd: boolean; moveCount: number; stopped: boolean }) {
  const { t } = useTranslation()
  const settings = useSettings()
  const timeControl = TIME_CONTROLS[settings.timeControl] ?? TIME_CONTROLS.none
  const clockOn = timeControl.main + timeControl.byoyomi > 0
  const [clock, setClock] = useState(() => freshClock(timeControl))
  const running = enabled && clockOn && !stopped && atEnd && !clock.flagged
  const movesSeen = useRef(moveCount)

  const [clockSpec, setClockSpec] = useState(timeControl)
  if (clockSpec !== timeControl) {
    setClockSpec(timeControl)
    setClock(freshClock(timeControl))
  }

  useEffect(() => {
    const before = movesSeen.current
    movesSeen.current = moveCount
    if (!enabled || !clockOn || moveCount <= before || !atEnd) return
    const mover: Side = toMove === 'sente' ? 'gote' : 'sente'
    setClock((c) => ({ ...c, [mover]: c[mover] + (c[mover] > 0 || !timeControl.byoyomi ? timeControl.increment * 1000 : 0), byo: timeControl.byoyomi * 1000 }))
  }, [moveCount, enabled, clockOn, atEnd, toMove, timeControl])

  useEffect(() => {
    if (!running) return
    let last = performance.now()
    const side = toMove
    const id = window.setInterval(() => {
      const now = performance.now()
      const dt = now - last
      last = now
      setClock((c) => {
        if (c.flagged) return c
        const main = c[side] - dt
        if (main > 0) return { ...c, [side]: main }
        if (!timeControl.byoyomi) return { ...c, [side]: 0, flagged: side }
        const byo = c.byo + main
        return byo > 0 ? { ...c, [side]: 0, byo } : { ...c, [side]: 0, byo: 0, flagged: side }
      })
    }, 100)
    return () => window.clearInterval(id)
  }, [running, toMove, timeControl])

  const face = (side: Side): ClockFace | undefined => {
    if (!enabled || !clockOn) return undefined
    const active = running && toMove === side
    const inByo = clock[side] <= 0 && timeControl.byoyomi > 0
    const ms = inByo ? (toMove === side ? clock.byo : timeControl.byoyomi * 1000) : clock[side]
    const total = Math.ceil(ms / 1000)
    return { text: inByo ? t('workshop.byoyomi', { total }) : clockTime(total), active, low: active && total <= 10, out: clock.flagged === side }
  }

  return { flagged: clock.flagged, face, reset: () => setClock(freshClock(timeControl)) }
}
