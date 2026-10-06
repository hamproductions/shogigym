# Handoff: 3D rendering instability (tiles lose ink, page freezes/flashes)

Written for a local session on a machine with a **real GPU**. The cloud session only had software GL
(SwiftShader), so it could not reproduce the long-session failure. Read "What is NOT known" first.

## Symptoms (user, still present after PR #6 merged)

1. App degrades the longer it is used. Whole page freezes, in the worst case flashes, sometimes the 3D model fails to render.
2. Tiles (pieces) lose their black ink / marks over time. After a while "the image goes crisper" and then everything breaks.
3. When a piece flips (promotion) the whole underside face renders black.
4. Settings font preview does not show properly.
5. Tile rendering is janky and sometimes takes down the whole page. User's request: **use one renderer, sequentially**.

## State of the work

- PR #6 (merged): only its first commit, `8296b34`.
  - LRU-bounded + disposed texture caches (`textures.ts`, `piece.ts`, `relief.ts`)
  - flat-top geometry for no-relief finishes, 48 segments instead of 64 (about 660k -> 374k triangles on the start position)
  - `webglcontextrestored` handler in `Board3D.tsx`
  - **Show tesuji** setting (`showTesuji`, default on) gating the banner, board note and move-list tags
- PR #7 (open): branch `fix/3d-texture-leak-black-faces`, head `a4d9617`.
  - `bake.ts`: all bakes (`bakeFlat`, `bakePreviews`, `bakeBoardPreviews`) go through one queue on one shared renderer, released after 4s idle. Measured 4 overlapping bakes -> 1 new context.
  - `textures.ts`: glyphs are not cached until `document.fonts.check` passes (previously a fallback-font glyph was cached forever under the real font's key).
  - Sharper table: board texture 3x (1.5x touch), pixel-ratio cap 3 desktop / 2 touch (touch was 1). Verified visually on a phone profile, big improvement. Piece textures are unchanged at 256.

## What is NOT known

- **Root cause of the ink loss and black underside is not found.** In software GL a freshly built piece (black and white, flipped) renders correctly, so geometry/winding is not the problem. It is a state-over-time problem.
- The cache/dispose work and the shared bake renderer are hypotheses that fit the symptoms. The user reports no change, so assume they are **not sufficient**.
- Nothing was measured over a long session. The only leak measurement: before the fix, 3 GPU textures leaked per piece created and disposed (`renderer.info.memory.textures` +3 per piece). No after-measurement was obtained (timed out on software GL).
- A normal app load creates 2 WebGL contexts (main board + shared bake). The piece viewer modal adds a third.

## Suspects, ranked

1. **Canvas/texture backing store loss under memory pressure.** Every face, side, lacquer and relief texture is a separate 2D `<canvas>` uploaded once via `CanvasTexture`. Hundreds of canvases, some GPU-accelerated, some read back with `getImageData`. Chrome can discard or lose 2D canvas contents. If a texture is later re-uploaded (after eviction `dispose()`, a bake in another context, context restore) from a blanked canvas, ink disappears and faces go black. Fits "ink vanishes, then everything breaks". **Test:** periodically read back pixels of `texture.image` for a live face texture and check it still has dark pixels.
2. **Context loss / churn.** Check `webglcontextlost` events and Chrome's "Too many active WebGL contexts" console warning. `Board3D` is keyed on appearance settings in `BoardStage.tsx`, so every appearance change tears down a whole context (renderer, VRM avatars, room) and builds a new one.
3. **Synchronous main-thread cost per piece.** `pieceMesh` builds a 256x256 distance transform, blur, normal map and lacquer map, then a carved grid, all on the main thread inside `rebuild()` on every position change. This is the jank. Page "shits itself" could be a long task plus GPU stall.
4. **Shared global textures across contexts.** The same `THREE.Texture` objects (global `faceCache`) are uploaded into both the main renderer and the bake renderer. Disposing one in an eviction fires `dispose` for every renderer that uploaded it.

## Suggested direction (the user's ask: one renderer, used sequentially)

- **Stop making a mesh with unique textures per piece.** Build a small fixed atlas once: one glyph texture per (type, color) plus a handful (say 4-6) of shared grain/side textures; pieces pick a variant. That bounds textures to tens, removes per-piece canvas creation and per-piece relief/normal generation, and makes rebuilds cheap.
- **Do not remount `Board3D` on appearance change.** Update materials/textures in place so there is one long-lived context. Today the `key=` in `BoardStage.tsx` forces a full teardown/rebuild.
- **Bake sprites with the main renderer** (a render target, or `renderer.setViewport` + `readPixels`/`toDataURL` while the loop is paused) instead of a second context. If a second renderer is kept, keep the queue in `bake.ts`.
- Consider `ImageBitmap` / `OffscreenCanvas` as texture sources so the pixels do not live in a discardable 2D canvas, and free the canvas after upload where nothing re-reads it (note `inkMask`/`finishMask` read `glyphCanvas`).
- Move the distance transform / normal / lacquer generation off the main thread or precompute per glyph once at startup behind a loading state.
- Only render when something changed (the loop runs every frame even with the settings dialog open).

## How to investigate locally

```bash
bun install
bunx react-router dev --port 5173
```

- Use `environment: traditional` or `casual` in Settings. `flat`/`diagram`/`broadcast` have no 3D scene.
- In dev only, `window.__dbg` is the scene state. Useful live counters:
  - `__dbg.renderer.info.memory` -> `{ geometries, textures }` (should plateau, not climb)
  - `__dbg.renderer.info.render` -> `calls`, `triangles`
  - `__dbg.renderer.getContext().isContextLost()`
- Production builds have no `__dbg`. Consider adding a `?debug` hook that exposes the same numbers.
- `chrome://gpu` and the DevTools Memory/Performance panels (GPU memory, long tasks) are the real instruments. Reproduce with a long game (step through 100+ moves, promotions and captures), then change piece finish / font / material a few times, and open Settings (it triggers bakes).
- Add temporary listeners on `renderer.domElement` for `webglcontextlost` / `webglcontextrestored` and log them with a timestamp.
- Quick leak check: loop create/dispose of `pieceMesh` in the console via `await import('/src/rendering/board3d/piece.ts')` and watch `info.memory.textures`.

## Key code

- `src/rendering/Board3D.tsx`: mount, render loop, context-restore handler
- `src/rendering/board3d/scene.ts`: `createRenderer` (pixel ratio cap), `disposeRenderer`, `boardTopMaterial`
- `src/rendering/board3d/piece.ts`: `pieceMesh`, `carvedTop`/`flatTop`, side texture cache, `disposePiece`
- `src/rendering/board3d/textures.ts`: face/art/glyph caches, `remember`/`recall` LRU, `FACE`, `BOARD_SCALE`
- `src/rendering/board3d/relief.ts`: ink mask, distance transform, lacquer/normal maps, `releaseDerived`
- `src/rendering/board3d/bake.ts`: shared renderer queue (`withBakeRenderer`)
- `src/rendering/board3d/pieces.ts`: `rebuild`, piece reuse, flip animation (`flip` mesh created and disposed per promotion)
- `src/app/hooks/useBakedPieces.ts`, `src/app/dialogs/SettingsDialog.tsx`: bake callers
- `src/app/stage/BoardStage.tsx`: the `key=` that remounts `Board3D`

## Repo rules (CLAUDE.md)

- Commit as Tanyawat Vittayapalotai <hamzaabamboo@gmail.com>. No Claude attribution or session trailers in commits or PRs.
- Short branch names (`fix/...`, `feat/...`), never `claude/...`. Do not open a PR unless asked; attach screenshots for visual changes.
- Do not hand-edit the version or CHANGELOG on a feature branch.
- Before pushing: `bun run check` (oxlint, prettier, typecheck). Lint currently reports pre-existing warnings only.

## Not done / open items

- Black underside on flip: not reproduced, not fixed.
- Font preview: fix is code-level only; not rendered end to end.
- No screenshots in PR #7 (there are before/after renders in the cloud session's scratchpad only).
- Piece face textures are still 256 px. Desktop pieces may look soft zoomed in; raising it costs GPU memory and was reverted.
