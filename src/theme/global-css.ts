export const globalCss = {
  extend: {
    '*': {
      '--global-color-border': 'colors.border',
      '--global-color-placeholder': 'colors.fg.subtle',
      '--global-color-selection': 'colors.colorPalette.subtle.bg',
      '--global-color-focus-ring': 'colors.focus',
    },
    html: {
      colorPalette: 'gray',
      colorScheme: 'light',
      WebkitTapHighlightColor: 'transparent',
    },
    'html.dark': {
      colorScheme: 'dark',
    },
    'html, body, #root': {
      margin: '0',
      height: '100%',
      background: 'surface.0',
      color: 'fg.default',
    },
    '*, *::before, *::after': {
      boxSizing: 'border-box',
    },
    '.app-shell button, .app-more-menu button, .app-rail, .board3d, .app-board-wrap': {
      WebkitUserSelect: 'none',
      userSelect: 'none',
      WebkitTouchCallout: 'none',
    },
    ':where(.app-shell, .app-more-menu) button': {
      font: 'inherit',
      color: 'inherit',
      background: 'none',
      border: '0',
      padding: '0',
      cursor: 'pointer',
    },
    ':where(.app-shell, .app-more-menu) button:disabled': {
      cursor: 'default',
      opacity: '0.4',
    },
    ':where(.app-shell, .app-more-menu) :focus-visible': {
      outline: '2px solid {colors.focus}',
      outlineOffset: '2px',
    },
    ":where(.app-shell) input[type='checkbox'], :where(.app-shell) input[type='range']": {
      accentColor: 'accent',
    },
    ':where(.app-shell) h2, :where(.app-shell) h3': {
      margin: '0',
    },
    '@media (prefers-reduced-motion: reduce)': {
      '.app-shell *, .app-shell *::before, .app-shell *::after': {
        transition: 'none !important',
        animation: 'none !important',
      },
      '.app-shell .app-koma-lift': {
        transition: 'transform 0.16s ease-out, filter 0.16s ease-out !important',
      },
    },
    "[hidden]:where(:not([hidden='until-found']))": {
      display: 'none !important',
    },
  },
}
