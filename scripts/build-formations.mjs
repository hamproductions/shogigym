import { writeFile } from 'node:fs/promises'

const revision = '6af8674c32d80af755d9aeffd0621d3b9f615b5e'
const base = `https://raw.githubusercontent.com/akicho8/bioshogi/${revision}/lib/bioshogi/analysis/`
const sources = await Promise.all(
  ['shape_info.rb', 'attack_info.rb', 'defense_info.rb', 'note_info.rb', 'technique_info.rb'].map(async (file) => {
    const response = await fetch(base + file)
    if (!response.ok) throw new Error(`${file}: ${response.status}`)
    return (await response.text()).replace(/^\s*#.*$/gm, '')
  }),
)
const shapes = new Map([...sources[0].matchAll(/key: "([^"]+)"[\s\S]*?body: <<~EOT,?\n([\s\S]*?)\nEOT/g)].map((match) => [match[1], match[2]]))
const pieces = {
  歩: 'P',
  香: 'L',
  桂: 'N',
  銀: 'S',
  金: 'G',
  角: 'B',
  飛: 'R',
  玉: 'K',
  王: 'K',
  と: '+P',
  杏: '+L',
  圭: '+N',
  全: '+S',
  馬: '+B',
  龍: '+R',
  竜: '+R',
}
const ranks = '一二三四五六七八九'
const fields = [
  'turn_max',
  'turn_eq',
  'order_key',
  'has_pawn_then_skip',
  'kill_only',
  'drop_only',
  'has_other_pawn_then_skip',
  'outbreak_skip',
  'kill_count_lteq',
  'hold_piece_empty',
  'preset_is',
  'parent',
  'add_to_self',
  'add_to_opponent',
]
const kindFor = (index, name) => {
  if (index === 1) return 'castle'
  return index >= 2 && !['居飛車', '振り飛車'].includes(name) ? 'technique' : 'strategy'
}
const parseValue = (value) => {
  if (value === 'true') return true
  if (value === 'false') return false
  return /^\d+$/.test(value) ? Number(value) : value.replace(/^:|"/g, '')
}
const rules = []
const missing = []
const definitions = []
for (const [index, source] of sources.slice(1).entries()) {
  for (const line of source.split('\n').filter((entry) => /^\s*\{ key:/.test(entry))) {
    const [, name] = line.match(/key: "([^"]+)"/)
    const definition = { name, kind: kindFor(index, name) }
    for (const field of ['add_to_self', 'add_to_opponent']) {
      const value = line.match(new RegExp(`${field}:\\s*"([^"]+)"`))?.[1]
      if (value) definition[field] = value
    }
    definitions.push(definition)
    const body = shapes.get(name)
    if (!body) {
      missing.push(name)
      continue
    }
    const cells = []
    let rank = 0
    for (const row of body.split('\n')) {
      const match = row
        .replace(/\s*#.*$/, '')
        .trim()
        .match(/^\|(.*)\|([一二三四五六七八九])?$/)
      if (!match) continue
      rank = match[2] ? ranks.indexOf(match[2]) + 1 : rank + 1
      const tokens = [...match[1].matchAll(/([ v!@*?~^])([^ v!@*?~^])/g)]
      if (tokens.length !== 9) throw new Error(`${name}: unsupported board row ${row}`)
      tokens.forEach((token, column) => {
        if (token[2] === '・') return
        if (!pieces[token[2]] && !'●○★☆◆■□◇'.includes(token[2])) throw new Error(`${name}: ${token[0]}`)
        cells.push([9 - column, rank, token[1].trim(), pieces[token[2]] ?? token[2]])
      })
    }
    const rule = { name, kind: kindFor(index, name), cells }
    if (index === 0) rule.preset_is = 'hirate_like'
    for (const field of fields) {
      const value = line.match(new RegExp(`${field}:\\s*(nil|true|false|\\d+|:[\\w]+|"[^"]+")`))?.[1]
      if (value && value !== 'nil') rule[field] = parseValue(value)
    }
    for (const field of ['hold_piece_eq', 'op_hold_piece_eq', 'hold_piece_in', 'hold_piece_not_in']) {
      const value = line.match(new RegExp(`${field}:\\s*"([^"]+)"`))?.[1]
      if (value) rule[field] = Object.fromEntries([...value.matchAll(/([歩香桂銀金角飛])(\d*)/g)].map((match) => [pieces[match[1]], Number(match[2] || 1)]))
    }
    rules.push(rule)
  }
}
await writeFile(
  'src/data/formations.json',
  `${JSON.stringify({ source: 'akicho8/bioshogi', revision, license: 'AGPL-3.0', rules, definitions, custom: missing }, null, 2)}\n`,
)
console.log(`${rules.length} shape rules; ${missing.length} non-shape definitions`)
