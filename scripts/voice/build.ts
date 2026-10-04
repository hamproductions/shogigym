import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { PHRASES } from './phrases'

const ENGINE = process.env.VOICEVOX_URL ?? 'http://127.0.0.1:50021'
const SPEAKER = Number(process.env.VOICEVOX_SPEAKER ?? 3)
const OUT = 'public/voice/zundamon'
const TMP = join(process.env.TMPDIR ?? '/tmp', 'shogi-gym-voice')

const missingOnly = process.argv.includes('--missing')
if (!missingOnly) rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
mkdirSync(TMP, { recursive: true })

const manifest: Record<string, string> = missingOnly && existsSync(join(OUT, 'manifest.json')) ? JSON.parse(readFileSync(join(OUT, 'manifest.json'), 'utf8')) : {}
for (const { text, say, natural } of PHRASES) {
  if (missingOnly && manifest[text] && existsSync(join(OUT, manifest[text]))) continue
  const kana = natural ? say : say.replace(/[\u3041-\u3096]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60))
  const query = await (await fetch(`${ENGINE}/audio_query?speaker=${SPEAKER}&text=${encodeURIComponent(kana)}`, { method: 'POST' })).json()
  for (const phrase of query.accent_phrases) for (const mora of phrase.moras) if (/^[AIUEO]$/.test(mora.vowel)) {
    mora.vowel = mora.vowel.toLowerCase()
    mora.vowel_length = Math.max(mora.vowel_length, 0.09)
    mora.pitch = mora.pitch || 5.6
  }
  Object.assign(query, { speedScale: 1.12, prePhonemeLength: 0.02, postPhonemeLength: 0.16, outputSamplingRate: 24000 })
  const wav = Buffer.from(await (await fetch(`${ENGINE}/synthesis?speaker=${SPEAKER}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) })).arrayBuffer())
  const name = `${createHash('sha1').update(text).digest('hex').slice(0, 10)}.webm`
  const wavPath = join(TMP, 'clip.wav')
  writeFileSync(wavPath, wav)
  const ff = Bun.spawnSync(['ffmpeg', '-y', '-loglevel', 'error', '-i', wavPath, '-ac', '1', '-c:a', 'libopus', '-b:a', '40k', join(OUT, name)])
  if (ff.exitCode !== 0) throw new Error(`ffmpeg failed for ${text}: ${ff.stderr}`)
  manifest[text] = name
}
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n')
rmSync(TMP, { recursive: true, force: true })
console.log(`${Object.keys(manifest).length} clips in ${OUT}`)
