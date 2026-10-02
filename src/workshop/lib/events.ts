export const TABLE_FLIP_EVENT = 'shogigym:tableflip'

export const SNAPSHOT_EVENT = 'shogigym:snapshot'

export const VIEWER_EVENT = 'shogigym:viewer'

export const SNAPSHOT_NAME = 'shogi-gym'

export const flipTable = () => window.dispatchEvent(new Event(TABLE_FLIP_EVENT))

export const saveBoardImage = (name: string) => window.dispatchEvent(new CustomEvent(SNAPSHOT_EVENT, { detail: name }))

export const openPieceViewer = () => window.dispatchEvent(new Event(VIEWER_EVENT))
