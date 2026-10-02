import type { HTMLAttributes } from 'react'
import { cx } from './cx'

export function Pill({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx('ws-pill', className)} {...rest} />
}
