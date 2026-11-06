type TeachingNode = { figures?: unknown[]; branches: { usi: string; kind: string; child?: TeachingNode | null }[] }

export function lessonLeadIn(root: TeachingNode) {
  const moves: string[] = []
  let node = root
  while (!node.figures?.length) {
    const branch =
      node.branches.find((branch) => branch.kind === 'main' && branch.child) ?? node.branches.find((branch) => branch.kind !== 'deviation' && branch.child)
    if (!branch?.child) return []
    moves.push(branch.usi)
    node = branch.child
  }
  return moves
}
