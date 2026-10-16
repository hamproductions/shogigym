import { defineKeyframes } from '@pandacss/dev'

export const keyframes = defineKeyframes({
  'app-announce-ink': {
    from: { opacity: '0', transform: 'translateX(-14%) scaleX(0.25) rotate(8deg)' },
    to: { opacity: '1', transform: 'translateX(0) scaleX(1) rotate(10deg)' },
  },
  'app-announce-impact': {
    from: { opacity: '0.65', transform: 'translateX(-35%) scaleX(0.3)' },
    to: { opacity: '0', transform: 'translateX(20%) scaleX(1.2)' },
  },
  'app-announce-glyph': {
    from: { opacity: '0', transform: 'translate(12px, 5px) scale(1.2)' },
    to: { opacity: '1', transform: 'translate(0, 0) scale(1)' },
  },
  'app-announce-detail': {
    from: { opacity: '0', transform: 'translateX(-8px)' },
    to: { opacity: '1', transform: 'translateX(0)' },
  },
  'app-announce-seal': {
    from: { opacity: '0', transform: 'rotate(-14deg) scale(1.7)' },
    to: { opacity: '1', transform: 'rotate(-8deg) scale(1)' },
  },
  'app-announce': {
    '0%': { opacity: '0', transform: 'translate(-46%, -50%) scale(1.04)' },
    '12%, 78%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
    '100%': { opacity: '0', transform: 'translate(-54%, -50%) scale(0.99)' },
  },
  // collapse
  'expand-height': {
    from: { height: '0' },
    to: { height: 'var(--height)' },
  },
  'collapse-height': {
    from: { height: 'var(--height)' },
    to: { height: '0' },
  },
  'expand-width': {
    from: { width: '0' },
    to: { width: 'var(--width)' },
  },
  'collapse-width': {
    from: { width: 'var(--width)' },
    to: { width: '0' },
  },
  // fade
  'fade-in': {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  'fade-out': {
    from: { opacity: '1' },
    to: { opacity: '0' },
  },
  // slide from (full)
  'slide-from-left-full': {
    from: { translate: '-100% 0' },
    to: { translate: '0 0' },
  },
  'slide-from-right-full': {
    from: { translate: '100% 0' },
    to: { translate: '0 0' },
  },
  'slide-from-top-full': {
    from: { translate: '0 -100%' },
    to: { translate: '0 0' },
  },
  'slide-from-bottom-full': {
    from: { translate: '0 100%' },
    to: { translate: '0 0' },
  },
  // slide to (full)
  'slide-to-left-full': {
    from: { translate: '0 0' },
    to: { translate: '-100% 0' },
  },
  'slide-to-right-full': {
    from: { translate: '0 0' },
    to: { translate: '100% 0' },
  },
  'slide-to-top-full': {
    from: { translate: '0 0' },
    to: { translate: '0 -100%' },
  },
  'slide-to-bottom-full': {
    from: { translate: '0 0' },
    to: { translate: '0 100%' },
  },
  // slide from
  'slide-from-top': {
    '0%': { translate: '0 -0.5rem' },
    to: { translate: '0' },
  },
  'slide-from-bottom': {
    '0%': { translate: '0 0.5rem' },
    to: { translate: '0' },
  },
  'slide-from-left': {
    '0%': { translate: '-0.5rem 0' },
    to: { translate: '0' },
  },
  'slide-from-right': {
    '0%': { translate: '0.5rem 0' },
    to: { translate: '0' },
  },
  // slide to
  'slide-to-top': {
    '0%': { translate: '0' },
    to: { translate: '0 -0.5rem' },
  },
  'slide-to-bottom': {
    '0%': { translate: '0' },
    to: { translate: '0 0.5rem' },
  },
  'slide-to-left': {
    '0%': { translate: '0' },
    to: { translate: '-0.5rem 0' },
  },
  'slide-to-right': {
    '0%': { translate: '0' },
    to: { translate: '0.5rem 0' },
  },
  // scale
  'scale-in': {
    from: { scale: '0.95' },
    to: { scale: '1' },
  },
  'scale-out': {
    from: { scale: '1' },
    to: { scale: '0.95' },
  },
  'bg-position': {
    from: {
      backgroundPosition: 'var(--animate-from, 1rem) 0',
    },
    to: {
      backgroundPosition: 'var(--animate-to, 0) 0',
    },
  },
  position: {
    from: {
      insetInlineStart: 'var(--animate-from-x)',
      insetBlockStart: 'var(--animate-from-y)',
    },
    to: {
      insetInlineStart: 'var(--animate-to-x)',
      insetBlockStart: 'var(--animate-to-y)',
    },
  },
})
