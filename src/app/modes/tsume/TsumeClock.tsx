import { useEffect, useState } from 'react'
import type { TsumeState } from './useTsume'
import { seconds } from './seconds'

export function TsumeClock({ tsume }: { tsume: TsumeState }) {
  const [now, setNow] = useState(() => Date.now())
  const running = tsume.endedAt === undefined && tsume.pausedAt === undefined
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(timer)
  }, [running, tsume.startedAt])
  return <>{seconds(Math.max(0, (tsume.endedAt ?? tsume.pausedAt ?? now) - tsume.startedAt))}</>
}
