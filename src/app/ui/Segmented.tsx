import '@/app/ui/dialog.css'
import type { ReactNode } from 'react'
import { cx } from './cx'

interface Option<T> {
  v: T
  t: ReactNode
  title?: string
}
interface SegmentedProps<T> {
  value: T
  options: Option<T>[]
  onChange: (v: T) => void
  label?: string
  size?: 'small' | 'big'
  className?: string
}

export function Segmented<T extends string | number | boolean>({ value, options, onChange, label, size, className }: SegmentedProps<T>) {
  return (
    <fieldset className={cx('app-seg', size, className)} aria-label={label}>
      {options.map((o) => (
        <button
          key={String(o.v)}
          type="button"
          className={value === o.v ? 'on' : ''}
          aria-pressed={value === o.v}
          title={o.title}
          onClick={() => onChange(o.v)}
        >
          {o.t}
        </button>
      ))}
    </fieldset>
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
