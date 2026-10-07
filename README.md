<p align="center"><img src=".github/media/banner.png" alt="Shogi Gym 将棋ジム" width="100%"></p>

# Shogi Gym 将棋ジム

**Play it: [hamproductions.github.io/shogigym](https://hamproductions.github.io/shogigym/)**

A free shogi training gym in the browser. Learn openings with study and quiz modes, keep them with spaced review, sharpen tactics with tsume and tesuji drills, play the AI and analyze your games. Everything runs locally, with the YaneuraOu engine compiled to WebAssembly.

<p align="center"><img src=".github/media/reel.gif" alt="Shogi Gym in action: a tatami room, two players moving the pieces by hand, a capture with power mode, and a checkmate that ends with the table flipped" width="100%"></p>

<p align="center"><a href=".github/media/reel.mp4">Watch the 60 fps version</a></p>

The opening library covers the main strategies for beginners up to amateur 1–2 dan: pick your main (四間飛車, 中飛車, 居飛車, 矢倉…) and learn it against what your opponent plays.

The whole app is one screen: a 3D board in a tatami room or a home dining room (or a flat 2D, diagram or broadcast board), a mode rail on the left, and tool panels beside the board. On phones the board and panel share the screen. English and Japanese throughout, installable as a PWA.

## Features

- **定跡 Openings**: Source-cited lessons and matchups for the main strategies, plus castle-breaking (囲い崩し) and sabaki (捌き) techniques, every move taken from a cited source.
  - **Study mode** shows each move with its reason and plays the opponent's reply on your cue.
  - **Quiz mode** asks you to find the moves.
  - A wrong move is graded (Good, Inaccuracy, Mistake, Blunder…), the punishing line plays out on the board, and you are asked to go back and try again.
  - A Lesson map shows every branch of the line.
- **復習 Review**: spaced repetition per position (4 h, 1 d, 3 d, 1 w and longer; a miss starts the position over). Mistakes from your own games are added automatically.
- **詰将棋 Tsume**: 1手詰 to 7手詰 plus a mixed set. Hints are staged, a King escape overlay is optional, and a solve only counts when it was found without help.
- **手筋 Tesuji**: Drills where the move to find is a named tesuji (叩きの歩, 突き捨ての歩, 焦点の歩, 垂れ歩, 底歩, 頭金, 両取り, ふんどしの桂, 王手飛車取り …), mined from the book lines and tsume by `scripts/mine-tesuji.ts`, each citing its source position. Plus four hand-entered pawn-tesuji lessons from shogi-rule.com's diagrams. While you play or analyze, a tesuji in the game is named on the board and tagged in the move list.
- **対局 Play AI**: four strengths. You can choose the AI's strategy (居飛車穴熊, 棒銀, 舟囲い急戦, 左美濃, 相振り飛車 and more); the AI follows that setup's book lines, then thinks for itself.
  - Random strategy is the default, resolved once per game. No strategy bypasses all opening books and uses engine search.
  - Evaluated Peta book moves rank matching lesson branches and extend play beyond the lesson lines. The compact subset loads one position shard on demand; missing or unavailable positions fall back to the engine.
  - 待った take-back, resign, and a 王手 warning.
  - A coach comments on each of your moves.
  - Saved positions survive a reload.
- **観戦 View**: watch two bots with a free camera, per-move coach analysis and arrows. Configure 上手 / 下手 strength, strategy and playing order in the setup dialog; Start runs furigoma when random order is selected. Pause, rewind and replay the recorded moves, then resume live play. Games pause at the end for a manual restart and are not saved as kifu.
- **検討 Analyze**:
  - Import KIF, KI2, CSA, JKF, USI, SFEN or USEN; Shift_JIS files work, and player names, comments and the result are shown.
  - Rate every move, with an eval graph you can click.
  - A variation tree (変化): step back anywhere and play a different move for either side.
  - Save games to in-app slots, or copy them as KIF with the variations included.
- **Taikyoku shogi (大局将棋) fun mode** at `/taikyoku`: the 36×36 board with 804 pieces on the same 3D tile renderer (carved wooden tiles, wood board, lights and shadows), a flat map view, and an engine that runs in a Web Worker. Play Sente against it, or watch two engines play each other against the clock of the 2004 TV marathon. See `vendor/taikyoku-engine/README.md`.
- **Formation display**: the strategy and castle of both sides (四間飛車, 本美濃, 穴熊, ミレニアム…) appear beside the board, with a short banner when one is completed.
  - Bioshogi shape rules track move history, holdings, capture conditions and opening-phase restrictions. Recognized tags survive later board changes; castle outlines require the shape to remain present. Formation announcements stop after non-pawn/non-bishop captures; check and tesuji announcements continue. The browser adapter ports declarative shapes, custom castle rules, move/history techniques and end-of-game tags. Imported handicap metadata is retained for preset-dependent detection. Run `bun scripts/check-bioshogi.ts` to compare all 535 pinned upstream KIF fixtures against recorded Ruby runtime outputs: accumulated player tags, move annotations and final tags. Recorded Zundamon clips cover the detector definitions; formation speech remains limited to the opening. The Ruby runtime and notation/export APIs are not part of this detection port.
- **Players at the table**: two seated characters move every piece by hand (reach, grip, carry, press), lean in for far squares and bow at the start. A dev-only `/dev/hands` page steps through every hand motion frame by frame.
- **Power mode** (optional): sparks, shockwaves and light beams on captures, a dimmed room with a red beam for 王手, and a 詰み finale after which the loser flips the table.
- **Zundamon voice** (VOICEVOX:ずんだもん): reads out openings, castles and tesuji as they appear, calls 王手, says ありがとうございました at checkmate, counts byoyomi, and greets you at the start and acknowledges the game result once.
- **Eval bar** beside the board, steady between moves, and a take-back-and-retry prompt after a mistake.
- **Settings**: Classic, Elegant, Plastic and Broadcast presets combine independent typeface, face, color, material, grain and finish settings. Choose one character, two characters, or one character with Lines, Dots or Marks guides. Wood, plastic, glass and frosted glass share the full-set preview and angled finish previews. Board wood, sound, voice, thinking time, candidate lines and knowledge level are configurable; AI strength, strategy and playing order are chosen in the new-game dialog.

## Run locally

```sh
bun install        # postinstall copies the engine into public/engine
bun run dev        # http://localhost:5173
bun run build      # prerendered static site in build/client/ (needs Node 22.22+)
bun run check      # Oxlint, Prettier and TypeScript
bun run fix        # Oxlint autofix, then Prettier formatting
node scripts/validate.mjs   # every joseki move and demo line is legal
```

## Development pages and structure

Development pages are available only with `bun run dev` and are excluded from production routes:

| Route          | Purpose                                                |
| -------------- | ------------------------------------------------------ |
| `/dev/komadai` | Captured-piece stand layouts                           |
| `/dev/pieces`  | All typefaces rendered with global appearance settings |
| `/dev/hands`   | Hand motion inspection                                 |
| `/dev/reel`    | Deterministic animation capture                        |

- `src/app/`: application modes, hooks, dialogs, rail, panels and stage.
- `src/utils/`: shared analysis, engine/evaluation storage, course catalog/model, rules and kifu, formation detection, review storage, translation setup, hooks, notation, scoring, book/statistics, board control, events, voice, theme, room dimensions and animation helpers. Shared consumers import these directly; no barrel bundles them together. Only framework entry files (`root.tsx` and `routes.ts`) remain at the `src/` root.
- `src/appearance/`: piece sets, appearance settings and board styles.
- `src/rendering/`: board renderers, 3D scene and avatar animation.
- `src/dev/`: development pages and their CSS, loaded only by development routes.
- `src/data/`: course, strategy and drill data.

Heavy renderers, dialogs and development pages load through dynamic imports with their CSS. The 3D board loading state includes scene and piece assets. Everything in `public/` is copied to the deployed site as separate static assets; it is not bundled into JavaScript, but unused files there still contribute to deployment size. Build output in `build/` and generated router types in `.react-router/` are disposable and ignored by Git.

## Code quality and imports

Oxlint checks JavaScript and TypeScript, including React hook rules. Prettier formats maintained source and configuration with two-space indentation, single quotes and no semicolons. Generated output, third-party source and static asset/data directories are excluded from formatting.

```sh
bun run lint          # check lint rules
bun run lint:fix      # apply safe lint fixes
bun run format        # format source, configuration and README
bun run format:check  # verify formatting without writes
bun run fix           # lint autofix and formatting
bun run check         # lint, formatting and TypeScript checks
```

The `@/` alias resolves to `src/` in Vite, TypeScript and Bun. Use it for imports across source directories, such as `@/utils/shogi`; same-directory imports stay relative. React Router's generated `+types` imports, asset globs and files outside `src/` keep their explicit relative paths.

Shared modules must initialize without browser globals during development SSR. The i18n module owns its instance and translations; document-language synchronization belongs to the client Root effect, with subscription cleanup. Verify development route requests as well as the production build when changing module initialization.

## Versions and releases

`package.json` is the version authority. `src/utils/version.ts` reads it directly, and Settings → About displays the same version beside the app name, with repository, changelog and licence links.

Releases use release-it and its conventional-changelog plugin, using conventional commits. Use conventional commit messages such as `fix: ...`, `feat: ...` and `feat!: ...` so automatic bump selection and release notes reflect the changes.

From a clean, current `main` checkout, with a `GITHUB_TOKEN` authorized to create releases for this repository:

```sh
bun run release:dry-run  # preview; no version, commit, tag, push or release writes
bun run release         # choose bump from conventional commits
bun run release:patch   # explicit patch bump
bun run release:minor   # explicit minor bump
bun run release:major   # explicit major bump
```

Release commands validate the course data, check lint and formatting, and build before proceeding. A real release updates `package.json`, generates `CHANGELOG.md`, creates a `chore: release vX.Y.Z` commit and `vX.Y.Z` tag, pushes them, and publishes a GitHub release. npm publication is disabled. Pushing the release commit to `main` starts the existing Pages deployment. Version bumps happen only through an explicit release command.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`. It validates the course data, checks lint and formatting, builds with `BASE_PATH=/shogigym/` (derived from the repository name), prerenders every mode and strategy page with React Router, and publishes `build/client/` to GitHub Pages. In the repository settings, set Pages → Source to "GitHub Actions" once.

The engine needs `SharedArrayBuffer`, which requires cross-origin isolation (`Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`).

- **GitHub Pages** cannot send these headers. `public/coi-sw.js` is a small service worker that adds them on the client, and the page reloads once the first time it installs.
- **Other hosts:** Netlify and Cloudflare Pages read `public/_headers`, and Vercel reads `vercel.json`.
- **Without isolation**, lessons, review and tsume still work, but the AI features are disabled and offer a page reload. Engine startup shows a loading state; startup and analysis errors show the actual error and a retry action rather than remaining on an analysis placeholder.

## Data scripts

```sh
node scripts/build-courses.mjs          # scripts/courses/*.mjs -> src/data/joseki/*.json
bun scripts/mine-tesuji.ts              # rebuild src/data/tesuji-drills.json from the courses and tsume
node scripts/validate.mjs               # legality check of every course
node scripts/solve-tsume.mjs 5 400 500  # solve data/tsume-raw/mate5.sfen with the engine
node scripts/verify-tsume.mjs --prune   # keep only strict check-only mates
bun scripts/stats/build.ts --floodgate 2025 --aoba 4 --min 10   # opening statistics -> public/book/
node scripts/build-formations.mjs       # pinned Bioshogi shape rules -> src/data/formations.json
bun scripts/build-opening-book.ts /path/to/user_book1.db /path/to/fresh-index.sqlite
node scripts/build-full-book.mjs /path/to/user_book1.db
```

The opening-book builder reads the MIT-licensed [Peta 233 release](https://github.com/yaneurao/YaneuraOu/releases/tag/new_petabook233), indexes the extracted native file, seeds existing lesson positions and expands reachable branches. It writes 24,000 positions and their evaluated alternatives into 64 static shards under `public/books/peta233-v1/`, approximately 7 MB total. Shards are fetched only during strategy-based Play/View, with at most eight retained in memory. Position/move rotation supports both sides independently of the older WASM engine's missing `FlippedBook` option. Use a fresh temporary SQLite index when changing the input book; the native archive and index are not shipped.

Settings → Play AI → Opening book offers a one-click download for the complete Peta database, plus manual `.db` import. The 7 MB compact subset works automatically: required shards load on demand and persist in IndexedDB for offline reuse. Full Peta downloads 99 MB in 59 verified gzip chunks and stores the complete 493 MB native database in IndexedDB. Cancellation preserves completed chunks for retry; successful installation removes temporary compressed chunks. Full assets are separate static files and are never fetched on initial page load. The engine loads the installed database only when strategy play needs a native-book fallback; analysis and No strategy continue using engine search. Loading the full native database can require over 1 GB of memory. Remove the installed book to return to the compact subset alone. Neither book contains every possible opening position; positions outside its coverage fall back to engine search.

`scripts/stats/build.ts` builds the "Played in engine games" table in the What next tab. It streams the newest `--aoba` AobaZero self-play archives (about 10,000 games and 120 MB each) straight from Google Drive through `xz` without writing them to disk (a dropped connection only cuts that file short; the games read so far still count), downloads each Floodgate year in `--floodgate` to `.cache/stats/` (7z needs a seekable file; downloads resume after a dropped connection) and streams it through `bsdtar` without unpacking it, replays the first `--ply` (30) moves of every game that starts from the normal position and has a result, and counts each (position, move) with sente wins, gote wins and draws. Positions seen in at least `--min` games are kept with up to `--moves` (10) moves each, the YaneuraOu new_petabook best move and eval are merged in, and the result is written as 256 JSON shards keyed by a hash of the position (`src/utils/stats.ts` has the same hash). Archives are deleted after aggregation unless `--keep` is passed; a Floodgate year needs about 350 MB of free disk while it is processed. The YaneuraOu book (76 MB) is fetched the same way. To scale up, add years (`--floodgate 2023,2024,2025`) and files (`--aoba 20`), and raise `--min` to keep the output small.

Each course records its source in its `source` field.

## Sources and licenses

App-authored code is GPL-3.0-or-later. Bioshogi-derived formation rules and their adapter are AGPL-3.0; the combined distribution retains the corresponding-source obligations of AGPL section 13. Settings → About links the public source repository. The upstream license and adaptation notice are in `vendor/bioshogi/`.

The evaluated opening subset in `public/books/peta233-v1/` comes from YaneuraOu's MIT-licensed Peta 233 release; its source, extraction scope and release filename are recorded in `manifest.json` and `LICENSE`.

| Part                                                                           | Source                                                                                                                                                                                                                                                                                                                                                                                                 | License                                                                                                            |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Engine                                                                         | YaneuraOu, WASM build `@mizarjp/yaneuraou.k-p` (github.com/mizar/YaneuraOu.wasm)                                                                                                                                                                                                                                                                                                                       | GPL-3.0                                                                                                            |
| Engine (optional)                                                              | YaneuraOu NNUE (HalfKP 256x2-32-32), WASM build `@mizarjp/yaneuraou.halfkp.noeval` (github.com/mizar/YaneuraOu.wasm); no evaluation file is bundled, the user loads their own nn.bin                                                                                                                                                                                                                   | GPL-3.0                                                                                                            |
| Engine (optional)                                                              | Fairy-Stockfish, WASM build `fairy-stockfish-nnue.wasm` (github.com/fairy-stockfish/fairy-stockfish.wasm)                                                                                                                                                                                                                                                                                              | GPL-3.0                                                                                                            |
| Engine (Taikyoku shogi mode)                                                   | TaikyokuShogi-Stockfish (github.com/Belzedar94/TaikyokuShogi-Stockfish), vendored in `vendor/taikyoku-engine/` and built to WebAssembly by `scripts/taikyoku/build-wasm.sh`                                                                                                                                                                                                                            | GPL-3.0                                                                                                            |
| Rules, notation, kifu I/O                                                      | tsshogi (github.com/sunfish-shogi/tsshogi)                                                                                                                                                                                                                                                                                                                                                             | MIT                                                                                                                |
| 3D rendering                                                                   | three.js                                                                                                                                                                                                                                                                                                                                                                                               | MIT                                                                                                                |
| Room panoramas (`public/sky/ninomaru_teien.jpg`, `residential_garden.jpg`)     | Poly Haven HDRIs "Ninomaru Teien" (Greg Zaal) and "Residential Garden" (Greg Zaal, Rico Cilliers), tonemapped JPGs downscaled to 4096 px (polyhaven.com)                                                                                                                                                                                                                                               | CC0 1.0                                                                                                            |
| VRM loading                                                                    | @pixiv/three-vrm (github.com/pixiv/three-vrm)                                                                                                                                                                                                                                                                                                                                                          | MIT                                                                                                                |
| Voice clips (`public/voice/zundamon/`)                                         | VOICEVOX:ずんだもん, recorded offline with the VOICEVOX engine by `scripts/voice/build.ts` (opening, castle and tesuji names, 王手/詰み, byoyomi count)                                                                                                                                                                                                                                                | VOICEVOX ずんだもん音源利用規約 (zunko.jp/con_ongen_kiyaku.html): free use with the credit 「VOICEVOX:ずんだもん」 |
| Hand poses (`src/rendering/avatars/handMotion.json`)                           | Finger rotations baked offline by `scripts/mocap/` with MediaPipe Hand Landmarker (Apache-2.0) and Kalidokit (MIT) from landmarks of the Japan Shogi Association 手つき videos; only derived joint angles are shipped, no video                                                                                                                                                                        | Derived data                                                                                                       |
| Seated players (`public/avatars/sendagaya-shino.vrm`, `sakurada-fumiriya.vrm`) | VRoid Studio β sample models "Sendagaya Shino" and "Sakurada Fumiriya" by pixiv Inc. (vroid.pixiv.help/hc/en-us/articles/360013482714 and /360014788554 state CC0; conditions overview at /4402614652569; VRM files via github.com/madjin/vrm-samples; VRM meta: licenseName CC0, allowedUserName Everyone, commercialUssageName Allow); textures downscaled to 1024 px and thumbnails shrunk for size | CC0 1.0                                                                                                            |
| Joseki courses in `vendor/shiryu-joseki`                                       | github.com/Shiryu181/shogi-joseki (commit in `vendor/shiryu-joseki/SOURCE_COMMIT`, re-vendored with `node scripts/build-courses.mjs --vendor <checkout> <commit>`), lines from shogilounge.com, hibitonshi.com, shogi-joutatsu.com, shogi-rule.com and ameblo.jp shogi blogs, as cited in each course's `source`                                                                                       | GPL-3.0                                                                                                            |
| 将棋ルール.com courses (`shogirule--*`)                                        | Move sequences from the game files published at shogi-rule.com/joseki_index/. The closing summaries are written here from the moves and final position; no text from the site is reproduced, only its one-word evaluation (互角/先手優勢/後手優勢) is cited                                                                                                                                            | Attribution; moves are game records                                                                                |
| 角交換四間飛車                                                                 | hibitonshi.com/kakukoukan-shiken/                                                                                                                                                                                                                                                                                                                                                                      | Moves and notes adapted from the article                                                                           |
| ミレニアム                                                                     | shogijam.com, "四間飛車対ミレニアムの激しい定跡" game file                                                                                                                                                                                                                                                                                                                                             | Attribution; moves are a game record                                                                               |
| 相振り飛車                                                                     | thirdfilerook.jp, "相振り飛車の基礎知識 三間飛車VS四間飛車とは"                                                                                                                                                                                                                                                                                                                                        | Attribution                                                                                                        |
| 藤井システム, 左美濃, 囲い崩し diagrams                                        | Wikipedia (en "Fujii System"; ja 左美濃, 美濃囲い, 舟囲い)                                                                                                                                                                                                                                                                                                                                             | CC BY-SA                                                                                                           |
| Opening statistics, AobaZero (`public/book/`)                                  | Self-play game records of AobaZero (github.com/kobanium/aobazero; archives linked from www.yss-aya.com/aobazero/), aggregated to per-position move counts and results. These are training games, whose first 30 moves include deliberate exploration noise, so rare moves there can be weaker than engine play                                                                                         | Public domain (the README says everything except the aobaz engine is public domain)                                |
| Opening statistics, Floodgate (`public/book/`)                                 | Floodgate computer-shogi server game archives (wdoor.c.u-tokyo.ac.jp/shogi/), used only as aggregated move counts and results; no game record, player name or rating is shipped                                                                                                                                                                                                                        | No license stated; aggregate counts only                                                                           |
| Engine book move (`public/book/`)                                              | YaneuraOu new_petabook "新ペタショック定跡 233万局面" (github.com/yaneurao/YaneuraOu/releases/tag/new_petabook233), best move and eval for positions in the statistics                                                                                                                                                                                                                                 | MIT                                                                                                                |
| Tsume problems                                                                 | YaneuraOu 5M mate-problem set (yaneuraou.yaneu.com/2020/12/25/christmas-present/), solutions computed and re-verified here                                                                                                                                                                                                                                                                             | None claimed                                                                                                       |
| Move-label thresholds                                                          | chess.com expected-points model                                                                                                                                                                                                                                                                                                                                                                        | n/a                                                                                                                |
| Review intervals                                                               | Chessable MoveTrainer schedule                                                                                                                                                                                                                                                                                                                                                                         | n/a                                                                                                                |
| Fonts                                                                          | Shippori Mincho B1, Zen Kaku Gothic New, Yuji Syuku, Yuji Boku, Zen Antique (via Fontsource)                                                                                                                                                                                                                                                                                                           | OFL-1.1                                                                                                            |
| Piece set 菱湖 Ryoko (`assets/pieces/ryoko_1kanji`)                            | Ryoko_1Kanji by nexxogen, from lishogi (github.com/WandererXII/lishogi)                                                                                                                                                                                                                                                                                                                                | CC BY-SA 4.0                                                                                                       |
| Piece sets Brown / Light (`assets/pieces/kanji_brown`, `kanji_light`)          | kanji_brown and kanji_light by Ka-hu, from lishogi                                                                                                                                                                                                                                                                                                                                                     | CC BY 4.0                                                                                                          |
