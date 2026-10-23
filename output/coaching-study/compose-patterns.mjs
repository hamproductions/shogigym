import { readFileSync, writeFileSync } from 'node:fs'

const base = new URL('./', import.meta.url)
const load = (name) => JSON.parse(readFileSync(new URL(name, base), 'utf8'))
const taxonomy = load('categories.json')
const basePatterns = load('patterns-basics-skills.json')
const josekiInput = load('patterns-joseki.json')
const josekiPatterns = Array.isArray(josekiInput) ? josekiInput : josekiInput.patterns
const strategyInput = load('patterns-strategies.json')
const patterns = [
  ...basePatterns.map((p) => ({ ...p, layer: 'guide-group' })),
  ...josekiPatterns.map((p) => ({ ...p, layer: 'guide-group' })),
  ...strategyInput.sharedCorePatterns.map((p) => ({ ...p, category: 'joseki', layer: 'strategy-shared-core' })),
  ...strategyInput.overlays.map((p) => ({ ...p, category: 'joseki', layer: 'strategy-overlay' })),
]
const samples = load('randomized/samples.json')
const sampleIds = new Set(samples.map((s) => s.id))
if (new Set(patterns.map((p) => p.id)).size !== patterns.length) throw new Error('Duplicate pattern ID')
for (const p of patterns) {
  for (const key of ['id', 'category', 'group', 'title', 'intent', 'trigger', 'requires', 'templateJa', 'forbiddenClaims', 'sampleIds', 'status'])
    if (!p[key]) throw new Error(`${p.id}: missing ${key}`)
  if (p.sampleIds.some((id) => !sampleIds.has(id))) throw new Error(`${p.id}: unknown sample`)
  p.coverage = { mechanismSampleIds: p.sampleIds, namedStrategyRecognitionVerified: false, runtimeBindingVerified: false }
}
const groups = taxonomy.categories.flatMap((c) =>
  c.groups.map((g) => {
    const rows = patterns.filter((p) => p.layer === 'guide-group' && p.category === c.id && p.group === g.name)
    const expected = g.sourceUnitCount > 0 ? 3 : 2
    if (rows.length !== expected) throw new Error(`Group coverage ${c.id}/${g.name}: ${rows.length}`)
    return {
      category: c.id,
      group: g.name,
      sourceUnits: g.sourceUnitCount,
      currentlyPopulated: g.sourceUnitCount > 0,
      patternIds: rows.map((p) => p.id),
      mechanismExamples: [...new Set(rows.flatMap((p) => p.sampleIds))],
    }
  }),
)
const selectors = taxonomy.strategySelector.entries.map((s) => {
  const overlay = patterns.filter((p) => p.layer === 'strategy-overlay' && p.strategyId === s.id)
  if (overlay.length !== 1) throw new Error(`Selector coverage ${s.id}`)
  const group = s.lessonDisplayGroup ?? 'joseki-core'
  const parent = patterns.filter((p) => p.category === 'joseki' && p.group === group && p.layer !== 'strategy-overlay')
  if (parent.length !== 3) throw new Error(`Selector base coverage ${s.id}/${group}`)
  return { id: s.id, title: s.title.ja, group, basePatternIds: parent.map((p) => p.id), overlayPatternId: overlay[0].id, namedGameEvidence: false }
})
const coverage = {
  topCategories: taxonomy.categories.map((c) => c.id),
  populatedGroups: groups.filter((g) => g.currentlyPopulated).length,
  reservedGroups: groups.filter((g) => !g.currentlyPopulated).length,
  selectorOnlyGroups: ['角交換振り飛車'],
  strategySelectors: selectors.length,
  patternCount: patterns.length,
  patternsWithMechanismSamples: patterns.filter((p) => p.sampleIds.length).length,
  patternsWithoutMechanismSamples: patterns.filter((p) => !p.sampleIds.length).length,
  groups,
  selectors,
  interpretation:
    'Template/category coverage is exhaustive for the inventoried hierarchy. Game examples cover mechanisms only; named-opening recognition and runtime integration are not verified.',
}
const catalog = {
  provenance: 'Original coaching template designs grounded in the existing guide taxonomy; not executable coaching or tiny-model output.',
  globalGates: [
    'Every slot requires verified position or session facts; missing facts suppress the pattern.',
    'Never infer strategy from an arbitrary midgame SFEN.',
    'A sample mapping is mechanism evidence only; it is not proof of a guide/course match.',
    'Apply spoiler visibility, position freshness, repetition suppression and audio cancellation to all patterns.',
    'Captured promoted pieces revert to their unpromoted kind in hand.',
    'Scores, geometric attacks, legal captures and forced results are distinct proof levels.',
  ],
  patterns,
}
writeFileSync(new URL('pattern-catalog.json', base), JSON.stringify(catalog, null, 2) + '\n')
writeFileSync(new URL('coverage.json', base), JSON.stringify(coverage, null, 2) + '\n')
const cell = (s) => String(s).replaceAll('|', '／').replaceAll('\n', ' ')
const lines = [
  '# ガイド別コーチ発話パターン集',
  '',
  '既存ガイドの分類を保ち、各グループに異なる説明の型を定義する。すべて未実装の設計用テンプレートであり、{} は検証済み事実を入れる欄。値が不足した型は発話しない。',
  '',
  '[実際のランダム開始・棋力設定の対局サンプル](randomized/SAMPLES.md) · [パターンJSON](pattern-catalog.json) · [分類と実例の対応](coverage.json) · [調査と選択規則](PATTERNS.md)',
  '',
  '実例IDは説明の仕組みを示す。特定の戦法・囲いの認識や教材との一致が検証されたという意味ではない。',
]
for (const c of taxonomy.categories) {
  lines.push('', `## ${c.name.ja}`)
  for (const group of groups.filter((g) => g.category === c.id)) {
    lines.push(
      '',
      `### ${group.group}${group.currentlyPopulated ? '' : '（設定のみ・現在は非表示）'}`,
      '',
      '| 型 | 発話テンプレート | 主な発火条件 | 実例 |',
      '| --- | --- | --- | --- |',
    )
    for (const p of patterns.filter((p) => p.layer === 'guide-group' && p.category === c.id && p.group === group.group))
      lines.push(
        `| ${cell(p.title)} | ${cell(p.templateJa)} | ${cell(p.trigger)} | ${p.sampleIds.length ? p.sampleIds.map((id) => `[${id}](randomized/SAMPLES.md#${id})`).join('、') : '未取得'} |`,
      )
  }
}
lines.push('', '### 角交換振り飛車（戦法選択あり・対応する教材グループは現在未収録）', '', '| 型 | 発話テンプレート |', '| --- | --- |')
for (const p of patterns.filter((p) => p.layer === 'guide-group' && p.group === '角交換振り飛車')) lines.push(`| ${cell(p.title)} | ${cell(p.templateJa)} |`)
lines.push('', '### 教材グループへの対応がない戦法の共通基礎', '', '| 型 | 発話テンプレート |', '| --- | --- |')
for (const p of strategyInput.sharedCorePatterns) lines.push(`| ${cell(p.title)} | ${cell(p.templateJa)} |`)
lines.push(
  '',
  '## 37の戦法別追加パターン',
  '',
  '上の対応グループの3種類と、以下の戦法固有の1種類を組み合わせる。戦法名は選択中の教材や検証済みの棋譜履歴から取得する。今回の対局を37戦法の実例として割り当ててはいない。',
  '',
  '| 戦法 | 共通グループ | 固有の型 | 発話テンプレート |',
  '| --- | --- | --- | --- |',
)
for (const s of selectors) {
  const p = patterns.find((p) => p.id === s.overlayPatternId)
  lines.push(`| ${cell(s.title)} | ${cell(s.group)} | ${cell(p.title)} | ${cell(p.templateJa)} |`)
}
lines.push(
  '',
  '## 根拠が不足する型',
  '',
  '未取得の実例は空欄を架空の局面で埋めず、coverage.jsonで追跡する。特に囲いの認識・守備駒除去・全退路比較・詰めろと必至・定跡分岐・駒落ちの初期配置・本人の復習履歴は、今回の対局から確定していない。',
  '',
  `分類の設計網羅：既存の大分類${taxonomy.categories.length}、教材グループ${coverage.populatedGroups}、設定のみ${coverage.reservedGroups}、戦法選択${selectors.length}。全${patterns.length}パターン。発話の実装・小型モデルの品質を示す数値ではない。`,
)
writeFileSync(new URL('PATTERN_CATALOG.md', base), lines.join('\n') + '\n')
console.log(
  JSON.stringify({
    patterns: patterns.length,
    populatedGroups: coverage.populatedGroups,
    reservedGroups: coverage.reservedGroups,
    selectors: selectors.length,
    mechanismExamples: coverage.patternsWithMechanismSamples,
    result: 'pass',
  }),
)
