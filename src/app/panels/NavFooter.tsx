import { useTranslation } from 'react-i18next'
import { useSession } from '@/app/hooks/session'
import { Icon } from '@/app/icons'
import type { Watch } from '@/app/modes/view/useWatch'

export function NavFooter({ canAutoplay, watch }: { canAutoplay: boolean; watch: Watch }) {
  const { t } = useTranslation()
  const { mode, game, preview, playing, setPlaying, nav } = useSession()
  const running = mode === 'view' ? watch.running : playing
  return (
    <MoveNavigation
      hidden={game.moves.length === 0 && !preview}
      first={nav.first}
      back={nav.back}
      forward={nav.forward}
      last={nav.last}
      canBack={nav.canBack}
      canForward={nav.canForward}
      running={running}
      canPlay={mode === 'view' ? watch.canPlay : playing || canAutoplay}
      toggle={() => (mode === 'view' ? watch.toggle() : setPlaying((v) => !v))}
      playTitle={mode === 'view' ? t(running ? 'watch.pause' : 'watch.resume') : playing ? t('app.pauseSpace') : t('app.playTheLineForwardSpace')}
    />
  )
}

export function MoveNavigation({
  hidden,
  first,
  back,
  forward,
  last,
  canBack,
  canForward,
  running,
  canPlay,
  toggle,
  playTitle,
}: {
  hidden?: boolean
  first: () => void
  back: () => void
  forward: () => void
  last: () => void
  canBack: boolean
  canForward: boolean
  running: boolean
  canPlay: boolean
  toggle: () => void
  playTitle: string
}) {
  const { t } = useTranslation()
  return (
    <footer className="app-nav" hidden={hidden}>
      <button onClick={first} disabled={!canBack} title={t('app.startHome')}>
        <Icon name="first" />
      </button>
      <button onClick={back} disabled={!canBack} title={t('app.back')}>
        <Icon name="prev" />
      </button>
      <button className="app-play" onClick={toggle} disabled={!canPlay} title={playTitle} aria-pressed={running}>
        <Icon name={running ? 'pause' : 'play'} />
      </button>
      <button onClick={forward} disabled={!canForward} title={t('app.forward')}>
        <Icon name="next" />
      </button>
      <button onClick={last} disabled={!canForward} title={t('app.latestEnd')}>
        <Icon name="last" />
      </button>
    </footer>
  )
}
