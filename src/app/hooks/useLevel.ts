import { useState } from 'react'
import type { Level } from '@/app/types'

const LEVEL_KEY = 'joseki-practice:level:v1'

function storedLevel() {
  try {
    return localStorage.getItem(LEVEL_KEY)
  } catch {
    return undefined
  }
}

export function useLevel() {
  const [level, setLevelState] = useState<Level>(() => (storedLevel() === 'rules' ? 'rules' : 'new'))
  const [welcome, setWelcome] = useState(() => storedLevel() === null)
  const setLevel = (next: Level) => {
    setWelcome(false)
    setLevelState(next)
    try {
      localStorage.setItem(LEVEL_KEY, next)
    } catch (error) {
      console.warn('level not persisted', error)
    }
  }
  const finishWelcome = () => setLevel(level)
  return { level, previewLevel: setLevelState, setLevel, welcome, finishWelcome }
}
