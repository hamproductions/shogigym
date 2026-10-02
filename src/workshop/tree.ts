export type Tree = { usi: string; children: Tree[] }

export const emptyTree = (): Tree => ({ usi: '', children: [] })

export function addPath(root: Tree, moves: string[]): Tree {
  let changed = false
  const walk = (node: Tree, i: number): Tree => {
    if (i >= moves.length) return node
    const at = node.children.findIndex((c) => c.usi === moves[i])
    if (at < 0) {
      changed = true
      return { ...node, children: [...node.children, walk({ usi: moves[i], children: [] }, i + 1)] }
    }
    const next = walk(node.children[at], i + 1)
    if (next === node.children[at]) return node
    const children = [...node.children]
    children[at] = next
    return { ...node, children }
  }
  const result = walk(root, 0)
  return changed ? result : root
}

export function nodeAt(root: Tree, path: string[]): Tree | null {
  let node: Tree | null = root
  for (const usi of path) {
    node = node?.children.find((c) => c.usi === usi) ?? null
    if (!node) return null
  }
  return node
}

export function mainContinuation(node: Tree | null): string[] {
  const out: string[] = []
  while (node && node.children.length) {
    node = node.children[0]
    out.push(node.usi)
  }
  return out
}

export function mainLine(root: Tree): string[] {
  return mainContinuation(root)
}

export function isMainLine(root: Tree, path: string[]): boolean {
  let node: Tree = root
  for (const usi of path) {
    if (node.children[0]?.usi !== usi) return false
    node = node.children[0]
  }
  return true
}

function rebuild(root: Tree, path: string[], edit: (node: Tree) => Tree | null): Tree {
  if (path.length === 0) return edit(root) ?? root
  const [head, ...rest] = path
  return {
    ...root,
    children: root.children.flatMap((c) => {
      if (c.usi !== head) return [c]
      const next = rest.length ? rebuild(c, rest, edit) : edit(c)
      return next ? [next] : []
    }),
  }
}

export const removeBranch = (root: Tree, path: string[]): Tree => rebuild(root, path, () => null)

export function promote(root: Tree, path: string[]): Tree {
  let result = root
  for (let i = 0; i < path.length; i++) {
    const parentPath = path.slice(0, i)
    const usi = path[i]
    result = rebuild(result, parentPath, (node) => {
      const at = node.children.findIndex((c) => c.usi === usi)
      if (at <= 0) return node
      const children = [...node.children]
      const [picked] = children.splice(at, 1)
      return { ...node, children: [picked, ...children] }
    })
  }
  return result
}

export function allLines(root: Tree): string[][] {
  const out: string[][] = []
  const walk = (node: Tree, path: string[]) => {
    if (!node.children.length) {
      if (path.length) out.push(path)
      return
    }
    node.children.forEach((c) => walk(c, [...path, c.usi]))
  }
  walk(root, [])
  return out
}
