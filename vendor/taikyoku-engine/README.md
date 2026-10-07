# Taikyoku shogi engine (WebAssembly)

Source of the engine behind `/taikyoku`. It is TaikyokuShogi-Stockfish by Belzedar94
(https://github.com/Belzedar94/TaikyokuShogi-Stockfish, commit `edefdc766c30c24bfe47ebc5c1a467afb9b23500`),
licensed GPL-3.0 (`COPYING`, `AUTHORS`). It is not Fairy-Stockfish: Fairy-Stockfish boards stop at 12×10
squares (128-bit bitboards, 7-bit squares), far below Taikyoku's 36×36 = 1,296.

Files copied unchanged: `position.cpp/h`, `search.cpp/h`, `nnue.cpp/h`, `tt.h`, `types.h`, `rules_data.h`
(generated from the Wikipedia piece rules by the upstream `make rules`).

Local changes:

- `uci.cpp`: the blocking `uci_loop()` is split into `uci_init()` and `uci_handle(line)`; native `main`,
  datagen, bench and NNUE options are removed. The default hash is 16 MB.
- `wasm_api.cpp`: `tk_init()` and `tk_command(line)` for the worker (`public/taikyoku/worker.js`).

No neural network is loaded: the upstream notes say its trained nets did not beat the material evaluation,
so the page uses alpha-beta search with material evaluation (depth 3 is 53,680 nodes, as upstream's bench).

Rebuild (needs an activated emsdk): `scripts/taikyoku/build-wasm.sh`, then commit `public/taikyoku/`.
Regenerate the piece catalogue with
`python3 -I scripts/taikyoku/build-catalog.py <upstream checkout> src/features/taikyoku/catalog.json`.

Checks used when vendoring: native and WASM both give `perft 2 = 237684` from the start position
(upstream's reference), and `go depth 3` searches 53,680 nodes.
