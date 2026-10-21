import { styled } from 'styled-system/jsx'

const seigaihaMask =
  "url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2248%22%20height%3D%2224%22%3E%3Cpath%20fill%3D%22black%22%20d%3D%22M-24%200a24%2024%200%200%201%2048%200Z%22%2F%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%220.7%22%20d%3D%22M-24%200a24%2024%200%200%201%2048%200M-18%200a18%2018%200%200%201%2036%200M-12%200a12%2012%200%200%201%2024%200M-6%200a6%206%200%200%201%2012%200%22%2F%3E%3Cpath%20fill%3D%22black%22%20d%3D%22M24%200a24%2024%200%200%201%2048%200Z%22%2F%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%220.7%22%20d%3D%22M24%200a24%2024%200%200%201%2048%200M30%200a18%2018%200%200%201%2036%200M36%200a12%2012%200%200%201%2024%200M42%200a6%206%200%200%201%2012%200%22%2F%3E%3Cpath%20fill%3D%22black%22%20d%3D%22M0%2012a24%2024%200%200%201%2048%200Z%22%2F%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%220.7%22%20d%3D%22M0%2012a24%2024%200%200%201%2048%200M6%2012a18%2018%200%200%201%2036%200M12%2012a12%2012%200%200%201%2024%200M18%2012a6%206%200%200%201%2012%200%22%2F%3E%3Cpath%20fill%3D%22black%22%20d%3D%22M-24%2024a24%2024%200%200%201%2048%200Z%22%2F%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%220.7%22%20d%3D%22M-24%2024a24%2024%200%200%201%2048%200M-18%2024a18%2018%200%200%201%2036%200M-12%2024a12%2012%200%200%201%2024%200M-6%2024a6%206%200%200%201%2012%200%22%2F%3E%3Cpath%20fill%3D%22black%22%20d%3D%22M24%2024a24%2024%200%200%201%2048%200Z%22%2F%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%220.7%22%20d%3D%22M24%2024a24%2024%200%200%201%2048%200M30%2024a18%2018%200%200%201%2036%200M36%2024a12%2012%200%200%201%2024%200M42%2024a6%206%200%200%201%2012%200%22%2F%3E%3Cpath%20fill%3D%22black%22%20d%3D%22M0%2036a24%2024%200%200%201%2048%200Z%22%2F%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%220.7%22%20d%3D%22M0%2036a24%2024%200%200%201%2048%200M6%2036a18%2018%200%200%201%2036%200M12%2036a12%2012%200%200%201%2024%200M18%2036a6%206%200%200%201%2012%200%22%2F%3E%3C%2Fsvg%3E') repeat"

export const seigaiha = {
  content: '""',
  position: 'absolute',
  inset: '0',
  zIndex: '-1',
  bg: 'pattern.ink',
  mask: seigaihaMask,
  maskMode: 'luminance',
  pointerEvents: 'none',
} as const

export const ShellBase = styled('div', {
  base: {
    '--rail-w': 'sizes.rail',
    position: 'fixed',
    inset: '0',
    h: '100dvh',
    p: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
    display: 'grid',
    gridTemplateColumns: 'var(--rail-w) minmax(0, 1fr) var(--panel-w, 380px)',
    gridTemplateRows: 'minmax(0, 1fr)',
    bg: 'surface.0',
    color: 'fg.default',
    fontFamily: 'sans',
    fontSize: 'md',
    lineHeight: 'normal',
    overflow: 'hidden',
    _before: { ...seigaiha },
    _compact: { gridTemplateColumns: 'minmax(0, 1fr)', gridTemplateRows: 'auto minmax(0, 1fr)' },
  },
})

export const AppShell = styled(ShellBase, {
  base: {
    '&[data-panel-hidden]:not([data-fs])': { gridTemplateColumns: 'var(--rail-w) minmax(0, 1fr) 0' },
    '&[data-zoned]:not([data-fs])': { gridTemplateColumns: 'var(--rail-w) minmax(0, 1fr)' },
    '&[data-fs]': { p: '0', gridTemplateColumns: 'minmax(0, 1fr)', gridTemplateRows: 'minmax(0, 1fr)' },
    _compact: {
      '&[data-panel-hidden]:not([data-fs])': { gridTemplateColumns: 'minmax(0, 1fr)' },
      '&[data-drawer-open]': { pb: '0' },
      '&[data-drawer-open]:not([data-fs]):not([data-sheet-set])': {
        gridTemplateRows: 'auto minmax(0, 1fr) max(30dvh, calc(100dvh - 57px - min(516px, 131vw)))',
      },
      '&[data-drawer-open][data-sheet-set]': { gridTemplateRows: 'auto minmax(0, 1fr) calc(var(--sheet-h) * 1dvh)' },
    },
    _short: {
      '--rail-w': '52px',
      gridTemplateColumns: 'var(--rail-w) minmax(0, 1fr) min(var(--panel-w, 380px), 34vw)',
    },
  },
})
