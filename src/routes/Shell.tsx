export function Shell() {
  return (
    <AppShell className="app-shell" aria-busy="true">
      <RailNav className="app-rail" />
      <Stage className="app-stage">
        <div className="app-shell-board" />
        <BoardLoading />
      </Stage>
    </AppShell>
  )
}
import { BoardLoading } from '@/rendering/BoardLoading'
import { Stage } from '@/app/stage/stage.styles'
import { AppShell } from '@/app/layout.styles'
import { RailNav } from '@/app/rail/rail.styles'
