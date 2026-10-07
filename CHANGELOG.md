# Changelog

Notable changes are recorded here when a release is created. Versions follow Semantic Versioning.

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
