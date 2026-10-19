import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { buildUnit, type Node, type Unit } from '/home/user/shogigym/scripts/lessons/unit'
const set = new Set<string>()
const rows: string[] = []
const norm = (s: string) => s.split(' ').slice(0, 3).join(' ') + ' 1'
for (const f of readdirSync('/home/user/shogigym/data/lessons/units')) {
  const u = JSON.parse(readFileSync(`/home/user/shogigym/data/lessons/units/${f}`, 'utf8')) as Unit
  buildUnit(u).forEach((c) => {
    const walk = (n: Node) => {
      const b = n.sfen.split(' ')[0]
      if (b.includes('K') && b.includes('k')) set.add(norm(n.sfen))
      n.branches.forEach((br) => walk(br.child))
    }
    walk(c.root)
  })
}
const all = [...set]
for (let i = 0; i < 3; i++) writeFileSync(`/tmp/claude-0/-home-user-shogigym/4fdf910f-1b77-596a-a3f6-07eb3e8689ce/scratchpad/audit/sf${i}.txt`, all.filter((_, j) => j % 3 === i).join('\n') + '\n')
console.log(all.length)
