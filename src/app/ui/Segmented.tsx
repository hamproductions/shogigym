import '@/app/ui/dialog.css'
import type { ReactNode } from 'react'
import { SegmentGroup } from '@/components/ui'
import { cx } from './cx'

type Option<T> = { v: T; t: ReactNode; title?: string }
type SegmentedProps<T> = { value: T; options: Option<T>[]; onChange: (v: T) => void; label?: string; size?: 'small' | 'big'; className?: string }

const sizes = { small: 'sm', big: 'lg' } as const

export function Segmented<T extends string | number | boolean>({ value, options, onChange, label, size, className }: SegmentedProps<T>) {
  return (
    <SegmentGroup.Root
      className={cx('app-seg', size, className)}
      size={size ? sizes[size] : 'md'}
      aria-label={label}
      value={String(value)}
      onValueChange={(details) => {
        const option = options.find((o) => String(o.v) === details.value)
        if (option) onChange(option.v)
      }}
    >
      {options.map((o) => (
        <SegmentGroup.Item key={String(o.v)} value={String(o.v)} title={o.title}>
          <SegmentGroup.ItemText>{o.t}</SegmentGroup.ItemText>
          <SegmentGroup.ItemHiddenInput />
        </SegmentGroup.Item>
      ))}
    </SegmentGroup.Root>
  )
}

export function SettingRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="app-setting">
      <span>{label}</span>
      {children}
    </div>
  )
}

export function SegmentedField<T extends string | number | boolean>({ label, ...props }: Omit<SegmentedProps<T>, 'label'> & { label: string }) {
  return (
    <SettingRow label={label}>
      <Segmented label={label} {...props} />
    </SettingRow>
  )
}
