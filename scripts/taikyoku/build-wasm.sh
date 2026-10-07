#!/usr/bin/env bash
# Rebuild the Taikyoku shogi engine (vendor/taikyoku-engine) to WebAssembly.
# Needs an activated emsdk (em++ on PATH). The result is committed because CI
# does not carry the emscripten toolchain.
set -euo pipefail
cd "$(dirname "$0")/../.."
src=vendor/taikyoku-engine
out=public/taikyoku
mkdir -p "$out"
em++ -O3 -std=c++20 -DNDEBUG \
  "$src/position.cpp" "$src/search.cpp" "$src/nnue.cpp" "$src/uci.cpp" "$src/wasm_api.cpp" \
  -o "$out/taikyoku.js" \
  -sMODULARIZE=1 -sEXPORT_NAME=createTaikyoku -sENVIRONMENT=worker,node \
  -sEXPORTED_FUNCTIONS=_tk_init,_tk_command -sEXPORTED_RUNTIME_METHODS=ccall \
  -sINITIAL_MEMORY=134217728 -sALLOW_MEMORY_GROWTH=1 -sSTACK_SIZE=8388608 \
  -sFILESYSTEM=0 -sEXIT_RUNTIME=0 -Wno-unused-function
ls -la "$out"
