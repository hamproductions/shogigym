# Current task

## Scope and result
- Current authorization: commit current rendering and interaction changes locally; provide an iPad LAN preview. No push, release or deployment authorized.
- iPad preview: http://192.168.3.60:5174, dev server bound to 0.0.0.0, session 63428. LAN HTTP responds 200. Preserve this preview and existing localhost:5173 server for active testing. Physical iPad behavior unverified.
- Latest sizing fixes: floating panel free-space calculation now excludes actual formation/caption bounds instead of assuming a 48px footer; hot-refresh replaces the zone reporter without replacing renderer. Notes and bottom formation strip share a stacked caption container. Tab underline no longer uses negative bottom margin. Sound popup updates its anchor on scroll, viewport resize and rotation, and clamps to viewport edges.
- Runtime proof: desktop floating left panel bottom 500.797, formation strip top 512.813, 12px gap; screenshot inspected. At 768x1024, sound popup remains within viewport after rotation (left 590, right 758), below sound button; portrait panel tabs inspected with flush underline. TypeScript and whitespace checks pass.
- Adaptive resolution can recover after five fast sampling windows; long pauses excluded from sampling. Physical iPad frame rate and sharpness remain unverified. Announcement text-fit adjustments remain visually unverified; no claim of final design acceptance.
- Immediate next action: commit reviewed changes and verify clean Git state.
- Avatar frustum culling uses current bone poses and conservative morph bounds. Static shadows are cached with caster/light invalidation; animated casters retain continuous updates. Panel geometry skips unchanged inputs.
- Real headed Apple M2 Pro GPU at 1440x1000, pixel ratio 1: overhead calls 472 to 170, triangles 193604 to 84090. Equivalent 120-frame runtime samples: CPU render median 2.105ms to 1.550ms; both median frame intervals approximately 16.6ms. No claim about other hardware.
- Pointer move, avatar carry/place/withdraw, tilt, orbit, desktop/mobile resize and table flip inspected in real browser. Idle and table-flip poses contain all 52319 vertices; 60 moving frames sampled 453000 vertices with none outside culling bounds. No browser errors or context loss observed. Physical mobile hardware and context restoration unverified.
- TypeScript, changed-file formatting and whitespace checks pass. Targeted lint has existing React ref warning only. No tests added.

## Skills
- performance 1–EOF/399 and required MEASUREMENT 1–EOF/107; agent-browser 1–EOF/52 plus complete installed CLI core guide; real-testing-evidence 1–EOF/70; look-at-the-screen 1–EOF/60; get-your-shit-together 1–EOF/27.

## Correction receipt
- Correction: user owns active browser/device testing; stop independent browser verification.
- Mistake: continued headed browser checks despite requests for immediate edits and minimal interaction, delaying the requested commit.
- Source: latest correction and current task record showing independent viewport, screenshot and popup checks during active user testing.
- Rule change: AGENTS.md now requires edits and essential source checks only during user-led testing; no independent browser sessions or sweeps unless explicitly requested.
- Action: owned ipad-layout browser already closed; no further browser commands. Preserve both development servers. Resume local commit only.
- Verification: local diff and commit state only; UI and physical iPad acceptance remain with user. get-your-shit-together fully read 1–EOF/27.

## Active geometry reduction
- Reduce room subdivisions conservatively while retaining existing smooth normals, bevel radii, materials and placement.
- Scope: sky dome, zabuton, armrest upholstery, sofa/pillows, chair cushions, monstera leaves and oranges in src/rendering/room.ts.
- surgical-patch read 1–EOF/16; existing browser and visual inspection skill gates retained.
- Implemented conservative subdivision reductions; smooth normals and bevel radii retained. Actual generated triangles including sky: traditional 15492 to 10564; casual 25754 to 17434.
- TypeScript and whitespace checks pass. Both room styles rendered and screenshots inspected in isolated headed browser; no app errors reported. Owned browser closed. User-testing server remains running. No push or commit.

## Active follow-up
- Camera submission comparison completed below.
- Checkmate thank-you voice now routes through Board3D tile-landing callback to useAnnouncements, with current-SFEN guard; flat views retain immediate speech.
- Actual headed browser imported a fresh mate-in-one position through UI and advanced the move. Avatar landing callback recorded y=0 at 31063.35ms; 1.664s thank-you AudioBuffer started at 31085.595ms, 22.245ms after landing. Browser audio muted. TypeScript and diff checks pass.
- Visibility comparison verified through actual main-camera mesh onBeforeRender callbacks and renderer.info in isolated headed browser; screenshots inspected. Same fully loaded traditional scene, 369 meshes, drawing buffer 1152x471, pixel ratio 1.
- Top: 175 meshes, 187 draws, 82770 submitted triangles, 10 skinned meshes/15955 geometry triangles. Tilted: 245 meshes, 264 draws, 117014 triangles. Sample orbit: 271 meshes, 294 draws, 127102 triangles. After pointer orbit: 260 meshes, 282 draws, 125490 triangles. Idle motion causes minor variation; final top sample 174 meshes/186 calls/82386 triangles.
- Main-camera figures exclude shadow passes. Forced shadow refresh adds 238 draws/121840 triangles in sampled orbit. Current final top normal frame had cached shadows. All 169 avatar skinned meshes had castShadow=false; no claim that those meshes force shadow updates in this scene. Top renders continuously and UI overlays do not provide GPU occlusion. No FPS/GPU timing improvement claim; stalled timing sampler discarded.
- Audio timing fix verified; browser errors empty. No further rendering changes in this follow-up. Owned browser closed; dev server left running.
- real-testing-evidence re-read 1–EOF/70. Surgical-patch guidance retained. Verify real browser landing/audio start ordering, TypeScript, and diff. Keep dev server running.

## Mobile optimization result
- Improve mobile rendering without changing appearance or interaction unnecessarily. First verify frustum culling by same-camera enabled/disabled A/B in mobile browser.
- Scope: rendering pipeline and avatar update cost; preserve existing local changes, renderer lifetime, board interactions and landing speech.
- performance, agent-browser and real-testing-evidence previously read through EOF; retained guidance applies. No push, commit, release or device/system changes. Keep user-testing server running.
- Implemented compact-rendering policy for narrow or coarse-pointer screens: 16 piece-face subdivisions (desktop 24), pixel ratio capped at 1.5, 512 shadow maps. Avatar outline materials skipped only when the existing fade shader completely discards them; restored when camera moves away.
- Same-camera culling A/B in 393px phone-sized Chromium: enabled 174 calls/88950 triangles; disabled 340 calls/144984 triangles. Culling verified, original flags restored.
- Same-pose geometry/outline A/B after mobile edits: previous settings 178 calls/89452 triangles; optimized 173 calls/53361 triangles, 40 pieces and 10 skipped outline materials. Temporary high-detail geometry restored/disposed. Normal 40-piece faces are 512 triangles instead of 1152.
- Phone-sized DPR3 browser verified live pixel ratio 1.5 and 512 shadows. Actual mobile pointer was not emulated by device preset (coarse=false); narrow-screen policy exercised. Physical mobile GPU/FPS unverified.
- Real pointer UI move 7g7f completed with avatar animation and AI reply. Traditional top and orbit screenshots inspected; outlines restored in orbit. Casual appearance inspected; renderer identity retained across environment switch. No browser errors.
- TypeScript, formatting and diff checks pass; targeted single-thread lint reports only pre-existing Board3D ref warning. No tests added, no push or commit. Owned mobile-render browser closed; pre-existing sessions preserved. Dev server remains running.

## Active board overlay correction
- Latest scope: fix incomplete glass underside/solid face appearance; preserve earlier announcement fitting, material and rendering fixes. Enable piece movement while orbiting and existing variation branching in paused View. No deployment, push, commit, new tests or system changes.
- Orbit input root: camera movement cancelled every piece drag and empty-square releases were intercepted. Movable-piece gestures now temporarily disable OrbitControls; release/cancel restores controls; empty destination clicks reach board handlers. Real headed drag moved king 5a4b with orbit enabled, camera unchanged, controls restored.
- View root: userTurn, board handlers and application commit rejected moves, while tree tracking excluded View. Scoped guards changed to permit paused View and reuse existing variation tree. Actual watched game reached 16 moves; paused, returned to start, dragged 6g6f into a variation, returned to preserved original 16-move mainline. TypeScript and whitespace checks pass.
- Glass close-up correction remains active: glyph textures have transparent corners; bottom normals point downward. Physical shell now uses full transmission, depth writing and double-sided single-pass surfaces; reverse glyph remains outward-only. Reloaded browser verification pending. Do not claim appearance complete until actual close-up and underside inspected.
- Source: supplied board crop shows check, move-quality and best-arrow labels obscuring piece glyphs. Follow the supplied chess reference: readable quality badge centered on the square corner, not inset; best-arrow label centered on the destination square edge. Initial reduced badge and left-offset label were rejected and corrected.
- Current correction: dark multiply blending removed color coding, and stretched texture caused title overflow beyond ink. Use the colored alpha mask with original 3:1 aspect ratio, rotate about its center (left-origin rotation had displaced the ink beneath the title), and centered 64% safe layout containing title, metadata and seal; calculate type size from name length. Verify actual desktop/mobile render before claiming success.
- Additional active reports: 3D view freezes and tiles fail to update; plastic looks flat; glass does not work. Plastic source uses unlit faces/side walls; glass source has transmission=0. Runtime freeze reproduced with glass: compileAsync ran every frame while render.frame stayed fixed at 15530; glass double-sided glyph material versions incremented by 2 each compile. Installed Three WebGLRenderer.prepareMaterial mutates versions for double-pass transparency. Fix single-pass glyph surfaces, outward-facing back glyph/surface, and record versions after synchronous compile setup and actual drawing (transmission rendering also mutates material versions). Plastic lighting and physical glass transmission corrections implemented; runtime verification pending. Independent materials reader used gpt-6-luna low effort, read-only.
- get-your-shit-together 1–EOF/27, look-at-the-screen 1–EOF/60, frontend-design 1–EOF/71 and brainstorming 1–EOF/285 read. Bounded implementation follows the explicitly requested square-marker placement and restoration of existing banner treatment; no new subsystem.
- Layering correction: square anchoring does not imply depth occlusion. Marker artwork must render above neighboring pieces and arrow geometry; arrow shafts remain underneath pieces.
- Implemented square-corner quality badges at half-square size, centered destination-edge hint labels, square-only check highlighting, arrow shafts beneath pieces and marker artwork above pieces/arrows. Both flat and 3D paths updated, including diagram/broadcast arrow rendering.
- Real browser imported a fresh legal checking position via UI and stepped the move. Desktop initial/check images and 393x852 flat/3D flipped images inspected; final marker artwork is complete, glyphs unobscured. Actual tesuji announcement captured and inspected on mobile; persistent castle typography inspected. Evidence: .shots/board-overlays/ (ignored). Physical device rendering unverified.
- TypeScript, targeted single-thread lint, changed-file formatting and whitespace checks pass. Browser errors empty. Prior mobile/performance/landing fixes and renderer lifetime preserved. No push, commit or new tests.
- Owned board-overlays browser closed; other sessions preserved. Dev server session 72995 remains at http://127.0.0.1:5173 for user testing.
- imagegen read 1–EOF/315, prompting 1–EOF/112 and sample-prompts 1–EOF/422. Built-in transparent asset generated and copied to src/app/stage/announcement-ink.png; source SVG removed. Prompt: a single organic sumi ink swipe with tapered bristle trails and dry-brush grain, transparent background, no text or geometric borders.
- grilling read 1–EOF/28; no required linked references. User selected a combination of ink calligraphy and dramatic cut-in. Implement textured black ink, vermilion seal, staged typography and a brief impact sweep in the shared announcement; preserve corrected markers. Marker corrections complete; flat, 3D and diagram mobile screenshots inspected.
