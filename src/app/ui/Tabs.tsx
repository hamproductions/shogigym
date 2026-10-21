import type { ReactNode } from 'react'
import type { JsxStyleProps } from 'styled-system/types'
import { Tabs as ParkTabs } from '@/components/ui'
import { cx } from './cx'

type TabsProps<T> = Omit<JsxStyleProps, 'css'> & {
  items: { id: T; label: ReactNode }[]
  value: T
  onChange: (id: T) => void
  className?: string
  children?: ReactNode
}

export function Tabs<T extends string>({ items, value, onChange, className, children, ...styles }: TabsProps<T>) {
  return (
    <ParkTabs.Root
      className={cx('app-tabs', className)}
      css={{ '@container (max-width: 300px)': { flexWrap: 'wrap' } }}
      {...styles}
      value={value}
      onValueChange={(details) => onChange(details.value as T)}
    >
      <ParkTabs.List css={{ '@container (max-width: 300px)': { flexWrap: 'wrap' } }}>
        {items.map((item) => (
          <ParkTabs.Trigger key={item.id} value={item.id}>
            {item.label}
          </ParkTabs.Trigger>
        ))}
      </ParkTabs.List>
      {children}
    </ParkTabs.Root>
  )
}
