import type { HTMLAttributes } from 'react'
import { cx } from './cx'

export function Card({ tone, className, ...rest }: HTMLAttributes<HTMLDivElement> & { tone?: 'good' | 'bad' | null }) {
  return <div className={cx('ws-card', tone, className)} {...rest} />
}
