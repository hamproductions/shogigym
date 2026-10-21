import { Button as ParkButton } from '@/components/ui'
import type { HTMLStyledProps } from 'styled-system/types'
import { cx } from './cx'

type ButtonProps = HTMLStyledProps<'button'> & { variant?: 'primary' | 'secondary' | 'ghost' | 'icon'; size?: 'sm' | 'lg'; on?: boolean }

const variants = { primary: 'solid', secondary: 'subtle', ghost: 'outline', icon: 'plain' } as const

export function Button({ variant = 'secondary', size, on, className, type = 'button', ...rest }: ButtonProps) {
  return (
    <ParkButton
      type={type}
      variant={variants[variant]}
      size={size ?? 'md'}
      iconOnly={variant === 'icon'}
      aria-pressed={on}
      data-variant={variant}
      className={cx('app-btn', className)}
      {...rest}
    />
  )
}
