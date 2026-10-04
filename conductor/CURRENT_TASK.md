# Current task

## Scope
All other tile requests are accepted and closed. Only these four repairs remain in scope. No delegation, push, tests, browser checks, server changes, system changes, or audio configuration changes.

## Implementation
Board coordinate correction: `coordPlane` render order changed from 9 to 0. Coordinate planes already lie at board Y 0.006; late transparent rendering previously composited them over all glass layers. Coordinates now render before glass, preserving board-relative placement and glass attenuation. Runtime result unverified.
FU centering audit: measured 285 prepared glyph alpha bounds; seven Portella glyphs were offset by more than one pixel. Shared fitter now measures visible alpha above 40 instead of faint extraction residue. Portella extraction derives its interior from source wood colors and removes disconnected specks; regenerated both Portella sets, inspected FU PNG, and measured all 285 again with zero bounding-center offsets above one pixel. Asset URL version advanced to 18. This verifies asset bounding centers, not every extraction contour or optical centering in the browser.
Frosted interior correction: opacity restored to original 0.62 at user request. Reverse ink previously rendered after the cloudy panes, leaving it visibly clear regardless of opacity. Back ink no longer writes depth; explicit back-to-front layer order places the frosted front surface over interior ink and board, then front lettering. Screenshot result after this correction remains unverified.
Frosted glass added as a separate material option: milky tint, higher opacity and roughness, subdued reflection, no wood grain. Uses the common glass geometry/back/finish path and flat preview renderer. No runtime checks run.
Selected tiles now remain at exact base height plus selection lift every frame, independent of OrbitControls or camera angle. Removed camera-gesture suspension of selection positioning. Drag and move animations retain exclusive transform ownership. Runtime result unverified.
Refresh re-lift repair: `pieces.ts` preserves board/hand transforms and visibility during non-move rebuilds, remaps active animation and drag references, and restores physical flip meshes. Previously refresh recreated tiles at base height while animations retained detached objects. Runtime stability remains unverified.
King and gold backs are blank material surfaces, with no reverse lettering or movement guides. Other pieces retain promoted/unpromoted reverse faces.
0. Play startup: `hooks/useAutoplay.ts` previously delayed the first move by the full 1100ms playback interval. First move now schedules immediately; subsequent moves retain 1100ms spacing. Pause resets the startup clock. No runtime check run.
1. Glass back: `src/workshop/board3d/piece.ts` uses actual bottom geometry with a double-sided glass surface and reverse lettering material cloned from the front finish, including relief normal and lacquer maps. Screenshot exposed bottom geometry at local Y -0.02, buried under the board. Glass back ink now sits at Y 0.002 and glass back surface at Y 0.001, above the contact plane. Runtime result remains unverified.
2. Promotion: `pieces.ts` prioritizes promotion over capture; `Board3D.tsx` enables dragged promotion animation. Avatar and fallback paths rotate the unpromoted physical mesh through 180 degrees, compensate thickness, and reveal the final mesh only at completion. Dragged promotions turn at their destination.
3. Camera re-lift: `camera.ts` records active OrbitControls gestures; `pieces.ts` suppresses lift interpolation during those gestures and preserves held ownership without timeout. `interaction.ts` rejects secondary buttons/pointers and excludes moved camera gestures from click selection.
4. Table flip: `effects.ts` removes timer-based restoration. Bodies require low velocity, negligible translation and rotation, and continuous half-second stability before sleeping. Restoration requires an explicit viewport click and every body asleep.

## Evidence and limitations
Source paths and patches inspected. No browser or tests run, following user restriction. Visual glass rendering, promotion continuity, camera gesture stability, and complete physics settling remain runtime-unverified. Existing unrelated working-tree changes preserved.

## Next action
User checks the four repaired behaviors in the existing running application. Address only concrete failures within this scope.
