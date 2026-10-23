import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const base = new URL('./', import.meta.url)
const load = (dir, name) => JSON.parse(readFileSync(new URL(dir + name, base), 'utf8'))
for (const dir of ['', 'randomized/']) {
  const facts = load(dir, 'facts.json')
  const games = load(dir, 'games.json')
  const samples = [...load(dir, 'samples-a.json'), ...load(dir, 'samples-b.json')]
  const ids = new Set(samples.map((x) => x.id))
  if (ids.size !== samples.length || facts.length !== samples.length || facts.some((f) => !ids.has(f.id))) throw new Error('Sample coverage mismatch')
  const sorted = facts.map((f) => ({
    ...samples.find((s) => s.id === f.id),
    sourceMove: f.usi,
    sourceFactsSha256: createHash('sha256').update(JSON.stringify(f)).digest('hex'),
  }))
  writeFileSync(new URL(dir + 'samples.json', base), JSON.stringify(sorted, null, 2) + '\n')
  const lines = [
    '# 局面別コーチ発話サンプル',
    '',
    dir
      ? '実際のYaneuraOu対局。開始12手は合法な候補から乱択し、各側のSkillLevelを指定した。全4対局が詰みで終了した。'
      : '固定した開始列によるパイロット。追加のランダム開始・SkillLevel対局とは別の資料。',
    '',
    '発話はセッション内モデルによる候補を局面と照合したもの。小型モデルや外部APIの測定結果ではない。根拠の棋譜・解析は同じディレクトリの games.json / facts.json に保存。',
    '',
    '| 対局 | 先手SkillLevel | 後手SkillLevel | 手数 | 終了 |',
    '| --- | ---: | ---: | ---: | --- |',
  ]
  for (const g of games)
    lines.push(
      `| ${g.id} | ${g.strength?.black ?? '未指定'} | ${g.strength?.white ?? '未指定'} | ${g.plies} | ${g.termination.startsWith('checkmate') ? '詰み' : '100手で打切り・勝敗未判定'} |`,
    )
  for (const sample of sorted) {
    const fact = facts.find((f) => f.id === sample.id)
    const visibility = typeof sample.visibility === 'string' ? sample.visibility : `短文: ${sample.visibility.short} / 詳細: ${sample.visibility.detail}`
    lines.push(
      '',
      `## ${sample.id}`,
      '',
      `着手：${fact.notationJa}`,
      '',
      `型：${sample.family}`,
      '',
      `**短い発話**：${sample.short}`,
      '',
      `**詳しい説明**：${sample.detail}`,
      '',
      `表示条件：${visibility}`,
      '',
      `根拠：${sample.evidence.join('、')}`,
      '',
      `控えた解釈：${sample.withheld.join('、')}`,
      '',
      '着手前SFEN：',
      '',
      '```text',
      fact.sfenBefore,
      '```',
      '',
      `実着手USI：\`${fact.usi}\``,
    )
  }
  writeFileSync(new URL(dir + 'SAMPLES.md', base), lines.join('\n') + '\n')
  for (const g of games) writeFileSync(new URL(dir + g.id + '.usi', base), 'position startpos moves ' + g.moves.map((m) => m.usi).join(' ') + '\n')
  console.log(`${dir || 'pilot/'}: ${sorted.length} samples rendered`)
}
