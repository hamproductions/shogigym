import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Command } from './commands'

export function Palette({ commands, onClose }: { commands: (q: string) => Command[]; onClose: () => void }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const items = commands(query)
  useEffect(() => input.current?.focus(), [])
  const run = (c: Command | undefined) => {
    if (!c) return
    c.run()
    onClose()
  }
  return (
    <div className="ws-palette-back" onPointerDown={onClose}>
      <div className="ws-palette" onPointerDown={(e) => e.stopPropagation()} role="dialog" aria-label={t('palette.commandPalette')}>
        <input
          ref={input}
          value={query}
          placeholder={t('palette.searchLinesTypeAMove')}
          onChange={(e) => {
            setQuery(e.target.value)
            setIndex(0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
            else if (e.key === 'ArrowDown') setIndex((i) => Math.min(items.length - 1, i + 1))
            else if (e.key === 'ArrowUp') setIndex((i) => Math.max(0, i - 1))
            else if (e.key === 'Enter') run(items[index])
          }}
        />
        <ul>
          {items.map((c, i) => (
            <li key={c.id}>
              <button className={i === index ? 'on' : ''} onMouseEnter={() => setIndex(i)} onClick={() => run(c)}>
                <span>{c.label}</span>
                {c.hint && <span className="ws-muted">{c.hint}</span>}
              </button>
            </li>
          ))}
          {items.length === 0 && <li className="ws-muted ws-empty">{t('palette.noMatchTryALine')}</li>}
        </ul>
      </div>
    </div>
  )
}
