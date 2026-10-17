import { css, cva } from 'styled-system/css'

export const stage = css({
  '--stage-gutter': '{spacing.3}',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  minW: '0',
  minH: '0',
  background: 'radial-gradient(ellipse 65% 75% at 50% 48%, {colors.stage.glow}, transparent 70%)',
  _compact: { '--stage-gutter': '{spacing.1.5}' },
  _short: { '--stage-gutter': '{spacing.1}' },
})

export const fsExit = css({ display: 'none' })

export const boardWrap = css({
  '--eval-bar-width': '28px',
  position: 'relative',
  flex: '1',
  display: 'flex',
  minH: '0',
  p: 'var(--stage-gutter)',
  _compact: {
    '--eval-bar-width': '20px',
    flexDirection: 'column',
    '.app-shell[data-drawer-open] &': { '& .app-plate.top': { display: 'flex' } },
    '&:has(> [data-banner]) .app-plate.top': { visibility: 'hidden' },
  },
  _short: { '--eval-bar-width': '18px', p: '{spacing.1} var(--stage-gutter)' },
})

export const boardScene = css({
  position: 'relative',
  display: 'flex',
  flex: '1',
  minW: '0',
  minH: '0',
  overflow: 'hidden',
  borderRadius: 'lg',
  boxShadow: '0 0 0 1px {colors.border}',
  '[data-previewing] &': {
    _after: { content: '""', position: 'absolute', inset: '0', border: '2px solid {colors.accent}', borderRadius: 'xl', pointerEvents: 'none' },
  },
  _compact: { '--band': '40px', py: 'var(--band)', '.app-shell[data-drawer-open] &': { pb: '0' } },
})

export const peek = cva({
  base: {
    zIndex: 'hud',
    p: '{spacing.1.5} {spacing.3}',
    borderRadius: 'md',
    bg: 'overlay',
    color: 'fg.default',
    fontSize: 'sm',
    boxShadow: 'md',
    pointerEvents: 'none',
    _compact: { maxH: '4.5em', overflowY: 'auto', fontSize: 'xs' },
  },
  variants: {
    placement: {
      caption: { position: 'static', maxW: '100%', whiteSpace: 'normal' },
      hint: {
        display: 'none',
        position: 'absolute',
        left: '50%',
        bottom: '54px',
        transform: 'translateX(-50%)',
        whiteSpace: 'nowrap',
        _compact: { display: 'block', top: '1', right: '120px', bottom: 'auto', left: '2', transform: 'none', whiteSpace: 'normal' },
      },
    },
  },
})

const mistakeBanner = {
  bg: 'var(--banner)',
  color: 'gofun',
  boxShadow: 'md',
  '& .app-btn': { bg: 'onFill.soft', color: 'inherit' },
  '& .app-btn[data-variant=primary]': { bg: 'gofun', color: 'var(--banner)', fontWeight: 'bold' },
}

export const banner = cva({
  base: {
    position: 'absolute',
    top: '42px',
    left: '50%',
    zIndex: 'hud',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '3',
    w: 'max-content',
    maxW: 'calc(100% - 24px)',
    p: '{spacing.1.5} {spacing.2} {spacing.1.5} {spacing.1.5}',
    borderRadius: 'lg',
    bg: 'overlay',
    color: 'fg.default',
    fontSize: 'sm',
    boxShadow: 'inset 0 0 0 1px {colors.border}, {shadows.md}',
    '& > .app-btn': { flex: 'none' },
    _narrow: {
      order: '-1',
      left: 'var(--stage-gutter)',
      right: 'var(--stage-gutter)',
      transform: 'none',
      flex: 'none',
      alignSelf: 'stretch',
      gap: '2',
      w: 'auto',
      maxW: 'none',
      m: '0',
      p: '{spacing.1} {spacing.1.5}',
      fontSize: '2xs',
      whiteSpace: 'nowrap',
      overflowX: 'auto',
    },
    _compact: { top: 'calc(var(--stage-gutter) + 3px)', '.app-shell[data-drawer-open] &': { top: '3px' } },
  },
  variants: {
    tone: {
      plain: {},
      branch: {},
      mistake: { '--banner': 'colors.danger.strong', ...mistakeBanner },
      ok: { '--banner': 'colors.success.strong', ...mistakeBanner },
    },
  },
  defaultVariants: { tone: 'plain' },
})

export const bannerSeal = cva({
  base: {
    flex: 'none',
    p: '{spacing.0.5} {spacing.2}',
    borderRadius: 'sm',
    bg: 'accent',
    color: 'accent.contrast',
    fontFamily: 'mincho',
    fontWeight: 'heavy',
    letterSpacing: '0.1em',
    '&:lang(en)': { letterSpacing: 'normal' },
  },
  variants: {
    tone: {
      plain: {},
      branch: { bg: 'info.fill' },
      mistake: { bg: 'gofun', color: 'var(--banner)' },
    },
  },
  defaultVariants: { tone: 'plain' },
})

export const bannerText = cva({
  base: { flex: '1 1 auto', minW: '0', _narrow: { overflow: 'hidden', textOverflow: 'ellipsis' } },
  variants: {
    fit: {
      wrap: {},
      tip: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
      hide: { _narrow: { display: 'none' } },
      short: { display: 'none', _compact: { display: 'inline', whiteSpace: 'nowrap', fontWeight: 'bold' } },
    },
  },
  defaultVariants: { fit: 'wrap' },
})

export const evalBarNumber = cva({
  base: {
    position: 'absolute',
    left: '0',
    right: '0',
    fontSize: '12px',
    fontWeight: 'bold',
    lineHeight: '1.15',
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
    _short: { fontSize: '10px' },
  },
  variants: {
    place: {
      bottom: { bottom: '6px', color: '#2a241e' },
      top: { top: '6px', color: '#f1eadb' },
    },
  },
})

export const promoteChoice = cva({
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5',
    minW: '84px',
    p: '{spacing.2.5} {spacing.3} {spacing.2}',
    borderRadius: 'md',
    bg: 'surface.2',
    color: 'fg.default',
    fontSize: 'sm',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    _hover: { bg: 'surface.3' },
  },
  variants: {
    kind: {
      yes: { boxShadow: 'inset 0 0 0 2px {colors.accent}' },
      no: {},
      cancel: { bg: 'transparent', boxShadow: 'inset 0 0 0 1px {colors.border.strong}', _hover: { bg: 'transparent' } },
    },
  },
})

export const announce = cva({
  base: {
    '--ink': '#84372c',
    '--accent': '#f0bc97',
    position: 'absolute',
    left: '50%',
    top: '42%',
    zIndex: 'announce',
    w: 'min(92%, 660px)',
    aspectRatio: '3 / 1',
    display: 'grid',
    placeItems: 'center',
    isolation: 'isolate',
    pointerEvents: 'none',
    transform: 'translate(-50%, -50%)',
    animation: 'app-announce 1.8s ease both',
    _before: {
      content: '""',
      position: 'absolute',
      inset: '0',
      zIndex: '-2',
      bg: 'var(--ink)',
      mask: 'var(--announce-mask) center / 100% 100% no-repeat',
      transformOrigin: 'center',
      animation: 'app-announce-ink 450ms cubic-bezier(0.16, 1, 0.3, 1) both',
    },
    _after: {
      content: '""',
      position: 'absolute',
      inset: '20% -12%',
      zIndex: '-1',
      background: 'linear-gradient(90deg, transparent, #fff6de, transparent)',
      clipPath: 'polygon(0 48%, 100% 34%, 100% 48%, 0 58%)',
      animation: 'app-announce-impact 420ms ease-out both',
    },
    _narrow: { top: '30%', w: 'calc(100% - 24px)' },
    _motionReduce: { animation: 'none', _before: { animation: 'none' }, _after: { display: 'none' } },
  },
  variants: {
    tone: {
      sente: {},
      gote: { '--ink': '#2d4b7c', '--accent': '#b6cae7' },
      tesuji: { '--ink': '#79591c', '--accent': '#e9cf87' },
    },
  },
})

export const announceName = cva({
  base: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    fontFamily: "'Yuji Boku', 'Yuji Syuku', {fonts.mincho}",
    fontWeight: '400',
    fontSize: 'min(2.8rem, calc(350px / var(--glyph-count)))',
    lineHeight: '1.2',
    letterSpacing: '0.04em',
    color: '#fff4df',
    textShadow: '0 2px 1px #000',
    _narrow: { fontSize: 'min(2.3rem, calc((58vw - 52px) / var(--glyph-count)))' },
  },
  variants: {
    latin: {
      false: {},
      true: {
        display: 'block',
        overflowWrap: 'anywhere',
        fontFamily: 'sans',
        fontWeight: 'heavy',
        fontSize: 'clamp(1.25rem, calc(62vw / var(--glyph-count)), 2.6rem)',
        letterSpacing: '0',
        _narrow: { fontSize: 'clamp(1.25rem, calc(62vw / var(--glyph-count)), 2.6rem)' },
      },
    },
  },
})

export const announceSeal = cva({
  base: {
    flex: 'none',
    display: 'grid',
    placeItems: 'center',
    w: '36px',
    h: '48px',
    p: '3px',
    border: '2px solid #b93b2c',
    outline: '1px solid #b93b2c',
    outlineOffset: '-5px',
    color: '#b93b2c',
    bg: '#f1e7d2',
    boxShadow: '0 2px 5px #0003',
    fontFamily: "'Yuji Syuku', {fonts.mincho}",
    fontSize: '18px',
    lineHeight: '1',
    writingMode: 'vertical-rl',
    transform: 'rotate(-8deg)',
    animation: 'app-announce-seal 350ms 240ms cubic-bezier(0.16, 1, 0.3, 1) both',
    _narrow: { w: '30px', h: '48px', fontSize: '16px' },
    _motionReduce: { animation: 'none' },
  },
  variants: {
    latin: {
      false: {},
      true: { display: 'none' },
    },
  },
})
