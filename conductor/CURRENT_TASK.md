# Current task

## Scope and authorization
- Atlas baking requested across preview and sprite paths. Promotion atlas contains twelve faces, shared by both players, with one render/readback/PNG and CSS cropping. Remove per-tile frame waits from promotion preparation. Settings groups now render once per option and crop; flat sprites render one atlas per side and crop. Real-GPU promotion atlas crops and settings preview strip inspected in the running app; flat sprite atlas inspected after switching the running app to flat mode.
- Loading UI must show actual phases and completed-item counts. Investigate Portella holes in glyphs and preserve authentic 3D promotion previews, prepared with the board in the shared context.
- Additional requirements: promotion choices must reuse prepared face images instead of rebaking on each picker opening; rendering quality should adapt to device capacity and screen size.
- Ensure settings facesets, glyph fonts, front/reverse and guide previews render correctly. Bake reusable assets for speed and bounded memory.
- Investigate progressive 3D ink loss, black promotion undersides and freezes; implement an evidence-backed solution.
- Also fix iPad empty bottom space and sheet drag behavior; restore successive capture sounds and add a small clack when the captured tile lands on the komadai.
- Patch checks passed and real-GPU promotion/settings/flat atlas screenshots inspected; commit and push in progress.
- Local investigation and fixes authorized. Temporary server approved; LAN access requested for iPad testing. Commit and push authorized for this patch. No PR, deployment, device or audio changes authorized.
- Branch: fix/3d-rendering-lifetime, based on fetched origin/main 74a86f5.

## Source of truth
- Supplied rendering handoff fully read from remote branch; document absent from merged main.
- PR #7 rendering commits are merged into current main; previous open-PR state is stale.
- Root cause and real-GPU long-session validation remain unproven.
- Direction: sequential renderer usage, bounded shared texture resources and stable scene lifetime.
- Preserve appearance options and promotion behavior. Software GL does not establish real-GPU correctness.
- Follow CLAUDE.md identity, branch and release rules. No agent attribution or unsolicited PR.

## Gates and evidence
- systematic-debugging SKILL.md read 1–EOF, 283 lines. Root-cause investigation active.
- Current session requirements reconciled; no prior-session reads.
- Initial checkout clean; fast-forwarded main by 15 commits before creating investigation branch.
- Read current textures.ts and relief.ts completely; tracking cache eviction and derived texture ownership.

## Correction and architecture
- Settings changes are the primary reproduction trigger; prioritize unified renderer architecture.
- Mistake to avoid: treating shared bake queue as unified rendering while the board still remounts separately.
- Source: BoardStage appearance key, Board3D cleanup, bake renderer ownership and Three texture disposal listeners.
- Rule: tile appearance changes preserve the board renderer, scene and avatars; previews use the same context.
- Action: implement retained renderer ownership and render-target preview capture with state restoration.
- Real GPU verified settings preserve identities and create no new contexts. Classic/Elegant repeated cycle plateau: 260 geometries, 339 textures. Forced context loss/restore recovers visible ink. Main-app promotion and consecutive captures render; 45ms clacks coincide with captured-tile komadai coordinates, 600ms before board landing. Autoplay consecutive captures both retain clacks at 1100ms cadence. Physical audio remains muted; original long-session failure unproven.

## Skill coverage
- get-your-shit-together 1–EOF (27 lines), real-testing-evidence 1–EOF (70 lines), agent-browser 1–EOF (52 lines).
- agent-browser core workflow read completely; systematic-debugging/root-cause-tracing.md 1–EOF (169 lines).

## Initial-load correction
- Portella asset extraction removed bright neutral ink highlights and classified warm antialiased edges as red. Updated extraction to recover neutral highlights adjacent to dark strokes and normalize ink color per glyph; regenerated both Portella sets and changed their asset URL revision to 19. Portella option glyph and board screenshot inspected; source promoted pawn uses black ink, preserved in extracted glyph.
- Flat promotion preview replacement rejected. Promotion picker now consumes decoded 3D render-target images precomputed for both sides with the board's shared renderer. Board readiness waits for those images; picker does not start a bake. Runtime first opening inspected with both 192px images complete.
- Loading UI reports artwork/font jobs, 3D preview counts, piece preparation/upload counts and shader phase. Progress tracks completed work; shader wait is indeterminate.
- Replay flicker is reported as current-move header growth shifting the board. Prior renderer-focused investigation missed the visible layout trigger. Verify starting-position and move header bounds, reserve the move label row, then replay through moves in the running browser.
- Current move label now always has ply, move and turn rows, including an empty reserved move row at the starting position. Header bounds verified unchanged during replay; physical-iPad FPS remains unverified.
- Additional active request: investigate sub-60 FPS. Measure actual CPU/GPU frame workload before selecting rendering-quality or animation changes.
- User authorizes reducing rendering quality. Main board and warmup relief segments reduced 48 to 24, default piece segments 64 to 24; pixel-ratio cap reduced to 1.5 touch / 2 desktop; shadow maps 512 touch / 1024 desktop. Glyph faces remain 256px.
- Aggregate bun run check passed after header and quality changes. Existing lint and Node warnings remain. Heavier-scene browser commands stalled; owned daemon/browser terminated, relaunch in progress with headed env on every command to avoid unintended headless relaunch.
- Header runtime comparison at 834×1194: starting position and played moves both heading 59.5px, board y118.5px / height1007.5px. Mac top-view visible sample median16.665ms / p9516.67ms; does not establish physical-iPad FPS.
- Promotion setup displayed the promoted destination mesh at the source before pickup. Show the original face immediately and hide the promoted mesh until landing; verify reach, carry and placement in the running harness.
- First 3D frame freezes the full page on the physical iPad. Existing preparation only handled appearance changes; initial position rebuild and board-font refresh still create all pieces synchronously. Prior checks did not establish initial-load responsiveness.
- Immediate target: yield during cold piece preparation and GPU upload; preserve working renderer and settings, then verify first-load responsiveness in headed browser.
- Initial rebuild and font-triggered duplicate rebuild removed. Preparation processes jobs within a 6ms frame budget; shaders compile asynchronously before rendering. Normal/lacquer maps shared by glyph across grain variants.
- Latest real-GPU reload: complete board frame at 1101ms; Settings input starts at 740ms before completion, input delay 92ms. A later 213ms long task remains; zero-stall and physical-iPad responsiveness are not established. Renderer memory 218 geometries / 159 textures for the current saved position.
- PNG faceset option glyphs render as direct images without vertical-writing wrapper. All option cards inspected at 834px; physical Safari remains unverified.

## Next action
- Physical iPad test URL: http://192.168.3.60:5173. Mac en0 address read directly; LAN HTTP returned 200. Temporary dev server authorized and running on localhost:5173, owned exec session 12867, bound to 0.0.0.0 for requested iPad testing; stop after device testing finishes.
- Isolated headed browser rendering uses mock keychain/basic password store and mute-audio. Existing default session untouched. GPU confirmed ANGLE Metal Apple M2 Pro.
- Isolated rendering browser used for current atlas verification. Existing default session untouched. LAN server remains available for ongoing requested physical-iPad testing.
- look-at-the-screen SKILL.md 1–EOF (60 lines). Baseline screenshot inspected; onboarding footer clipped at initial short viewport, enlarged viewport used to complete onboarding.
- iPad helper completed; root independently verified 768px drag and inspected corrected 834px and 1024px portrait screenshots. No physical iPad proof yet.

## Implementation and verification state
- Shared renderer leases now cover board, queued bake jobs, hand snapshots and piece viewer; bake capture uses render targets plus OutputPass color conversion.
- Tile settings preserve scene/avatar identities; preparation yields between pieces. Four grain variants replace per-piece texture seeds.
- Explicit cached/live resource ownership defers eviction until last user; normal/lacquer textures use typed pixels.
- Removed incorrect capture-start sounds from all board modes. Small clack now runs in the avatar capture-transfer completion after placement on the komadai, including interrupted transfers settled there. Runtime timing verified in dev harness and main app; clack coordinates equal both komadai positions.
- At 768×1024, downward pointer drag shrinks sheet and retains release size; screenshots inspected, document overflow zero. At 834×1194 desktop columns leave the board narrow and excessive vertical room. Compact layout now includes portrait viewports through 1024px; 834×1194 and 1024×1366 screenshots inspected with controls at bottom and no extra bottom gap.
- Delegate skill coverage: surgical-patch 1–EOF (16 lines), look-at-the-screen 1–EOF (60), GYST 1–EOF (27).
- Fresh reload on real GPU: 158 textures versus earlier 244; this is a changed-grain comparison, not a certified same-design benchmark.
- Aggregate check passed after atlas changes; existing lint warnings and Node version warning remain.
- Latest aggregate bun run check passed after promotion visibility, glyph-derived sharing and 6ms preparation changes. git diff --check passed. Existing lint warnings and Node version warning remain.
- Promotion harness inspected: frame 0 shows original pawn at 5d, frame 27 carries and turns it, frame 82 shows promoted tile at 5c.
- Gote promotion inspected at frame 0 and 82: original face remains at 5f before pickup, promoted face appears at 5g after landing.
