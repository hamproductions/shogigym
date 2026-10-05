import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { PHRASES } from './phrases'

const ENGINE = process.env.VOICEVOX_URL ?? 'http://127.0.0.1:50021'
const SPEAKER = Number(process.env.VOICEVOX_SPEAKER ?? 3)
const OUT = 'public/voice/zundamon'
const TMP = join(process.env.TMPDIR ?? '/tmp', 'shogi-gym-voice')

const missingOnly = process.argv.includes('--missing')
const verifyOnly = process.argv.includes('--verify')
const only = process.argv.find((arg) => arg.startsWith('--only='))?.slice(7)
if (!missingOnly && !only && !verifyOnly) rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
mkdirSync(TMP, { recursive: true })

const manifest: Record<string, string> =
  (missingOnly || only || verifyOnly) && existsSync(join(OUT, 'manifest.json')) ? JSON.parse(readFileSync(join(OUT, 'manifest.json'), 'utf8')) : {}
const vowels = [
  'ァアカガサザタダナハバパマャヤラヮワ',
  'ィイキギシジチヂニヒビピミリ',
  'ゥウクグスズツヅヌフブプムュユルヴ',
  'ェエケゲセゼテデネヘベペメレ',
  'ォオコゴソゾトドノホボポモョヨロ',
]
const phonetic = (kana: string) =>
  kana
    .replace(/[^ァ-ヺー]/g, '')
    .replace(/([ァ-ヺ])ー/g, (_, mora: string) => `${mora}${'アイウエオ'[vowels.findIndex((row) => row.includes(mora))] ?? 'ー'}`)
    .replace(/([ォオコゴソゾトドノホボポモョヨロ])ウ/g, '$1オ')
    .replace(/([ェエケゲセゼテデネヘベペメレ])イ/g, '$1エ')
const names = new Set(PHRASES.map(({ text }) => text))
if (names.size !== PHRASES.length) throw new Error('Duplicate voice phrase')
if (!only) for (const text of Object.keys(manifest)) if (!names.has(text)) delete manifest[text]
for (const { text, say, natural } of PHRASES) {
  if (only && text !== only) continue
  const kana = natural ? say : say.replace(/[\u3041-\u3096]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60))
  const response = await fetch(`${ENGINE}/audio_query?speaker=${SPEAKER}&text=${encodeURIComponent(kana)}`, { method: 'POST' })
  if (!response.ok) throw new Error(`Voice query failed for ${text}: ${response.status}`)
  const query = await response.json()
  const spoken = () => query.accent_phrases.flatMap((phrase: { moras: { text: string }[] }) => phrase.moras.map((mora) => mora.text)).join('')
  const correctionNeeded = !natural && phonetic(kana) !== phonetic(spoken())
  if (correctionNeeded) {
    const moras = kana.match(/[ァ-ヺ][ァィゥェォャュョ]?|ー/g) ?? []
    let index = 0
    let corrected = query.kana.replace(/[ァ-ヺ][ァィゥェォャュョ]?|ー/g, () => moras[index++] ?? '')
    if (index !== moras.length) {
      const accent = Math.max(1, Math.min(query.accent_phrases[0].accent, moras.length))
      corrected = `${moras.slice(0, accent).join('')}'${moras.slice(accent).join('')}`
    }
    const response = await fetch(`${ENGINE}/accent_phrases?speaker=${SPEAKER}&is_kana=true&text=${encodeURIComponent(corrected)}`, { method: 'POST' })
    if (!response.ok) throw new Error(`Kana correction failed for ${text}: ${response.status}`)
    query.accent_phrases = await response.json()
    if (phonetic(kana) !== phonetic(spoken())) throw new Error(`Reading mismatch for ${text}: ${kana} → ${spoken()}`)
    console.log(`Corrected engine reading: ${text}`)
  }
  if (verifyOnly) continue
  const name = `${createHash('sha1')
    .update(`${text}\n${say}${correctionNeeded ? '\nforced-kana' : ''}`)
    .digest('hex')
    .slice(0, 10)}.webm`
  if (missingOnly && manifest[text] === name && existsSync(join(OUT, name))) continue
  for (const phrase of query.accent_phrases)
    for (const mora of phrase.moras)
      if (/^[AIUEO]$/.test(mora.vowel)) {
        mora.vowel = mora.vowel.toLowerCase()
        mora.vowel_length = Math.max(mora.vowel_length, 0.09)
        mora.pitch = mora.pitch || 5.6
      }
  Object.assign(query, { speedScale: 1.12, prePhonemeLength: 0.02, postPhonemeLength: 0.16, outputSamplingRate: 24000 })
  const wav = Buffer.from(
    await (
      await fetch(`${ENGINE}/synthesis?speaker=${SPEAKER}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) })
    ).arrayBuffer(),
  )
  const wavPath = join(TMP, 'clip.wav')
  writeFileSync(wavPath, wav)
  const ff = Bun.spawnSync([
    'ffmpeg',
    '-y',
    '-loglevel',
    'error',
    '-i',
    wavPath,
    '-ac',
    '1',
    '-threads',
    '1',
    '-c:a',
    'libopus',
    '-b:a',
    '40k',
    join(OUT, name),
  ])
  if (ff.exitCode !== 0) throw new Error(`ffmpeg failed for ${text}: ${ff.stderr}`)
  manifest[text] = name
  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n')
}
if (!verifyOnly) writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n')
rmSync(TMP, { recursive: true, force: true })
console.log(verifyOnly ? `Verified phonemes for ${PHRASES.length} phrases` : `${Object.keys(manifest).length} clips in ${OUT}`)
