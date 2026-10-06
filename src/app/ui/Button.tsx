import type { ComponentProps } from 'react'
import { cx } from './cx'

type ButtonProps = ComponentProps<'button'> & { variant?: 'primary' | 'secondary' | 'ghost' | 'icon'; size?: 'sm' | 'lg'; on?: boolean }

export function Button({ variant = 'secondary', size, on, className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cx('app-btn', variant !== 'secondary' && variant, size, on && 'on', className)} {...rest} />
}
