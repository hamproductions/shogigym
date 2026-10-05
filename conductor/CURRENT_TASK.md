# Current task

## Scope and authorization
- Current release authorization: commit remaining changes, bump minor from 1.0.1 to 1.1.0 with release-it, push and deploy Pages; verify workflow outcome and clean tree.
- Diagram uses shared OverMarks for best-arrow labels and drop recommendations; remove divergent arrow path and duplicate check badge.
- Play and analysis share the selected engine instance. Show first live recommendation immediately, hold displayed arrows during search, replace on completed quick/deep results; evaluation bar streams every primary-PV score. Never hide recommendations during deeper search.
- Across every mode, shared 3D move arrows sit flush on board at the existing 0.008 surface-overlay height, with depth testing so pieces occlude them. Preserve readable arrow labels. TypeScript passed; rendered result unverified.
- Replace ambiguous crossed-tool Play icon with opposing pentagonal shogi tile outlines; preserve all other icons.
- Escape, right-click and outside-tile click release tile lock only. None exits Look around; remove existing Escape shortcut that disabled Look around. Orbit remains enabled while locked.
- Touch camera gestures allow rotation and pinch zoom without panning; desktop mouse controls preserved.
- Tile POV default camera moves back one tile depth and raises clearance to 40% of tile depth; preserve orbit and follow behavior.
- Preserve and commit current local work to leave a clean working tree.
- Move recommendations/arrows wait for final analysis; evaluation bar continues using provisional scores.
- Look around supports right-click or double-click on a tile to follow its POV while retaining orbit controls. Escape or leaving Look around releases lock. Icon source is crossed swords, not shogi pieces.
- Localize remaining generic settings typeface labels, accessibility descriptions and language label; localized option-group layout must not depend on English text.
- Impact win overview follows supplied diagonal screenshot: fixed world direction (-1, 1.4, 1), approximately 45-degree elevation/azimuth, framing board/stands with room margin instead of retaining arbitrary camera orientation. Screenshot inspected; render match unverified.
- Impact-mode win camera: pull back toward board/stand overview, frame real geometry with environment margin, reduce finale dimming so room remains visible. No screenshot captures.
- Eval bar: publish live primary-PV engine scores during search and display provisional evaluation without waiting for final analysis; cancelled positions must not update UI.
- Initial loading: shared spinner/bar across app, board and Hands startup; Hands progress reports three completed asset stages. No screenshot captures.
- Arm collision: constrain IK elbow bend around actual board and stand geometry; keep hand target and limb lengths. No screenshot captures.
- Reach posture: active elbow bends outward rather than down; hand approach follows shoulder-to-target direction instead of fixed straight-ahead facing. No screenshot captures.
- Far reach avatar pose: prefer deeper forward hip/back bending while staying seated; reduce knee-rise preference. No further screenshot captures.
- Hands debug: preserve camera across setting/pattern changes; present animation choices as direct-trigger pads; extend far-reach examples to opposite board edge.
- Hands debug page: await font, piece-set and guide assets before first rebuild; show loading/error state and reload when set or guide changes.
- Toolbar: command palette and Control start the bottom block after the mode list; table flip immediately below Look around; bottom order Hide UI, Full screen, Volume, Settings; Reverse in top bar. Apply surgical-patch (SKILL.md read 1–EOF).
- Clicking during a table flip must reset immediately; tolerate small pointer movement while preserving camera drags.
- Fix table-flip reset: position changes must restore board and stands immediately, remove thrown clones and reveal retained tiles instead of waiting for physics to settle.
- Game-end replacement applies to audio only: keep visual 詰み and spoken ありがとうございました. Restored stamp and original font sizing; previously generated reel media still reflects superseded visual text and has not been rerendered.
- Fix ink disappearing after sustained play; reuse tiles rather than recreating them on every move.
- When capture changes hand layout, tiles already on the stand must slide and rotate into their new positions instead of jumping.
- Temporary local dev server authorized for verification; stop owned server/browser afterward.
- No new tests, device/system changes or delegates authorized.

## Implementation
- Retain tile objects across moves, promotion, capture and hand layouts; refresh changed visuals only.
- Dispose retired materials, hand-count textures and temporary promotion/capture materials.
- Reuse unchanged overlays; dispose replaced geometry/materials and owned textures while preserving shared coordinate textures.
- Font invalidation clears glyph cache and advances revision so retained tiles refresh after font loading.
- Existing stand tiles slide and rotate to updated hand layout over 550ms; retain individual mesh identities and preserve ongoing slide targets.

## Evidence
- Impact finale now pulls back around board/stand bounds with FOV/aspect fit and environment margin, reduces dimming, and retains overview through automatic table flip until reset/new position. TypeScript/diff checks passed. Rendered finale remains unverified; no captures taken.
- Eval bar final-only gate removed. Engine primary-PV updates stream into current-position analysis during quick/deep search, guarded against cancelled positions. TypeScript/diff checks passed; live engine/browser behavior unverified.
- Shared BoardLoading now renders spinner/progress bar with reduced-motion support. App and Hands route fallbacks use it; Hands gates startup overlay with completed font, glyph/guide, and avatar stages. TypeScript/diff checks passed. Visual startup result unverified; no captures taken.
- Board/stand meshes now provide world-space collision bounds to arm IK. Solver checks radius-expanded arm segments and searches alternate elbow bend angles when obstructed, retaining wrist target and bone lengths. TypeScript/diff checks passed; visual collision result remains unverified. No captures taken.
- Active reach elbow pole now favors lateral bend with reduced downward pull; hand orientation follows horizontal shoulder-to-target direction. TypeScript/diff checks passed. Rendered posture remains unverified; no captures taken.
- Reach planner now allows 76-degree forward lean, checks head clearance above table instead of restricting forward overhang, and raises knee-rise cost from 0.8 to 3. TypeScript/diff checks passed; rendered pose remains unverified.
- Hands controls now use paired direct-trigger pads. Browser action selection and room change preserved top-down camera; observed loading state during room reload. TypeScript/diff checks passed. Further screenshots stopped at user request; full far-reach playback remains unverified.
- frontend-design SKILL.md read 1–EOF; HandsTest source and supplied screenshot inspected. Camera pose retained across scene recreation; overlay/cut-away toggles no longer recreate scene. Direct-trigger paired action pads and collapsed bone measurements added; far reach now spans eight ranks.
- HandsTest cold load with letters/one/lines rendered board and line guides; frame-forward click worked without browser errors. Screenshot inspected; TypeScript and diff checks passed. Asset initialization now awaits font and piece/guide loader, with visible loading/error state.
- Toolbar rendered order verified in browser: mode list, spacer, palette, Control, Tilt, Look around, table flip, overflow, Hide UI, Full screen, Volume, Settings. Reverse rendered in top bar. Compact toolbar fits 390px; TypeScript/diff checks passed.
- Actual browser mouse click during active flip restored the board immediately: flip cleared, tiles visible, board reparented to root. Inspected restored rendering; TypeScript and diff checks passed. Click handler now resets directly and accepts up to 5px pointer jitter.
- Table-flip reset verified in running WebGL renderer using existing reel clock: active flip hid 40 tiles; subsequent position change restored board parent and visibility, removed all 40 thrown clones, retained 40 tiles. Inspected restored board screenshot. TypeScript and diff checks passed.
- surgical-patch SKILL.md read 1–EOF (16 lines); relevant tile, texture, hand, avatar, overlay and baking sources read fully.
- Before overlay fix, 100 refreshes added 2000 GPU geometries.
- After fix, 500 actual WebGL refreshes held geometries at 272 and textures at 322; same 40 tile objects and ink materials retained.
- Promotion-in-progress refresh and subsequent capture retained all 40 original tiles; animations completed.
- Inspected .shots/promo/current/ink-stability.png: ink remains visible. Browser errors empty.
- bun run check and latest TypeScript check passed; existing lint and Node-version warnings remain.
- Capture in real WebGL renderer shifted three existing stand tiles: initial positions preserved, halfway positions between endpoints, final positions/quaternions matched targets; retained objects and zero remaining animations. Console errors empty and latest TypeScript/diff checks passed.
- Owned verification browser and dev server stopped.
- Physical iPad disappearing-ink symptom not reproduced; demonstrated resource leaks and excessive rebuilding addressed. No claim of zero leaks across every path.

## Next action
Release v1.1.0 published at commit 40621a5; canonical validation/lint/format/build passed, Pages build/deploy succeeded in run 37274954169. Release-it GitHub authentication failed; native gh published the verified tag. No remaining implementation action. Tile POV, touch gestures, Diagram overlays and settings localization remain browser-unverified. No captures; owned server/browser stopped.
