type Branch = { kind: string; child?: DerivableNode | null }
type DerivableNode = { branches: Branch[] }
type DerivableCourse = { id: string; title: string; goalFormation?: string; source?: string; root: DerivableNode }

export const DERIVED: { id: string; from: string; start: number; end: number; title: string; goalFormation: string }[] = [
  {
    id: 'sabaki--kuboryu',
    from: 'shikenbisha-vs-bougin--kuboryu',
    start: 37,
    end: 48,
    title: '捌き: 棒銀に△4五歩から捌く(久保流)',
    goalFormation: '△4五歩で角道を開けて捌き、角を成り込み、守りの銀を4五へ捌く。',
  },
  {
    id: 'sabaki--torisashi',
    from: 'shikenbisha-vs-torisashi--basic',
    start: 19,
    end: 22,
    title: '捌き: 軽く捌かず手厚く受ける(鳥刺し)',
    goalFormation: '鳥刺しには△3二銀型のまま軽く捌かず、△4三銀から手厚く受け止める。',
  },
]

function cut<N extends DerivableNode>(node: N, depth: number): N {
  const main = node.branches.find((b) => b.kind === 'main') ?? node.branches.find((b) => b.kind !== 'deviation')
  if (depth <= 0) return { ...node, branches: [] }
  return { ...node, branches: node.branches.map((b) => (b === main && b.child ? { ...b, child: cut(b.child, depth - 1) } : b)) }
}

export function derive<C extends DerivableCourse>(base: C, spec: (typeof DERIVED)[number]): C {
  let node: DerivableNode = base.root
  for (let i = 0; i < spec.start; i++) {
    const next = node.branches.find((b) => b.kind === 'main') ?? node.branches.find((b) => b.kind !== 'deviation')
    if (!next?.child) break
    node = next.child
  }
  return {
    ...base,
    id: spec.id,
    title: spec.title,
    goalFormation: spec.goalFormation,
    source: `${base.title}の${spec.start + 1}手目から${spec.end}手目までを切り出したもの。手順と解説は元のコースと同じ出典(${base.source ?? 'Shiryu181/shogi-joseki'})。`,
    root: cut(node, spec.end - spec.start),
  }
}
