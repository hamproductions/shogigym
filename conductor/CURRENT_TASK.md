# Current task

## Scope
- Latest correction: fit board and komadai to all available canvas space first. Panels use remaining gaps only; no panel-driven camera sizing or reservation.
- Floating requires two panels. If either remaining gap cannot fit its panel, dock one with all four tabs. Camera angle and orbit do not affect eligibility.
- Resolve narrow pixel-boundary disagreement and automatic switching after resizing. Preserve explicit dock preference across resizing; automatic geometry fallback does not overwrite it.
- Floating tabs split moves/future left and coach/evaluation right. Compact watch controls use icons without overlapping labels.
- Preserve previous renderer/memory, coach, replay styling and install overflow fixes. Patch release and clean worktree requested.

## Authorization
- Local implementation and real browser verification authorized. Commit and patch release authorized by current request.
- Existing dev server session 81111 at http://127.0.0.1:5173 may remain running.
- Use one isolated muted browser; preserve preexisting default session.

## Findings
- Renderer already shared between board and preview bakes; Board3D scene mount effect has no appearance dependency.
- Appearance preparation uploads textures, then rebuilds pieces on same scene.
- View autoplay uses session playing for live AI and replay. BoardBanners treats every playing state as replay.
- Best arrows and stamps check assist, but reply and preview arrows bypass it.

## Skills and evidence
- get-your-shit-together 1–EOF/27; look-at-the-screen 1–EOF/60; agent-browser 1–EOF/52 plus required CLI guide; real-testing-evidence 1–EOF/70.
- Earlier unfuck-yourself 1–EOF/60 repaired free-port project server authorization; supplied current rules include repair.
- Current resize verification uses the real headed Apple M2 Pro GPU browser.

## Implementation and verification
- View assist now respects the settings toggle; live AI at the latest position no longer enters ReviewBanner.
- Piece disposal releases unused GPU allocations while retaining cache source data. Preparation retains uploads until rebuild, then frees unused variants; cancellation frees unused uploads too.
- Promotion atlas is requested only for the picker and cannot block board readiness. Appearance changes retain the visible board.
- Install moved to the end of the rail priority list.
- Real headed Apple M2 Pro/ANGLE Metal browser: pre-fix presets raised textures from 196 to 292 to 376. Fresh final code remained at 166–170 across classic, plastic, elegant, broadcast and classic again. Same renderer, scene and avatars; no context loss.
- Real live AI advanced with coach off: arrows empty, stamp null, evaluation absent, no replay banner or previewing class. Screenshot view-coach-off-live.png inspected.
- Imported isolated promotion position through normal UI; pointer move 5c5b opened both rendered choices, selecting promotion landed promPawn at 5b on same renderer/scene. Screenshot tile-promotion-fixed.png inspected.
- Actual history navigation retains previewing styling and review banner.
- Desktop at 1200px height shows all tools; 1050px moves settings/install to menu while fullscreen remains inline. Mobile 390px menu inspected with install last, no horizontal overflow. Screenshots install-overflow-fixed.png and install-overflow-mobile.png inspected.
- TypeScript and formatting pass; targeted lint has existing React effect/ref warnings only. No tests added. Final aggregate TypeScript, formatting and whitespace checks passed; targeted lint retains existing warnings only.

## Resize implementation and verification
- Board3D keeps existing mount effect, renderer ref, scene and avatars. ResizeObserver only sets a pending flag; plain closure variables hold dimensions and pixel ratio.
- Canvas CSS stays at 100% of host. Camera/layout adapt in render loop; setDrawingBufferSize runs once immediately before a draw. Adaptive pixel-ratio changes queue the same path.
- Real desktop viewport resizing, desktop separator drag, mobile viewport and mobile sheet drag inspected. Canvas/host bounds match; renderer and scene identity unchanged, zero context losses or browser errors.
- Runtime resize instrumentation confirms every observed buffer resize was drawn before next animation frame. Screenshots resize-desktop.png, resize-mobile.png and resize-mobile-panel.png inspected.
- TypeScript and formatting pass; targeted lint reports only existing ref warning. No tests added.

## Responsive correction verification
- Root causes: orbit camera retained distance after aspect/layout changes; orbit disabled floating eligibility; live camera projection moved panel zones.
- Resize now scales orbit-camera offset by old/new fit ratio, preserving direction and relative zoom. Same renderer and scene retained.
- Floating zones use an independent overhead camera; orbit no longer gates eligibility. Floating capacity takes precedence over explicit preference; floating requires both panels to fit remaining gaps without changing camera fitting.
- Real headed GPU browser: overhead, tilted and pointer-rotated views retain floating panels; tilt and orbit drag leave panel bounds identical. Desktop 1992x1248 to 1100x900 and back adapts camera and board/stand arrangement. Mobile 390x844 inspected. Manual dock then float works in free camera.
- Current screenshots floating-overhead-fixed.png, floating-tilted.png, floating-orbit-rotated.png, resize-free-camera-narrow.png and resize-mobile-current.png inspected. Same scene throughout; no lost context or browser errors.
- tsc -b, formatting and whitespace checks pass. Targeted lint retains existing warnings. No new tests.

## Compact watch correction
- Fixed-width compact buttons retained full watch labels, causing text collision. Watch controls now follow existing icon/label pattern with accessible names and tooltips.
- Real headed live AI pause and paused play states inspected at 390px and 320px; controls remain one row without overlapping text. Screenshots watch-controls-mobile-fixed.png and watch-controls-320-fixed.png inspected.
- tsc -b, formatting and whitespace checks pass.

## Two-panel correction
- Removed panel sizing reservations and viewport-minus-constant eligibility estimates. Board camera fit remains independent of panel size and visibility.
- Zone reporter projects the full available canvas, adding back docked width, and predicts standard side komadai even when current docked renderer uses strips. Both remaining gaps must meet 280x240 before floating.
- Zone updates retain 0.01px precision instead of 6px buckets. Explicit docking persists across viewport changes; automatic fallback remains geometry-driven when floating is selected.
- Real browser final verification: 1638x1344 docks, adjacent 1639x1344 floats two panels; both screenshots inspected with board unobscured. Explicit docking stays docked when resized to 2048x1228; explicit floating restores two panels. Hiding floating panels leaves camera fit unchanged; hidden UI fits full canvas. Same scene and no context loss.
- Final TypeScript, formatting and whitespace checks pass. No tests added.

## Immediate next action
- Publish follow-up patch release and verify clean main. Close resize-hands browser; retain existing dev server.

## Current camera and menu correction
- Floating capacity remains overhead-based; current-camera projected board and komadai bounds determine dynamic free rectangles on each side. Panels adapt position and width without changing camera fit.
- Rail menus use measured dimensions and live button bounds rather than a fixed 400px height; resize and captured scroll update placement.
- Real headed browser overhead, tilted and pointer-rotated screenshots inspected; panels avoid board and komadai. Menu screenshot at 2048x1050 shows short menu adjacent to its button. TypeScript passed.

## Follow-up patch
- v1.3.6 commit and tag pushed; GitHub release creation remains pending.
- Error boundary now offers state-preserving reload, separate collapsed reset, localized Japanese/English copy and existing theme pattern. Saved language loads before app initialization.
- Temporary real Root failure used for error-boundary browser verification, then removed. Japanese desktop and English mobile screenshots inspected; Reload preserves exact saved session.
- Rail capacity measures tallest actual tool and observes button size changes. At 1024x768, More and its Full screen entry are visible in inspected screenshot; physical iPad Safari unverified.
- Stand/hand relayout waits for piece assets and rebuilds together before draw. Captured-piece position imported through UI, resized across side/strip layouts; strip screenshot inspected and hand alignment confirmed.
- TypeScript passes. Complete release hook validation, lint, formatting and build remain next.
- frontend-design SKILL.md read 1–EOF for narrow recovery-page styling.
