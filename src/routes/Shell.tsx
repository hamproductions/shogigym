export function Shell() {
  return (
    <div className={`app-shell ${appShell}`} aria-busy="true">
      <nav className={`app-rail ${rail}`} />
      <section className={`app-stage ${stage}`}>
        <div className="app-shell-board" />
        <BoardLoading />
      </section>
    </div>
  )
}
import { BoardLoading } from '@/rendering/BoardLoading'
import { stage } from '@/app/stage/stage.styles'
import { appShell } from '@/app/layout.styles'
import { rail } from '@/app/rail/rail.styles'
