export function flipBookMove(usi: string) {
  return usi.replace(/([1-9])([a-i])/g, (_, file: string, rank: string) => `${10 - Number(file)}${String.fromCharCode(202 - rank.charCodeAt(0))}`)
}

const swap = (value: string) => value.replace(/[a-zA-Z]/g, (letter) => (letter === letter.toUpperCase() ? letter.toLowerCase() : letter.toUpperCase()))
export function flipBookPosition(sfen: string) {
  const [board, turn, hand, ply = '1'] = sfen.split(' ')
  const rotated = board
    .split('/')
    .toReversed()
    .map((rank) => (rank.match(/\+?[a-zA-Z]|[1-9]/g) ?? []).toReversed().map(swap).join(''))
    .join('/')
  return `${rotated} ${turn === 'b' ? 'w' : 'b'} ${swap(hand)} ${ply}`
}
export function bookPosition(sfen: string) {
  let [board, turn, hand] = sfen.split(' ')
  const flipped = turn === 'w'
  if (flipped) {
    ;[board, turn, hand] = flipBookPosition(sfen).split(' ')
  }
  const counts = new Map([...hand.matchAll(/(\d*)([a-zA-Z])/g)].map((match) => [match[2], Number(match[1] || 1)]))
  hand = [...'RBGSNLPrbgsnlp'].map((piece) => (counts.has(piece) ? `${counts.get(piece)! > 1 ? counts.get(piece) : ''}${piece}` : '')).join('') || '-'
  return { key: `${board} ${turn} ${hand}`, flipped }
}

export function bookShard(key: string) {
  let hash = 2166136261
  for (let i = 0; i < key.length; i++) hash = Math.imul(hash ^ key.charCodeAt(i), 16777619)
  return (hash >>> 0) % 64
}
