# Shiken-bisha dojo

A browser trainer for playing 四間飛車 (Fourth File Rook) against every common Static Rook plan.

- **Openings**: every opponent setup with a short introduction, its book lines, and the Shiken-bisha plan. Move any piece at any time. The app marks book moves, known failure patterns and known opponent mistakes (with how to punish them), and shows a flowchart of the branches.
- **Coach**: every move you play gets a chess.com-style label (Brilliant, Great, Best, Excellent, Good, Book, Inaccuracy, Mistake, Miss, Blunder) from YaneuraOu, plus a plain-language reason built from the engine lines: hanging pieces, material lost along the refutation, forks, missed or allowed mates, and the better move.
- **Review**: spaced repetition per position (4h, 1d, 3d, 1w, 2w, 1mo, 3mo, 6mo; a miss restarts the ladder). Includes a Difficult list and puzzles made from your own analyzed games.
- **Tsume**: 1148 problems of 3, 5 and 7 moves. Every attacking move must give check; alternative mating moves are accepted when the engine confirms the mate.
- **Analyze**: paste or open KIF, KI2, CSA, JKF, USI, SFEN or USEN (Shift_JIS files are handled). You get per-move labels, accuracy per side, an eval graph, where the game left the book, and one-click puzzles from your mistakes.

## Run

```sh
bun install        # postinstall copies the engine into public/engine
bun run dev        # http://localhost:5173
```

The engine needs `SharedArrayBuffer`, so the page must be served with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`. `vite.config.ts` sets both for dev and preview; any production host must send them too. Without them the joseki data still works and the AI features are disabled.

## Data scripts

```sh
node scripts/build-courses.mjs        # scripts/courses/*.mjs -> src/data/joseki/*.json
node scripts/validate.mjs             # every joseki move and demo line is legal
node scripts/solve-tsume.mjs 5 400 500  # solve data/tsume-raw/mate5.sfen with the engine
node scripts/verify-tsume.mjs --prune   # keep only strict check-only mates
```

## Sources and licenses

This app is GPL-3.0-or-later.

| Part | Source | License |
|---|---|---|
| Engine | YaneuraOu, WASM build `@mizarjp/yaneuraou.k-p` (github.com/mizar/YaneuraOu.wasm) | GPL-3.0 |
| Rules, notation, kifu I/O | tsshogi (github.com/sunfish-shogi/tsshogi) | MIT |
| Joseki courses in `vendor/shiryu-joseki` | github.com/Shiryu181/shogi-joseki, commit in `vendor/shiryu-joseki/SOURCE_COMMIT`. Lines follow shogilounge.com, hibitonshi.com and shogi-joutatsu.com, as listed in each course's `source` field | GPL-3.0 |
| 角交換四間飛車 course | hibitonshi.com/kakukoukan-shiken/ | moves and notes adapted from the article |
| 藤井システム course | en.wikipedia.org/wiki/Fujii_System | CC BY-SA |
| Tsume problems | YaneuraOu 5M mate-problem set (yaneuraou.yaneu.com/2020/12/25/christmas-present/), released with no copyright claimed; solutions were computed and re-verified here | none claimed |
| Move-label thresholds | chess.com expected-points model (support.chess.com, "How are moves classified") | n/a |
| Review intervals | Chessable MoveTrainer schedule (support.chessable.com) | n/a |
