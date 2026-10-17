export function Shell() {
  return (
    <div className={`app-shell ${shellBase} ${appShell}`} aria-busy="true">
      <RailNav className="app-rail" />
      <section className={`app-stage ${stage}`}>
        <div className="app-shell-board" />
        <BoardLoading />
      </section>
    </div>
  )
}
import { BoardLoading } from '@/rendering/BoardLoading'
import { stage } from '@/app/stage/stage.styles'
import { appShell, shellBase } from '@/app/layout.styles'
import { RailNav } from '@/app/rail/rail.styles'
