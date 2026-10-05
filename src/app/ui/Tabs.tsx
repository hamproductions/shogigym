import type { ReactNode } from 'react'
import { cx } from './cx'

type TabsProps<T> = { items: { id: T; label: ReactNode }[]; value: T; onChange: (id: T) => void; className?: string; children?: ReactNode }

export function Tabs<T extends string>({ items, value, onChange, className, children }: TabsProps<T>) {
  return (
    <div className={cx('app-tabs', className)} role="tablist">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          className={value === item.id ? 'on' : ''}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
      {children}
    </div>
  )
}
