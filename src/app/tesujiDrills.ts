import data from '@/data/tesuji-drills.json'

export interface TesujiDrill {
  id: string
  tesuji: string
  en: string
  explain: string
  sfen: string
  answer: string
  from: string
  note?: string
}

export const TESUJI_DRILLS = data as TesujiDrill[]

const KIND_COUNTS = new Map<string, number>()
for (const d of TESUJI_DRILLS) KIND_COUNTS.set(d.tesuji, (KIND_COUNTS.get(d.tesuji) ?? 0) + 1)

export const TESUJI_KINDS = [...KIND_COUNTS.keys()].toSorted((a, b) => KIND_COUNTS.get(b)! - KIND_COUNTS.get(a)!)

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

export function pickTesuji(filter: string, exclude?: string): TesujiDrill | undefined {
  const pool = TESUJI_DRILLS.filter((d) => (filter === 'all' || d.tesuji === filter) && d.id !== exclude)
  const solved = new Set(tesujiStats().solved)
  const fresh = pool.filter((d) => !solved.has(d.id))
  const from = fresh.length ? fresh : pool
  return from[Math.floor(Math.random() * from.length)]
}
