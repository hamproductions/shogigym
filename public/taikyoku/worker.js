// Runs the Taikyoku shogi engine (vendor/taikyoku-engine, built by
// scripts/taikyoku/build-wasm.sh). tk_command() is synchronous, so every
// engine line printed during a command belongs to the request being served.
importScripts('./taikyoku.js')

let current = 0
const ready = createTaikyoku({
  print: (line) => postMessage({ type: 'line', id: current, line }),
  printErr: () => {},
}).then((mod) => {
  mod.ccall('tk_init', null, [], [])
  return mod
})

onmessage = async ({ data }) => {
  try {
    const mod = await ready
    current = data.id
    mod.ccall('tk_command', 'number', ['string'], [data.cmd])
    postMessage({ type: 'done', id: data.id })
  } catch (error) {
    postMessage({ type: 'error', id: data.id, error: error instanceof Error ? error.message : String(error) })
  }
}
