import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { styled } from 'styled-system/jsx'
import { Dialog, Text } from '@/components/ui'
import type { Command } from './commands'

export function Palette({ commands, onClose }: { commands: (q: string) => Command[]; onClose: () => void }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const items = commands(query)
  const run = (c: Command | undefined) => {
    if (!c) return
    c.run()
    onClose()
  }
  return (
    <Dialog.Root
      open
      initialFocusEl={() => input.current}
      onOpenChange={({ open }) => {
        if (!open) onClose()
      }}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner alignItems="flex-start" px="4" pb="4" pt="12vh" _tight={{ px: '3', pb: '3' }}>
        <Dialog.Content
          aria-label={t('palette.commandPalette')}
          w="min(600px, 100%)"
          maxH="64vh"
          display="flex"
          flexDirection="column"
          p="0"
          bg="panel"
          overflow="hidden"
        >
          <styled.input
            ref={input}
            value={query}
            placeholder={t('palette.searchLinesTypeAMove')}
            onChange={(e) => {
              setQuery(e.target.value)
              setIndex(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') setIndex((i) => Math.min(items.length - 1, i + 1))
              else if (e.key === 'ArrowUp') setIndex((i) => Math.max(0, i - 1))
              else if (e.key === 'Enter') run(items[index])
            }}
            p="4"
            border="0"
            borderBottom="1px solid {colors.border}"
            bg="transparent"
            color="fg.default"
            font="inherit"
            fontSize="md"
            outline="none"
            _placeholder={{ color: 'fg.muted' }}
            _focusVisible={{ outline: '2px solid {colors.focus}', outlineOffset: '-2px' }}
          />
          <styled.ul m="0" p="1.5" listStyle="none" overflowY="auto">
            {items.map((c, i) => (
              <li key={c.id}>
                <styled.button
                  display="flex"
                  justifyContent="space-between"
                  gap="4"
                  w="100%"
                  py="2.5"
                  px="3"
                  borderRadius="md"
                  textAlign="left"
                  bg={i === index ? 'surface.2' : undefined}
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => run(c)}
                >
                  <span>{c.label}</span>
                  {c.hint && (
                    <Text as="span" tone="muted" size="sm">
                      {c.hint}
                    </Text>
                  )}
                </styled.button>
              </li>
            ))}
            {items.length === 0 && (
              <styled.li color="fg.muted" fontSize="sm" p="3">
                {t('palette.noMatchTryALine')}
              </styled.li>
            )}
          </styled.ul>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
