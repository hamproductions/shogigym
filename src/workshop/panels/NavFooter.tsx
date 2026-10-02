import { useTranslation } from 'react-i18next'
import { useSession } from '../hooks/session'
import { Icon } from '../icons'

export function NavFooter({ canAutoplay }: { canAutoplay: boolean }) {
  const { t } = useTranslation()
  const { game, preview, playing, setPlaying, nav } = useSession()
  return (
    <footer className="ws-nav" hidden={game.moves.length === 0 && !preview}>
      <button onClick={nav.first} disabled={!nav.canBack} title={t('workshop.startHome')}>
        <Icon name="first" />
      </button>
      <button onClick={nav.back} disabled={!nav.canBack} title={t('workshop.back')}>
        <Icon name="prev" />
      </button>
      <button className="ws-play" onClick={() => setPlaying((v) => !v)} disabled={!playing && !canAutoplay} title={playing ? t('workshop.pauseSpace') : t('workshop.playTheLineForwardSpace')} aria-pressed={playing}>
        <Icon name={playing ? 'pause' : 'play'} />
      </button>
      <button onClick={nav.forward} disabled={!nav.canForward} title={t('workshop.forward')}>
        <Icon name="next" />
      </button>
      <button onClick={nav.last} disabled={!nav.canForward} title={t('workshop.latestEnd')}>
        <Icon name="last" />
      </button>
    </footer>
  )
}
