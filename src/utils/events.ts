export const TABLE_FLIP_EVENT = 'shogigym:tableflip'

export const SNAPSHOT_EVENT = 'shogigym:snapshot'

export const VIEWER_EVENT = 'shogigym:viewer'

export const SNAPSHOT_NAME = 'shogi-gym'

export const flipTable = () => globalThis.dispatchEvent(new Event(TABLE_FLIP_EVENT))

export const saveBoardImage = (name: string) => globalThis.dispatchEvent(new CustomEvent(SNAPSHOT_EVENT, { detail: name }))

export const openPieceViewer = () => globalThis.dispatchEvent(new Event(VIEWER_EVENT))
