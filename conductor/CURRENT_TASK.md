# Current task

## Scope and permissions
- Latest task: publish verified instancing and Taikyoku flat-face work on main as patch v1.4.2. Instancing applies to both; flat-face geometry applies only to Taikyoku. Preserve normal carving.
- Enable normal 9×9 3D instancing, including per-instance grain textures across both sides.
- Preserve geometry, glyphs, grain, materials, finishes, dimensions, interaction, animation, avatars and snapshots.
- Current request authorizes main-branch integration and patch release, including commits, version/tag, push and GitHub release. Existing verified implementation and performance document are release scope.
- Preserve development server at localhost:5173; started this session with bun run dev --host 0.0.0.0 --port 5173, foreground session81731. HTTP200 verified.

## Implementation
- Shared PieceInstances moved to src/rendering/board3d/instances.ts; Taikyoku re-export preserves existing batching behavior.
- Normal retains original objects for picking/animation; render uses instance batches and restores source visibility in finally. Rebuild/teardown dispose batches; snapshots use same path.
- src/rendering/board3d/instanceTextures.ts packs original CanvasTexture pixels into DataArrayTexture layers. map and emissiveMap use per-instance layer attributes and minimal shader hooks, preserving physical-material lighting and other maps.
- Matching geometry/material/sampling properties batch across different texture identities. Original grain, repeat/filter/mipmap/color-space settings and orientation preserved. Compatible map/emissive arrays share storage.
- Texture variants enabled independently of retained-object mode. Taikyoku board and settled captures use arrays for map, emissiveMap, roughnessMap and clearcoatMap; CanvasTexture and RGBA unsigned-byte DataTexture supported. Batches partition at128 layers per slot. Transparent/transmissive/custom-hook pieces remain ordinary meshes.
- Existing geometry, dimension, material, texture-generation and appearance files unchanged. AGENTS.md now explicitly requires appearance preservation.

## Verification
- Application TypeScript passed; scoped single-thread lint passed; formatting and diff whitespace passed.
- Earlier direct Three.js harness verified transforms, motion, membership, fallback, visibility restoration, cleanup and Taikyoku idle updates.
- Real headed browser normal-instancing on localhost:5173/play and /analyze, Apple M2 Pro ANGLE Metal GPU, drawing buffer1152×471 DPR1. Complete screenshots directly inspected.
- Starting board:19 batches versus43 before texture arrays. All18 pawns share body/front/back instance batches, including both sides.
- Same-scene original versus array rendering:163 versus62 draw calls, triangles63395 both. Reduction101 calls /61.96 percent. Initial exact-texture batching measured164 versus87 in an earlier scene.
- Framebuffer comparison:46 changed channels /2170368, mean delta0.0000705, maximum22; same tiny residual as prior batching. Near-identical pixels, not exact equality or exhaustive appearance validation.
- Real pointer selected7七 pawn, visible lift and legal target inspected; clicked7六 and confirmed moved pawn, completed animation and avatar interaction.19 batches retained, browser errors empty.
- After move, direct original/array draws168 versus67, triangles62702 both; framebuffer49 changed channels, mean0.0001046, max28.
- Settled post-move four alternating windows,60 measured frames each: original median CPU1.135/1.265ms, arrays1.215/1.160ms; median frame interval16.655–16.660ms both, p95 approximately16.92–17.05ms. No consistent CPU/FPS improvement demonstrated; draw calls clearly reduced. Earlier animated sampling had large tail spikes and does not establish settled performance.
- No claim of exhaustive material, capture, promotion, mobile or GPU-time verification.

## Skill coverage
- safe-refactor1–EOF/16; real-testing-evidence1–EOF/70; get-your-shit-together1–EOF/27; agent-browser1–EOF/52; look-at-the-screen1–EOF/60. Agent-browser core and trust-boundary guide read through EOF.
- Relevant normal renderer files, piece factory, texture and relief generation and shader chunks read through EOF.

## Previous normal-board completion
- Measurement hooks restored; owned browser closed. Development server remains HTTP200.
- Report normal-board draw-call reduction and appearance preservation; CPU/FPS improvement unproven.

## Taikyoku flat-face trial
- Latest request explicitly authorizes removing variant face relief for this experiment. Normal carving remains unchanged.
- CustomFace now accepts relief:false; shared factory uses flatTop and omits relief normal map while preserving body, grain/glyph textures, dimensions, coating and gloss settings.
- taikyokuPiece supplies relief:false, covering live 3D, physical captures, promotion and baked2D through the shared factory. Temporary benchmark scene flags/debug hook removed from source.
- Real headed browser taikyoku-flat, localhost:5173/taikyoku, Apple M2 Pro ANGLE Metal;804 starting pieces,1152×471 drawing buffer DPR1. Full board and matching close-up carved/flat screenshots directly inspected.
- Both modes:230 batches and622 draw calls when redrawing shadows. Carved piece triangles968820, flat45024; full render including shadows1949359 versus101767.
- EXT_disjoint_timer_query_webgl2 measurements,70 rendered frames each / first10 discarded.59 ready GPU queries per mode; GPU disjoint false. Carved median GPU3.640083ms; flat1.797875ms, repeat1.858208ms. Flat cuts measured GPU render time49–51 percent under this view.
- CPU medians carved2.55ms, flat2.66ms, repeat2.45ms. No consistent CPU speedup or device-wide FPS claim. All timing draws forced shadow updates, equivalent across modes.
- Latest application TypeScript, scoped single-thread lint, formatting passed. Browser errors empty. Completed baked2D and final3D previews directly inspected, no loading indicator or browser errors. Measurement globals removed; owned taikyoku-flat browser closed.

## Taikyoku texture-array verification
- Current real headed browser A/B,804 pieces,1152×471 drawing buffer:230 versus16 batches;622 versus194 total draw calls including forced shadows;101767 triangles unchanged.
- Framebuffer comparison: all2170368 channels identical,0 changed channels, maximum and mean difference0. Full rendered screenshot inspected; browser errors empty.
-70 frames per measurement, first10 discarded,60 ready GPU queries, disjointfalse. Exact-material baseline CPU median2.335ms / GPU1.783375ms; arrays CPU0.905ms / GPU1.726166ms; arrays repeat CPU0.945ms / GPU1.533624ms. CPU submission reduction demonstrated; GPU improvement smaller and variable after flat geometry.
- Capture batching enabled through shared manager; capture gameplay and other finishes not exhaustively verified. No FPS or device-wide speedup claim.
- Temporary measurement hook removed from source. Screenshot conductor/taikyoku-arrays.png is local evidence, not a commit deliverable.

## Gameplay and performance follow-up
- Focused durable documentation: docs/performance/piece-instancing.md. Explicitly distinguishes both-mode instancing from Taikyoku-only flat geometry, records implementation, measurement conditions, initial and post-gameplay results and limits.
- Real normal analyze pointer workflow:7g7f,3c3d,8h2b capture and promotion.3 moves, captured bishop in hand, dragon horse displayed, animation settled, screenshot inspected.
- Normal post-gameplay alternating70-frame windows /60 valid queries: original calls305/306, CPU1.750/2.095ms, GPU1.172083/1.203208ms; instancing calls108/106, CPU1.310/1.135ms, GPU1.251874/1.343500ms. Mean of window medians:64.98% fewer calls,36.41% lower CPU; GPU9.27% higher. Avatar motion causes minor triangle-count variation, no exact full-scene equivalence claim.
- Real Taikyoku pointer selected/lifted18-eleven pawn, moved18-twelve. Actual engine replied19-thirty-three to19-three Great General;788 board pieces,16 captures,393/395 counts,3 capture batches, animation settled, screenshots inspected, browser errors empty.
- Post-gameplay board-only arrays comparison, capture arrays unchanged:230→16 board batches,634→206 calls,101807 triangles identical. CPU2.730/2.600→1.305/1.200ms; GPU0.815833/0.933374→0.884125/0.863541ms.60 valid queries per window, disjointfalse.67.51% fewer calls,53.00% lower CPU, GPU essentially unchanged.

## Patch release
- Fetched origin; main and origin/main divergence0/0 before release. Git identity hamzaabamboo@gmail.com; GitHub CLI switched to hamzaabamboo.
- verification-before-completion SKILL.md read1–EOF,120 lines. Release workflow .release-it.json read fully: dataset validation, lint, formatting, production build, version/changelog/commit/tag/push, GitHub release.
- Local screenshots excluded from release; implementation, performance documentation and compact task record included.

## Immediate next action
- Format changed files, validate release scope, commit implementation, run capped release:patch, verify remote tag/release and workflow status.
