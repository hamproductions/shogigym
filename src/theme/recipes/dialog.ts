import { dialogAnatomy } from '@ark-ui/react/anatomy'
import { defineSlotRecipe } from '@pandacss/dev'

export const dialog = defineSlotRecipe({
  className: 'dialog',
  slots: dialogAnatomy.extendWith('header', 'body', 'footer').keys(),
  base: {
    backdrop: {
      background: 'scrim',
      backdropFilter: 'blur(3px)',
      inset: '0',
      position: 'fixed',
      zIndex: 'calc({zIndex.modal} + var(--layer-index, 0))',
      _open: {
        animationName: 'fade-in',
        animationDuration: 'normal',
      },
    },
    positioner: {
      alignItems: 'center',
      display: 'flex',
      inset: '0',
      justifyContent: 'center',
      overscrollBehaviorY: 'none',
      padding: { base: '3', md: '4' },
      position: 'fixed',
      zIndex: 'calc({zIndex.modal} + var(--layer-index, 0))',
    },
    content: {
      bg: 'gray.surface.bg',
      borderRadius: 'l4',
      boxShadow: 'inset 0 0 0 1px {colors.border}, {shadows.lg}',
      color: 'fg.default',
      maxH: '100%',
      outline: 0,
      overflowY: 'auto',
      padding: '5',
      position: 'relative',
      width: 'min(460px, 100%)',
      '& h2': {
        fontFamily: 'mincho',
        fontSize: 'xl',
        fontWeight: 'heavy',
        lineHeight: 'tight',
      },
      _open: {
        animationName: 'scale-in, fade-in',
        animationDuration: 'normal',
      },
    },
    title: {
      fontFamily: 'mincho',
      fontSize: 'xl',
      fontWeight: 'heavy',
      lineHeight: 'tight',
      margin: '0',
    },
    description: {
      color: 'fg.muted',
      fontSize: 'sm',
    },
    header: {
      alignItems: 'center',
      display: 'flex',
      gap: '3',
      justifyContent: 'space-between',
    },
    body: {},
    footer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '2',
      justifyContent: 'flex-end',
      marginTop: '4',
    },
    closeTrigger: {},
    trigger: {},
  },
})
