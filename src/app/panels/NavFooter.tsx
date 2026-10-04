import { useTranslation } from 'react-i18next'
import { useSession } from '../hooks/session'
import { Icon } from '../icons'
import type { Watch } from '../modes/view/useWatch'

export function NavFooter({ canAutoplay, watch }: { canAutoplay: boolean; watch: Watch }) {
  const { t } = useTranslation()
  const { mode, game, preview, playing, setPlaying, nav } = useSession()
  const running = mode === 'view' ? watch.running : playing
  return (
    <footer className="app-nav" hidden={game.moves.length === 0 && !preview}>
      <button onClick={nav.first} disabled={!nav.canBack} title={t('app.startHome')}>
        <Icon name="first" />
      </button>
      <button onClick={nav.back} disabled={!nav.canBack} title={t('app.back')}>
        <Icon name="prev" />
      </button>
      <button className="app-play" onClick={() => mode === 'view' ? watch.toggle() : setPlaying((v) => !v)} disabled={mode === 'view' ? !watch.started || !!watch.result : !playing && !canAutoplay} title={mode === 'view' ? t(running ? 'watch.pause' : 'watch.resume') : playing ? t('app.pauseSpace') : t('app.playTheLineForwardSpace')} aria-pressed={running}>
        <Icon name={running ? 'pause' : 'play'} />
      </button>
      <button onClick={nav.forward} disabled={!nav.canForward} title={t('app.forward')}>
        <Icon name="next" />
      </button>
      <button onClick={nav.last} disabled={!nav.canForward} title={t('app.latestEnd')}>
        <Icon name="last" />
      </button>
    </footer>
  )
}
