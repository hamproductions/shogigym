import { Portal } from '@ark-ui/react/portal'
import { createListCollection } from '@ark-ui/react/select'
import { useMemo } from 'react'
import { Select as ParkSelect } from '@/components/ui'

type Option = { value: string; label: string }
type Group = { label: string; options: Option[] }
type SelectProps = {
  value: string
  onChange: (value: string) => void
  label: string
  options?: Option[]
  groups?: Group[]
  className?: string
  portal?: boolean
}

const EMPTY = '\u0000'
const encode = (value: string) => (value === '' ? EMPTY : value)
const decode = (value: string) => (value === EMPTY ? '' : value)

export function Select({ value, onChange, label, options = [], groups = [], className, portal = true }: SelectProps) {
  const collection = useMemo(
    () => createListCollection({ items: [...options, ...groups.flatMap((g) => g.options)].map((o) => ({ value: encode(o.value), label: o.label })) }),
    [options, groups],
  )
  const item = (o: Option) => {
    const entry = { value: encode(o.value), label: o.label }
    return (
      <ParkSelect.Item key={entry.value} item={entry}>
        <ParkSelect.ItemText>{o.label}</ParkSelect.ItemText>
        <ParkSelect.ItemIndicator />
      </ParkSelect.Item>
    )
  }
  return (
    <ParkSelect.Root
      collection={collection}
      value={[encode(value)]}
      positioning={{ strategy: 'fixed', sameWidth: false }}
      onValueChange={({ value: next }) => next[0] !== undefined && onChange(decode(next[0]))}
      className={className}
    >
      <ParkSelect.Control>
        <ParkSelect.Trigger aria-label={label}>
          <ParkSelect.ValueText />
          <ParkSelect.Indicator />
        </ParkSelect.Trigger>
      </ParkSelect.Control>
      <Portal disabled={!portal}>
        <ParkSelect.Positioner>
          <ParkSelect.Content>
            {options.map(item)}
            {groups.map((g) => (
              <ParkSelect.ItemGroup key={g.label}>
                <ParkSelect.ItemGroupLabel>{g.label}</ParkSelect.ItemGroupLabel>
                {g.options.map(item)}
              </ParkSelect.ItemGroup>
            ))}
          </ParkSelect.Content>
        </ParkSelect.Positioner>
      </Portal>
      <ParkSelect.HiddenSelect />
    </ParkSelect.Root>
  )
}
