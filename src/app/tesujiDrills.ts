export type TesujiDrill = {
  id: string
  tesuji: string
  en: string
  explain: string
  explainJa?: string
  sfen: string
  answer: string
  from: string
  note?: string
}

let drills: TesujiDrill[] = []
let kinds: string[] = []
let drillsLoad: Promise<TesujiDrill[]> | null = null

export function loadTesujiDrills() {
  if (!drillsLoad) {
    drillsLoad = import('@/data/tesuji-drills.json').then((module) => {
      drills = module.default as TesujiDrill[]
      const count = (kind: string) => drills.filter((d) => d.tesuji === kind).length
      kinds = [...new Set(drills.map((d) => d.tesuji))].sort((a, b) => count(b) - count(a))
      return drills
    })
    drillsLoad.catch(() => (drillsLoad = null))
  }
  return drillsLoad
}

export const tesujiDrills = () => drills

export const tesujiKinds = () => kinds

const KEY = 'joseki-practice:tesuji:v1'

export function tesujiStats(): { solved: string[]; failed: string[] } {
  try {
    return { solved: [], failed: [], ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return { solved: [], failed: [] }
  }
}

export function markTesuji(id: string, firstTry: boolean) {
  const s = tesujiStats()
  const next = firstTry ? { ...s, solved: [...new Set([...s.solved, id])] } : { ...s, failed: [...new Set([...s.failed, id])] }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch (error) {
    console.warn('tesuji stats not persisted', error)
  }
}

const GROUPS: Record<string, string[]> = { 両取り: ['両取り', 'ふんどしの桂', '王手飛車取り'] }

export const inTesujiFilter = (drill: TesujiDrill, filter: string) => filter === 'all' || (GROUPS[filter] ?? [filter]).includes(drill.tesuji)

export async function pickTesuji(filter: string, exclude?: string): Promise<TesujiDrill | undefined> {
  const pool = (await loadTesujiDrills()).filter((d) => inTesujiFilter(d, filter) && d.id !== exclude)
  const solved = new Set(tesujiStats().solved)
  const fresh = pool.filter((d) => !solved.has(d.id))
  const from = fresh.length ? fresh : pool
  return from[Math.floor(Math.random() * from.length)]
}
