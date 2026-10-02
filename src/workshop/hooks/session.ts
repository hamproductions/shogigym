import { createContext, useContext } from 'react'
import type { BoardSession } from './useBoardSession'

export const SessionContext = createContext<BoardSession | null>(null)

export function useSession() {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession outside SessionContext')
  return session
}
