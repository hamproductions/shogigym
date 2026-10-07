# Current task

## Scope and permissions
- Current patch authorization: commit move-notation/wrapping correction and publish v1.4.1 on main. Fetch latest origin before integration; run required release validation, capped lint, formatting and build. Preserve active dev server; no independent browser requested.
- Latest move-list screenshot inspected: English names and same/promotion words were concatenated with Japanese coordinates, while shared notation spans prevented wrapping. Match main-game Japanese kifu notation independently of interface language; apply variant-scoped wrapping for long rows.
- Release completed: feature commit1a9e83a, version commit353c7f5, v1.4.0 published at https://github.com/hamproductions/shogigym/releases/tag/v1.4.0. Remote main and annotated tag resolve to release commit. Native Git uploads failed with GitHub internal errors; Git database API reproduced identical signed commits/trees before non-force main update; subsequent tag push succeeded. Required release checks passed. No exhaustive runtime parity or FPS claim.
- Release checks: dataset validation passed, capped lint passed with warnings, formatting and credential-pattern scan passed. After permissions restoration, full production build passed including Taikyoku prerender. Main integration is a fast-forward; feature already contains latest origin/main. Release target v1.4.0 using project release-it workflow and personal GitHub identity.
- Current release authorization: commit completed Taikyoku changes, integrate latest main, publish minor version and push main/release tag. Fetch origin completed; preserve active dev server. Required release-it validation/lint/format/build must pass. No independent browser during active testing.
- Latest loading report: port5173 had no listener. Restarted normal dev server on5173, foreground session65793; startup reports ready. Previous exit cause unknown. Preserve server for active testing.
- Add Taikyoku navigation to main rail その他 menu on every viewport, reserving menu-button capacity even when ordinary tools all fit. Variant Back-only navigation remains unchanged.
- Clicking the focused tile or square again clears active selection, tracked inspection, route and move choice before legal-target handling; shared lift settles and focus overlays disappear.
- Post-move settling correction: physical lift follows active selected piece only, not persistent inspection. Committing a move clears active selection, so tile settles while tracked details and overlays remain.
- Latest click failure: remove fixed-height0.3 picking plane; raycast actual board-piece geometry first (including lifted pieces), then board surface for empty squares. Preserve drag threshold.
- Capture-rule correction: rank restrictions govern jumping over pieces; adjacent or clear-path enemy capture remains legal. Native range generator now emits ordinary capture of equal/higher-ranked enemy before stopping when no piece was crossed. Friendly equal/higher ranks and all traversal beyond blockers remain disallowed. Earlier categorical no-capture explanation and guide were incorrect and replaced. Rebuild shipped WASM before completion.
- Selected-piece lift: 3D omitted physical selection lift; now applies shared LIFT and settling to focused piece through instance updates.
- Latest capture and arrow screenshots inspected: tracked own-piece inspection now accepts native legal move/capture clicks; inspected empty squares and their controlling-source arrows persist across unrelated moves, updating from current controls. Selected routes persist until their source moves or selection changes.
- Latest diagram screenshot inspected: centered actual baked koma replaces text-box center, add square grid around it. Use same sprite cache/bake renderer and piece appearance settings.
- Latest docked-start screenshot inspected: retained renderer size can match new host while new camera aspect remains1. Include camera aspect mismatch in resize initialization; projected floating layout camera now copies live field of view.
- Supplied Takami diagram and article fully inspected: reference encodes red step dots, red sliding lines and blue jumping/multi-step marks around centered piece. Replace full-board minimap with centered rule diagram sourced from native ATOMS/DIRS/ATOM_OFF/PIECES; article governs visual vocabulary, native Taikyoku engine governs variant rules.
- Latest movement screenshot inspected: remove80-entry native dropdown; render actual engine destinations in interactive board diagram, choosing a route highlights its full path on board. Piece info panel remains selected across turns and follows movement.
- Latest close-up inspected: wood streaks interrupt heat fills. Add local overlay polygon depth bias/draw order and distance-adaptive camera near plane to improve depth precision at Taikyoku scale; preserve shared color/opacity values.
- Latest screenshot shows 3D fitted nearly overhead. Default fit angle changed to main tilted-camera0.82 radians; maintain free orbit and physical room bounds.
- Latest selection requirement: keep inspected piece across turns and follow it to its destination, show shared route arrows and visible movement description. Spoken versus visible announcements question remains pending; spoken output not assumed.
- Latest screenshots inspected: control-map overlay patchiness with variant near plane1mm versus main0.1 units; duplicate floating board controls removed and focus actions retained in rail.
- Latest capture correction: transfer captured board meshes directly into physical throws from their actual squares; remove duplicate fade/recreated-box-spawn path for live captures.
- Latest rail correction: retain logo and Back as navigation, restore shared audio/volume, settings, command palette, control map, view/fit, UI visibility and fullscreen utilities. Exclude main mode navigation only.
- Latest rail defect: Back-only simplification removed shared koma branding. Restore existing RailSeal above Back without restoring mode navigation.
- Latest rail correction supersedes full navigation parity: variant rail contains only Back; preserve shared board/HUD controls. Diagnose and reduce rendering lag without adding browser sessions during active testing.
- Latest screenshot corrections: enforce camera inside actual room floor/walls/ceiling, pin shared evaluation graph to moves panel as main does, and remove source-route metadata from compact last-move heading.
- All three latest screenshots inspected fully. Active user testing: source validation only; preserve server and do not start another browser.
- Bring Taikyoku on feat/taikyoku-shogi to existing main-game board/HUD parity, with variant-native rules and genuine engine results.
- User preview: http://localhost:5173/taikyoku. Port was free; restarted normal development command with host 0.0.0.0 and port5173, session73961. HTTP route returned200; leave server running as requested.
- No characters. No commit, push, deploy, system/device changes or new test files.
- Latest capture-box correction: compact 350 × 280 × 160 mm kaya boxes, one per capturer; physical unordered piles may rise naturally. Oversized orientation-envelope sizing removed.
- Explicit HUD parity check authorized one isolated headed browser session taikyoku-parity. Pre-existing default/ia992 sessions unrelated; preserve them. Own comparison browser closed after CLI capture failures; final session list contains only unrelated default/ia992.

## Requirements and implementation
- Rail now shares main Rail with navigation disabled and explicit Back, preserving RailSeal/SoundButton, palette/control map and variant view/fit/settings/hide/fullscreen tools.
- Live capture sync defers generic spawns, removes captured meshes from board instance batches and hands those meshes/origins to physics throw immediately; loaded-history piles still settle via physics.
- Full shared traditional room at real scale. 35.2 × 38.6 mm squares; playing area 1267.2 × 1389.6 mm. Shared physical koma meshes and full variant glyphs; stationary pieces instanced, resource caches retained, incremental preparation and demand rendering.
- Freely rotatable 3D; left orbit/right pan/wheel zoom, WASD, scene-derived zoom bounds and board/floor camera clearance.
- Baked 2D uses shared bake renderer, piece capture and cached actual koma sprites; animated moves and selected-piece lift.
- Shared squareTile/squareFrame/moveTarget/arrowBetween overlays. Gold last move, cream/red selection, legal destination dots, inspected-piece covered squares including friendly defense, controlling-source arrows and control counts.
- Shared stepPieceAnimation drives 3D 220 ms moves, promotion flips and multi-step waypoints. Both views invoke shared playSound(move/capture) at landing; no character integration.
- Back-only variant rail restored per latest correction. Shared ModeBarHeading, player plates, EvalBar/EvalChip, SidePanel/FloatingPanel, useLayout and generic projectedZoneReporter policy retained. Shared coach Button markup corrected after screenshot exposed missing Button classes.
- Shared MovesPane MoveRows for actual side/piece/destination notation; shared numeric/kanji coordinates extended through rank36, same-square and promotion notation, source and multi-step routes.
- Genuine native search PV arrows, readable validated native PV metadata and shared EngineResultPane. No fabricated MultiPV alternatives; native engine supports one PV.
- Shared EvalGraph shows actual per-ply native evaluations. Shared useMovePlayback cadence and MoveNavigation preserve history, animate adjacent forward replay and leave opponent autoplay paused. Header/manual engine controls separate from historical playback.
- Native terminal condition: all opposing royals captured. Visible royal counters/locations and victory overlay; no invented checkmate or captured-piece drops.
- Captures tracked from native position differences with CaptureEntry.by ownership, including friendly captures. Real Rapier convex koma colliders, gravity, thrown trajectories, collisions, sleeping/instancing and two compact kaya boxes.
- Full history/cursor/strength/evaluations autosaved under variant-specific browser key. JSON download/file import; import validates every move through native engine and restores piece/capture metadata transactionally.
- Native control generation uses dynamic edge vectors and bounded source-target bitmap rather than fixed legal buffer/effect hash. Current shipped WASM rebuilt.

## Verified evidence
- Native executable verified adjacent and clear-path captures of enemy 大将 and 王将, no traversal beyond either, friendly blockers, capture-only generation, control generation and capture do/undo. Shipped WASM rebuilt and independently executed: adjacent royal/general capture and blocker traversal passed. Application TypeScript and diff whitespace passed. Existing loaded workers need page reload; live user interaction remains unverified.
- Latest source changes preserve inspected selection on normal moves, follow moving piece destinations, show selected-piece control coverage and chosen-route arrows/descriptions; duplicate floating controls removed, focus actions moved to rail. Screenshot-driven tilted fit and overlay depth precision changes implemented. Latest aggregate application TypeScript and diff whitespace checks passed. Visible behavior remains unverified during active user testing.
- Latest screenshot corrections implemented: camera and orbit target bounded by architectural room volume, fit field of view adapts below ceiling, shared graph pinned outside moves scroll body, header excludes source route and wraps long names.
- Rendering source corrections: cache material signatures by material version, update only dirty instance batches, skip idle zone projection/layout reads. Direct Three.js instance harness passed add/remove/restore and confirmed idle matrix-upload version unchanged.
- Latest application TypeScript check passed; scoped single-thread lint returned warnings only; diff whitespace validation passed. No independent browser launched during active user testing.
- Application TypeScript check: bunx tsc --project tsconfig.app.json --noEmit passed after aggregate integration.
- Scoped oxlint --threads=1: no errors; React refs/effect warnings remain. Scoped formatting applied; git diff --check passed.
- Root independently executed current WASM: opening legal moves 488/side; inspection preserves native position/legal output; dense position emits 9940 unique controls safely.
- Real headed browser main-game screenshot inspected; initial Taikyoku and later shared rail/evaluation/engine-arrow screenshot inspected. Later screenshot preceded compact box correction.
- Browser UI confirmed readable move1 notation, actual engine action, capture counts, shared coach toggle, evaluation graph and best-arrow checkbox.
- Browser UI rewind to cursor0, playback to cursor1 preserved complete history and left engine paused; autosave retained cursor/evaluations. Reload restored saved game. No page errors on that check.
- Shared avatar files have zero diff after cancelled variant character work.

## Unverified or remaining checks
- Latest camera/header/graph rendering and frame-rate improvement require user-preview confirmation; source checks are not visual or performance proof.
- Final compact-box rendering, final full-screen visual parity, movement frames/sound output and saved-file roundtrip need runtime confirmation. No claim of exhaustive board parity yet.
- Browser screenshot RPCs stalled and one failed with daemon busy/resource unavailable. Stop owned CLI calls, close exact taikyoku-parity session; preserve unrelated sessions/server.
- Floating panels depend on exact shared geometry/space thresholds; last1280×577 Taikyoku runtime remained docked. Both main/variant use same policy.
- 2D/camera interaction completeness, real capture pile stability, FPS and full royal-elimination flow remain unverified.

## Skill gates
- verification-before-completion fully read1–EOF/120 for current release; fresh check evidence required before release claims.
- Full reads: get-your-shit-together1–EOF/27; grilling1–EOF/28; frontend-design1–EOF/71; real-testing-evidence1–EOF/70; look-at-the-screen1–EOF/60; agent-browser1–EOF/52 plus complete CLI core and trust-boundary guide.
- Current-session requirements reconciled; supplied screenshots inspected at full resolution. Canonical task record replaces stale state, contains no raw chat.

## Immediate next action
- Preserve active dev server and release state. Release is published; future work resumes only for user-requested defects. Browser runtime/performance gaps above remain separate from passed release checks.
