# Changelog

Notable changes are recorded here when a release is created. Versions follow Semantic Versioning.

## [1.5.2](/compare/v1.5.1...v1.5.2) (2026-10-15)

### 修正・追加

- 学習教材の利き、取り返し、王手、詰み、手順の前後を修正。
- 受け、端攻め、五手詰、形勢判断の独自練習を追加。
- 画面幅に応じた操作パネルの配置と、プレビュービルドの直接リンクを改善。

## [1.5.1](/compare/v1.5.0...v1.5.1) (2026-10-13)

### Bug Fixes

* 学習教材の局面・利き・取り返し・手順前後を修正し、独立した例と説明を追加。
* 学習中の説明に指し手の矢印と升の表示を区別して反映し、空の翻訳データによるクラッシュを防止。

# [1.5.0](/compare/v1.4.4...v1.5.0) (2026-10-12)


### Bug Fixes

* draw arrows above pieces, center badges, stop mark rebuild shader stalls 5aa00d7
* end-align captured pieces in vertical strips 7aa4fc7
* keep move arrows beneath pieces on flat and 3D boards 9d5c27d
* keep preview banner and player plates out of the board on compact screens bc0384f
* matchup pages say vs <opponent> instead of masquerading as the opening 0311bda
* move Open and Trends from the rail into the analysis bar a94b37b
* readable mistake rows in narrow panels and Japanese sentence stops e690b39
* scale report average loss to percent like Trends a7917c9


### Features

* auto-rate every move, fold what-next into AI tab, graph and per-phase stats in Analysis 4292bec
* distinct colour per mentioned square in lessons, with screenshots 7100160
* full device pixel ratio, tinted square notation in lessons, rail Import KIF 4b3e49b
* hide board coordinate labels by default d1c3b47
* Open dialog, vertical captured-piece strips, game-relative endgame phase, review prompt square highlights b592a50
* opt each saved game in or out of trends where games are listed 96ad083
* opt games in via the Analysis side picker, mistake boards, Japanese-style squares in English lessons, data-only Trends 588a5b4
* preview the described position for strategy pages and mark mentioned squares on the board c592d3e
* ranked lesson search with breadcrumbs and related lessons 21cf903
* real-board position diagrams, compact mistake rows, colour-coded moves, Japanese notation everywhere b5adf98
* tabbed Trends, clearer rail groups, commands and table flip in the overflow menu 156d43c
* Trends bars, expandable mistake boards, plain-language mistake explanations cb5e3fe
* Trends dialog with cross-game insights and include/exclude per game 26bbadc

## [1.4.4](/compare/v1.4.3...v1.4.4) (2026-10-11)


### Bug Fixes

* complete original curriculum and lesson presentation b2400f9

## [1.4.3](/compare/v1.4.2...v1.4.3) (2026-10-10)


### Bug Fixes

* calibrate Dojo analytics against real engine ratings e370259


### Features

* add complete shogi learning curriculum 149f19a
* add core rules and tactics board exercises 56ad4cb
* add Dojo learning hub with skill profile, weakness routing and streaks 8d9ce2b
* guided lessons built from one documented converter 636b0ae
* unify lessons into the course catalog and integrate game report c8a5d12

## [1.4.2](/compare/v1.4.1...v1.4.2) (2026-10-08)


### Performance Improvements

* instance game pieces and flatten Taikyoku faces 927f47f

## [1.4.1](/compare/v1.4.0...v1.4.1) (2026-10-07)


### Bug Fixes

* match Taikyoku move notation and wrap long entries 9c4f882

# [1.4.0](/compare/v1.3.8...v1.4.0) (2026-10-07)


### Bug Fixes

* announcement stamp uses a single kanji and sits on the ink on mobile 4503af2
* keep the bottom player plate clear of the eval bar 74ff1b1
* rebuild the 3D board after the GL context is lost and not restored 1cedf76
* use two-kanji announcement stamps (手筋/囲い/戦法) e58ff30


### Features

* bring Taikyoku board and controls to shared game presentation 1a9e83a
* Taikyoku shogi (大局将棋) fun mode on the shared 3D renderer 5a22fd3

## [1.3.8](/compare/v1.3.7...v1.3.8) (2026-10-07)


### Bug Fixes

* improve board rendering and interaction b0cbc01
* remove loading spinner, keep progress bar 870b3dc
* restore compact plates and visible glass ink e4d64f9

## [1.3.7](/compare/v1.3.6...v1.3.7) (2026-10-06)


### Bug Fixes

* preserve recovery state and responsive controls 28ae6dd

## [1.3.6](/compare/v1.3.5...v1.3.6) (2026-10-06)


### Bug Fixes

* stabilize board rendering and adaptive panels 70a71fb

## [1.3.5](/compare/v1.3.3...v1.3.5) (2026-10-06)


### Bug Fixes

* **3d:** bound and dispose piece textures, cut polygon count; add tesuji toggle 8296b34
* **3d:** run all bakes on one shared renderer; don't cache glyphs before the font loads 7578b8e
* remove empty feedback space from study cards ff29f55
* share 3d renderer and batch tile previews 2e2be52
* stabilize mobile controls and synthesize piece clacks 7b74387


### Features

* **3d:** sharper table in the locked camera a4d9617

## [1.3.4](/compare/v1.3.3...v1.3.4) (2026-10-06)


### Bug Fixes

* apply wood grain texture to piece side faces

## [1.3.3](/compare/v1.3.2...v1.3.3) (2026-10-05)


### Bug Fixes

* correct piece selection and sourced speech readings 8cb1b51
* route releases to GitHub API with SSH aliases 9c38e58

## [1.3.2](/compare/v1.3.1...v1.3.2) (2026-10-05)


### Bug Fixes

* stabilize responsive controls and correct knight speech dcb7790

## [1.3.1](/compare/v1.3.0...v1.3.1) (2026-10-05)


### Bug Fixes

* compact mobile move lists and preserve icon sizing 7fb600f
* stabilize tile rendering and responsive panels af5d9ed

# [1.3.0](/compare/v1.2.0...v1.3.0) (2026-10-05)


### Features

* add evaluated books, Bioshogi detection and app installation 2cad9b0

# [1.2.0](/compare/v1.1.0...v1.2.0) (2026-10-05)


### Bug Fixes

* initialize loading translations during prerender b3e7ca6


### Features

* improve mobile board layout and controls 58ca035

# [1.1.0](/compare/v1.0.1...v1.1.0) (2026-10-05)


### Bug Fixes

* reduce board rendering cost and localize piece settings 9a09457
* stabilize board rendering and camera interactions 9c0ed22


### Features

* add About version and rename repository references 51e11e1
* add tile viewpoints and stabilize analysis overlays ae1ac09

## 1.0.1 (2026-10-05)


### Bug Fixes

* initialize AI reliably and refresh 2D tiles 38800ce
* normalize sidebar fonts and expose engine recovery 017a1a8
* replay spectator history from current cursor 84d4b12
* unify tile rendering and stabilize board interactions 98cbeb0


### Features

* add spectator games and split application modules d0d3b8c
* implement requested UI and gameplay improvements 31bbaf1
* implement requested UI and gameplay improvements 67429cd
* unify piece customization and improve board interactions c72f872
