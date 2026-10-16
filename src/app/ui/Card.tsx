import type { HTMLAttributes } from 'react'
import { css } from 'styled-system/css'
import { Card as ParkCard } from '@/components/ui'
import { cx } from './cx'

const spacing = css({ _narrow: { mt: '2' } })

export function Card({ tone, className, ...rest }: HTMLAttributes<HTMLDivElement> & { tone?: 'good' | 'bad' | null }) {
  return <ParkCard.Root tone={tone ?? 'neutral'} className={cx('app-card', tone, spacing, className)} {...rest} />
}
