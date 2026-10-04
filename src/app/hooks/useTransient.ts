import { useEffect, useState } from 'react'

export function useTransient<T>(ms: number) {
  const [value, setValue] = useState<T | null>(null)
  useEffect(() => {
    if (!value) return
    const timer = setTimeout(() => setValue(null), ms)
    return () => clearTimeout(timer)
  }, [value, ms])
  return [value, setValue] as const
}
