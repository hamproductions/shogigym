# Current task

## Scope and permissions
- Fix the nine screenshot issues plus engine startup/search hangs and obsolete shadow-map warning. All supplied screenshots inspected at original resolution.
- Corrected scope: restore Diagram and Broadcast renderers and their original board appearance. Broadcast tiles must use the same baked sprite rendering as wooden 2D, as confirmed by the latest DOM screenshot; live 3D overlay is rejected. Diagram remains unchanged. Show controls/Esc and own evaluated-move counters remain approved.
- Scoped edits and browser verification authorized. Current turn authorizes committing and pushing all working-tree changes; deployment not requested. Do not start/stop servers or alter system/user browser/audio.
- Existing main: 38800ce. Current delivery includes all existing tracked changes and the shared baked-pieces hook.

## Implemented
- Incorrect BoardStage routing replaced Diagram/Broadcast entirely; restore their Board2D paths. Keep hidden Tilt in flat modes.
- Pickup transforms use sprite-centered origins and animated shadows. Review frame uses the same container border across modes, including phone.
- Evaluation graph outside scrolling move list; Coach counters subscribe to actual completed review data and filter own side.
- Show controls label/icon; background uses nonintersecting wave arcs; PCFShadowMap replaces removed shadow type.
- Piece undersides use opposite-face textures with normalized UVs.
- Engine waits have deadlines, cancellation checks between startup handshakes, cleanup and retry/error UI. Engine switching after failure now starts the selected engine. Opponent restarts on engine epoch and skips halted/terminal games.

## Verification
- Earlier verification used existing localhost:5317 in isolated headed joseki-followup session with mock keychain/basic passwords/muted audio; no non-http links.
- Observed opening AI reply, AI first move as gote, own Book counter 1/1 excluding opponent, NNUE missing-file error/retry with retained evaluation bar, wooden Diagram tiles, hidden Tilt, Show controls/Esc restoration.
- Imported existing 53-ply Millennium course through UI. Move list scrollTop 411 with graph visibly pinned at y=60; uniform 2px review border visible.
- Build and typecheck passed; lint passed with existing warnings; validator passed. Engine edits since build require final typecheck/lint.
- Remaining: Broadcast/wood/3D border and sprite parity; real flip-back/promotion animation; mobile; final cleanup/diff validation.

## Skills
- get-your-shit-together 1-27 EOF; look-at-the-screen 1-60 EOF; real-testing-evidence 1-70 EOF; agent-browser 1-52 EOF and core CLI; systematic-debugging 1-283 EOF plus root-cause-tracing 1-169 EOF; verification-before-completion 1-120 EOF.
- grilling 1-28 EOF; frontend-design 1-71 EOF; brainstorming 1-285 EOF. Bounded counter design approved; no architectural document required.

## Current boundary
- User is taking over runtime testing. Agent browser testing stopped; task session closed and temporary screenshot removed.
- Lift correction found reduced-motion disables CSS transitions; added a narrow tile-transition exception and larger lift. This correction is not runtime verified.
- Flip-back animation, corrected lift, Broadcast/3D parity and mobile remain unverified. Final engine edits have not received the full build check.
- Runtime checks remain stopped by user request. Current turn requests committing and pushing everything, then confirming a clean working tree.

## Latest correction
- Table-flip tile collision treated tile centers as points, allowing oriented tile extents to intersect the overturned board. Replace with separating-axis collision using complete tile and board boxes.
- Integrate physics in at most 1/120s steps with board pose updated each step; reproject contacts after settling rotation and sleep grounded low-velocity bodies. Runtime behavior remains unverified; no checks run.
- Table-flip dismissal was bound globally to pointer-down, wheel, and key input, causing camera navigation to reset the scene.
- Dismiss only on a stationary primary viewport click. Any pointer movement cancels dismissal; document capture tracks the full gesture even outside the canvas. Wheel, keyboard, camera drag, and surrounding UI interactions retain the flipped scene. Pointer cancel and multi-pointer input cancel pending dismissal.
- Enable temporary orbit controls while table flip is active. Suppress board piece selection/drop input during the flip; normal orbit preference resumes afterward. Position changes still release obsolete flip state.
- Shared wood grain contrast increased; 3D instances use varied seeds preserved through ordinary moves/promotion. Face height overlaps bevel to address the reported seam. These earlier changes remain visually unverified.
- Current delivery: commit and push all changes to main. No tests/browser/server/deploy; standing check stop remains active.
- Immediate next action: confirm remote HEAD matches local HEAD and working tree is clean after push. UI fixes remain runtime unverified.
