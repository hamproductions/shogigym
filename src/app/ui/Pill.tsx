import type { HTMLAttributes } from 'react'
import { Badge } from '@/components/ui'
import { cx } from './cx'

export function Pill({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <Badge className={cx('app-pill', className)} {...rest} />
}
