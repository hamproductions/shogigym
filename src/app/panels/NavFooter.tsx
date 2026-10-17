import { useTranslation } from 'react-i18next'
import { useSession } from '@/app/hooks/session'
import { Icon } from '@/app/icons'
import type { Watch } from '@/app/modes/view/useWatch'
import type { Lesson } from '@/app/modes/lesson/useLesson'
import { useLineAhead } from '@/app/hooks/useLineAhead'
import { styled } from 'styled-system/jsx'

export function NavFooter({ canAutoplay, watch, lesson }: { canAutoplay: boolean; watch: Watch; lesson: Lesson }) {
  const { t } = useTranslation()
  const session = useSession()
  const { mode, playing, setPlaying, nav } = session
  const running = mode === 'view' ? watch.running : playing
  const ahead = useLineAhead(session, lesson)
  return (
    <MoveNavigation
      first={nav.first}
      back={nav.back}
      forward={(ahead ?? nav).forward}
      last={(ahead ?? nav).last}
      canBack={nav.canBack}
      canForward={nav.canForward || !!ahead}
      running={running}
      canPlay={mode === 'view' ? watch.canPlay : playing || canAutoplay}
      toggle={() => (mode === 'view' ? watch.toggle() : setPlaying((v) => !v))}
      playTitle={mode === 'view' ? t(running ? 'watch.pause' : 'watch.resume') : playing ? t('app.pauseSpace') : t('app.playTheLineForwardSpace')}
    />
  )
}

export function MoveNavigation({
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
    <styled.footer
      flex="none"
      display="grid"
      gridTemplateColumns="repeat(6, 1fr)"
      gap="1.5"
      p="2.5"
      borderTop="1px solid {colors.border}"
      _compact={{ pb: 'max({spacing.2.5}, env(safe-area-inset-bottom))' }}
      css={{
        '& button': { display: 'grid', placeItems: 'center', h: '40px', borderRadius: 'md', bg: 'surface.2', transition: 'background {durations.fast}' },
        '& [aria-pressed=true]': { bg: 'accent', color: 'accent.contrast' },
        '& button:not(:disabled):hover': { bg: 'surface.3' },
        '@container (max-width: 300px)': { gap: '0.5', px: '1' },
      }}
    >
      <button onClick={first} disabled={!canBack} title={t('app.startHome')}>
        <Icon name="first" />
      </button>
      <button onClick={back} disabled={!canBack} title={t('app.back')}>
        <Icon name="prev" />
      </button>
      <button onClick={toggle} disabled={!canPlay} title={playTitle} aria-pressed={running}>
        <Icon name={running ? 'pause' : 'play'} />
      </button>
      <button onClick={forward} disabled={!canForward} title={t('app.forward')}>
        <Icon name="next" />
      </button>
      <button onClick={last} disabled={!canForward} title={t('app.latestEnd')}>
        <Icon name="last" />
      </button>
    </styled.footer>
  )
}
