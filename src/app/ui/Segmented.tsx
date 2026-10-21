import type { ReactNode } from 'react'
import { Grid, styled } from 'styled-system/jsx'
import { SegmentGroup } from '@/components/ui'
import { cx } from './cx'

type Option<T> = { v: T; t: ReactNode; title?: string }
type SegmentedProps<T> = { value: T; options: Option<T>[]; onChange: (v: T) => void; label?: string; size?: 'small' | 'big'; className?: string }

const sizes = { small: 'sm', big: 'lg' } as const

export function Segmented<T extends string | number | boolean>({ value, options, onChange, label, size, className }: SegmentedProps<T>) {
  return (
    <SegmentGroup.Root
      className={cx('app-seg', size, className)}
      css={{
        '.app-settings [data-setting] > &': { justifyContent: 'flex-end', justifySelf: 'end', _phone: { justifyContent: 'flex-start', justifySelf: 'start' } },
      }}
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

export function SettingRow({ label, alignTop, children }: { label: ReactNode; alignTop?: boolean; children: ReactNode }) {
  return (
    <Grid
      data-setting=""
      gridTemplateColumns="minmax(110px, 30%) 1fr"
      alignItems={alignTop ? 'start' : 'center'}
      gap="3"
      py="2.5"
      fontSize="sm"
      _phone={{ gridTemplateColumns: '1fr', gap: '1.5' }}
      css={{
        '.app-settings &': { '&:not(:first-child)': { borderTop: '1px solid {colors.border}' } },
      }}
    >
      <styled.span color="fg.muted" fontWeight="medium" pt={alignTop ? '1' : undefined}>
        {label}
      </styled.span>
      {children}
    </Grid>
  )
}

export function SegmentedField<T extends string | number | boolean>({
  label,
  alignTop,
  ...props
}: Omit<SegmentedProps<T>, 'label'> & { label: string; alignTop?: boolean }) {
  return (
    <SettingRow label={label} alignTop={alignTop}>
      <Segmented label={label} {...props} />
    </SettingRow>
  )
}
