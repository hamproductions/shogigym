import type { HTMLAttributes } from 'react'
import { cx } from './cx'

export function Pill({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx('app-pill', className)} {...rest} />
}
