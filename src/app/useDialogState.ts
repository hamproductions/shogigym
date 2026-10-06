import { useState, type Dispatch, type SetStateAction } from 'react'
import type { Confirm } from '@/app/types'

export interface DialogState {
  palette: boolean
  setPalette: Dispatch<SetStateAction<boolean>>
  showSettings: boolean
  setShowSettings: Dispatch<SetStateAction<boolean>>
  showViewer: boolean
  setShowViewer: Dispatch<SetStateAction<boolean>>
  confirm: Confirm | null
  setConfirm: Dispatch<SetStateAction<Confirm | null>>
}

/** Open/closed state of the application-level dialogs that are not tied to a mode. */
export function useDialogState(): DialogState {
  const [palette, setPalette] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showViewer, setShowViewer] = useState(false)
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  return { palette, setPalette, showSettings, setShowSettings, showViewer, setShowViewer, confirm, setConfirm }
}
