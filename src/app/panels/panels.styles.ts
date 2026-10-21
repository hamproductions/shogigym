import { css } from 'styled-system/css'
import { styled } from 'styled-system/jsx'
import { Button } from '@/app/ui/Button'

export const Muted = styled('p', { base: { color: 'fg.muted', fontSize: 'sm' } })

const tabTriggers = {
  _compact: { '& [data-part=trigger]': { p: '{spacing.2} {spacing.2} {spacing.2.5}' } },
  _short: { '& [data-part=trigger]': { py: '1.5' } },
}

export const panelTabs = css(tabTriggers)

export const floatingTabs = css(tabTriggers, { flex: 'none', pr: '1' })

export const TabLabel = styled('span', { base: { _compact: { '&.app-ja': { fontSize: 'lg' } } } })

export const PanelHeader = styled('div', { base: { display: 'flex', flex: 'none', alignItems: 'center', gap: '0.5', pr: '1' } })

export const HeaderButton = styled(Button, { base: { flex: 'none', w: '36px', h: '36px', p: '0', m: '0' } })

export const PanelContent = styled('div', {
  base: {
    flex: '1',
    overflowY: 'auto',
    p: '4',
    _compact: {
      minHeight: '0',
      p: '{spacing.3} {spacing.4} {spacing.6}',
      WebkitOverflowScrolling: 'touch',
      '.app-shell[data-panel-side] &': { px: '3' },
    },
  },
})

export const PinnedGraph = styled('div', { base: { flex: 'none', p: '{spacing.4} {spacing.4} 0' } })

export const CountsSection = styled('section', { base: { mt: '4', pt: '3', borderTop: '1px solid {colors.border}', fontSize: 'sm' } })

export const CountsHeading = styled('h3', { base: { fontSize: 'inherit' } })

export const MoveCell = styled('div', { base: { minWidth: '0', '@container (max-width: 340px)': { '&:last-child': { gridColumn: '2' } } } })

export const MoveButton = styled('button', {
  base: {
    w: '100%',
    py: '1',
    px: '2',
    borderRadius: 'sm',
    fontFamily: 'mincho',
    textAlign: 'left',
    overflowWrap: 'anywhere',
    '&:hover': { bg: 'surface.2' },
    '&[aria-current]': { bg: 'surface.2', boxShadow: 'inset 2px 0 0 {colors.accent}' },
    '[data-in-var] > &': { '&:first-child': { boxShadow: 'inset 2px 0 0 {colors.info}' } },
    _narrow: { px: '1', fontSize: 'sm' },
  },
})

export const PlateBox = styled('div', {
  base: {
    position: 'absolute',
    left: '2',
    zIndex: 'plate',
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    p: '{spacing.0.5} {spacing.2.5} {spacing.0.5} {spacing.0.5}',
    borderRadius: 'md',
    bg: 'overlay',
    boxShadow: 'sm',
    fontSize: 'md',
    pointerEvents: 'none',
    '&.top': { top: '2' },
    '&.bottom': { bottom: '2' },
    '.app-board-wrap[data-eval] &': { left: 'calc(var(--eval-bar-width) + {spacing.2})' },
    '.app-shell[data-fs] &': { display: 'none' },
    _compact: {
      '.app-shell[data-drawer-open] &': { display: 'none' },
      '.app-board-wrap[data-eval] &': { left: '2' },
      '.app-shell[data-drawer-open] .app-board-wrap &': { '&.top': { display: 'flex' } },
      '.app-board-wrap:has(> [data-banner]) &': { '&.top': { visibility: 'hidden' } },
    },
    _short: { fontSize: 'xs', py: '0' },
  },
  variants: {
    placement: {
      scene: { _compact: { fontSize: 'sm', gap: '1' } },
      caption: { position: 'static', transform: 'none', maxW: '100%' },
    },
  },
})

export const PlateSide = styled('span', { base: { pl: '1.5', fontWeight: 'bold', _compact: { pl: '0' } } })

export const Clock = styled('span', {
  base: {
    minWidth: '64px',
    p: '{spacing.0.5} {spacing.2}',
    borderRadius: 'sm',
    bg: 'surface.3',
    color: 'fg.default',
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  variants: {
    state: {
      idle: {},
      on: { bg: 'fg.default', color: 'fg.inverse' },
      low: { bg: 'danger.fill', color: 'onFill' },
      out: { bg: 'danger.strong', color: 'onFill' },
    },
  },
  defaultVariants: { state: 'idle' },
})

export const BackLink = styled('button', {
  base: { p: '{spacing.0.5} 0', color: 'fg.muted', fontSize: 'sm', transition: 'color {durations.fast}', _hover: { color: 'fg.default' } },
})

export const SubHeading = styled('h3', { base: { m: '{spacing.4} 0 {spacing.1.5}', color: 'fg.muted', fontSize: 'sm', fontWeight: 'medium' } })

export const Note = styled('p', {
  base: { m: '0 0 {spacing.2}', p: '{spacing.2.5} {spacing.3}', borderRadius: 'md', bg: 'surface.2', fontFamily: 'mincho', lineHeight: 'mincho' },
  variants: {
    tone: {
      plain: {},
      warn: { boxShadow: 'inset 3px 0 0 {colors.accent}' },
      end: { bg: 'color-mix(in srgb, {colors.fg.default} 6%, transparent)' },
      hint: { display: 'flex', alignItems: 'center' },
      idle: {
        display: 'flex',
        alignItems: 'center',
        pl: '0',
        bg: 'transparent',
        color: 'fg.muted',
        fontFamily: 'sans',
        fontSize: 'sm',
        fontWeight: 'regular',
        lineHeight: 'normal',
      },
    },
  },
  defaultVariants: { tone: 'plain' },
})

export const Result = styled('p', {
  base: { m: '0', p: '{spacing.2.5} {spacing.3}', borderRadius: 'md', fontSize: 'sm' },
  variants: {
    tone: {
      none: {},
      right: { bg: 'success.soft', color: 'success' },
      wrong: { bg: 'danger.soft', color: 'danger' },
    },
  },
  defaultVariants: { tone: 'none' },
})

export const PvLine = styled('p', { base: { lineClamp: '2', m: '0', fontFamily: 'mincho', fontSize: 'sm' } })

export const VerdictHead = styled('div', { base: { display: 'flex', alignItems: 'center', gap: '2.5', mb: '2', fontSize: 'md' } })

export const VerdictTitle = styled('strong', { base: { fontFamily: 'mincho', fontWeight: 'heavy', fontSize: 'lg' } })

export const LabelBadge = styled('span', {
  base: {
    flex: 'none',
    bg: 'light-dark(color-mix(in srgb, var(--label) 56%, #000), var(--label))',
    display: 'grid',
    placeItems: 'center',
    w: '28px',
    h: '28px',
    borderRadius: '50%',
    color: 'onFill',
    fontWeight: 'bold',
    fontSize: 'sm',
  },
})

export const TaskText = styled('p', {
  base: {
    mb: '0',
    fontFamily: 'mincho',
    fontWeight: 'heavy',
    fontSize: 'lg',
    lineHeight: 'normal',
    _narrow: { order: '-2', fontSize: 'md' },
  },
})

export const NarrowColumn = styled('div', { base: { _narrow: { display: 'flex', flexDirection: 'column' } } })
