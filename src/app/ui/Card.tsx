import type { HTMLAttributes } from 'react'
import { Card as ParkCard } from '@/components/ui'
import { cx } from './cx'

export function Card({ tone, className, ...rest }: HTMLAttributes<HTMLDivElement> & { tone?: 'good' | 'bad' | null }) {
  return <ParkCard.Root tone={tone ?? 'neutral'} className={cx('app-card', tone, className)} {...rest} />
}
