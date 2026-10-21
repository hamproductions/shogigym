import type { HTMLStyledProps } from 'styled-system/types'
import { Card as ParkCard } from '@/components/ui'
import { cx } from './cx'

export function Card({ tone, className, ...rest }: HTMLStyledProps<'div'> & { tone?: 'good' | 'bad' | null }) {
  return <ParkCard.Root tone={tone ?? 'neutral'} className={cx('app-card', tone, className)} _narrow={{ mt: '2' }} {...rest} />
}
