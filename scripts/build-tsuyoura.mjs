import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const [sourcePath, modelsPath, compilerPath = 'em++', selection = 'mini,micro'] = process.argv.slice(2)
if (!sourcePath || !modelsPath) throw new Error('Usage: node scripts/build-tsuyoura.mjs <YaneuraOu checkout> <extracted model directory> [em++]')
const source = resolve(sourcePath)
const models = resolve(modelsPath)
const compiler = compilerPath.includes('/') ? resolve(compilerPath) : compilerPath
const output = resolve('public/engines')
const revision = '3a0e4fd2394e40f72fc6e2ad5aada832b4045cd9'
const env = { ...process.env, DO_NOT_TRACK: '1', EMCC_CORES: '2' }
const head = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: source, encoding: 'utf8', env })
if (head.status !== 0 || head.stdout.trim() !== revision) throw new Error(`YaneuraOu checkout must be at ${revision}`)

function run(command, args, cwd = source) {
  const result = spawnSync(command, args, { cwd, env, stdio: 'inherit' })
  if (result.status !== 0) throw new Error(`${command} failed: ${result.status}`)
}

const patch = resolve('scripts/tsuyoura-command-worker.patch')
const applied = spawnSync('git', ['apply', '--reverse', '--check', patch], { cwd: source, env, stdio: 'ignore' })
if (applied.status !== 0) run('git', ['apply', patch])

const builds = [
  ['mini', 'SFNN_ka2_4096_8_64_progress8', 'YaneuraOu_TsuyouraMini', 'tsuyoura-mini'],
  ['micro', 'SFNN_ka2_2048_8_64_progress8', 'YaneuraOu_TsuyouraMicro', 'tsuyoura-micro'],
  ['halfkp', 'NNUE', 'YaneuraOu_HalfKP', 'halfkp'],
  ['li', 'NNUE_HALFKP_1024X2_8_32', 'YaneuraOu_TanukiLi', 'tanuki-li'],
  ['aoba', 'NNUE_halfkp_768x2_16_64', 'YaneuraOu_AobaNNUE', 'aobannue'],
]
const selected = selection.split(',')
if (selected.some((kind) => !builds.some(([id]) => id === kind))) throw new Error(`Unknown build selection: ${selection}`)
for (const [kind, arch, factory, directory] of builds.filter(([id]) => selected.includes(id))) {
  if (kind === 'mini' || kind === 'micro') {
    const tag = JSON.parse(readFileSync(resolve(models, kind, 'tag.json'), 'utf8'))
    if (tag.arch !== arch) throw new Error(`Unexpected ${kind} architecture: ${tag.arch}`)
  }
  const target = resolve(output, directory)
  mkdirSync(target, { recursive: true })
  run(
    'make',
    [
      '-s',
      '-j2',
      'normal',
      `COMPILER=${compiler}`,
      'PYTHON=python3',
      'TARGET_CPU=WASM',
      `YANEURAOU_EDITION=YANEURAOU_ENGINE_${arch}`,
      `OBJDIR=../obj-${kind}`,
      `TARGET=${target}/yaneuraou.js`,
      `EM_EXPORT_NAME=${factory}`,
      `LDFLAGS=--pre-js wasm_pre.js -pthread -sMODULARIZE=1 -sEXPORT_NAME=${factory} -sENVIRONMENT=web,worker,node -sPTHREAD_POOL_SIZE=5 -sFILESYSTEM=1 -sEXIT_RUNTIME=0 -sINCOMING_MODULE_JS_API=print,postRun -sEXPORTED_RUNTIME_METHODS=FS,ccall -sALLOW_MEMORY_GROWTH=1 -sINITIAL_MEMORY=134217728 -sMAXIMUM_MEMORY=2147483648 -sSTACK_SIZE=8388608`,
    ],
    resolve(source, 'source'),
  )
  if (kind === 'mini' || kind === 'micro') for (const file of ['nn.bin', 'progress.bin']) copyFileSync(resolve(models, kind, file), resolve(target, file))
}
copyFileSync(resolve(source, 'LICENSE'), resolve(output, 'LICENSE.engine.txt'))
const files = spawnSync('git', ['ls-files', '-z'], { cwd: source, env })
if (files.status !== 0) throw new Error('Could not enumerate engine source')
const archive = spawnSync('tar', ['-czf', `${output}/yaneuraou-source.tar.gz`, '--null', '-T', '-'], { cwd: source, env, input: files.stdout })
if (archive.status !== 0) throw new Error('Could not archive engine source')
