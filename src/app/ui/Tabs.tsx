import type { ReactNode } from 'react'
import { Tabs as ParkTabs } from '@/components/ui'
import { cx } from './cx'

type TabsProps<T> = { items: { id: T; label: ReactNode }[]; value: T; onChange: (id: T) => void; className?: string; children?: ReactNode }

export function Tabs<T extends string>({ items, value, onChange, className, children }: TabsProps<T>) {
  return (
    <ParkTabs.Root className={cx('app-tabs', className)} value={value} onValueChange={(details) => onChange(details.value as T)}>
      <ParkTabs.List>
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
