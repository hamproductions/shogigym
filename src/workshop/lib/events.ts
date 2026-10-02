export const flipTable = () => window.dispatchEvent(new Event('shogilab:tableflip'))

export const saveBoardImage = (name: string) => window.dispatchEvent(new CustomEvent('shogilab:snapshot', { detail: name }))

export const VIEWER_EVENT = 'shogilab:viewer'

export const openPieceViewer = () => window.dispatchEvent(new Event(VIEWER_EVENT))
