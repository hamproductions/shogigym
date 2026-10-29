export function positionHash(sfen: string) {
  const board = sfen.split(' ').slice(0, 3).join(' ')
  let hash = 0x811c9dc5
  for (let i = 0; i < board.length; i++) hash = Math.imul(hash ^ board.charCodeAt(i), 0x01000193)
  return (hash >>> 0).toString(36)
}
