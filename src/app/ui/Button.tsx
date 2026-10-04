import type { ButtonHTMLAttributes } from 'react'
import { cx } from './cx'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'icon'; size?: 'sm' | 'lg'; on?: boolean }

export function Button({ variant = 'secondary', size, on, className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cx('app-btn', variant !== 'secondary' && variant, size, on && 'on', className)} {...rest} />
}
