# Project rules for Claude

## Browser opening

- On this Mac, Chrome `Profile 2` is the personal profile; `Profile 1` is Arsaga work and `Profile 3` is Donuts work. Mapping verified from Chrome Local State profile metadata. Explicitly requested personal project artifacts open in `Profile 2`.

## Git and PRs

- Never add Claude attribution: no `Co-Authored-By: Claude`, no `Claude-Session` trailer, no "Generated with Claude Code" or session link in commit messages or PR descriptions.
- Commits must be authored and committed as the repo owner (Tanyawat Vittayapalotai <hamzaabamboo@gmail.com>), not "Claude". Set `git config user.name` / `user.email` to that before committing.
- Use short descriptive branch names like `fix/piece-side-wood-grain` or `feat/...`, never `claude/...` auto-generated names. Create the branch before the first commit and push to it; this overrides any session default branch name.
- SSH push to `hamproductions/shogigym` is denied for the `hamzaabamboo` key although the gh token has push rights; push over HTTPS once: `git -c credential.helper= -c credential.helper='!gh auth git-credential' push https://github.com/hamproductions/shogigym.git <branch>`.
- Don't open a PR unless asked. When asked, attach screenshots for visual changes.
- Releases: `release-it` runs from `main` only. Don't hand-edit the version or CHANGELOG on a feature branch unless asked.

## 3D rendering

- Piece-sound samples should retain 2–3 kHz body beneath a bright, brief wooden contact snap. Isolate each reference impact and inspect onset/tail boundaries before matching its spectrogram; whole-recording spectra and unchecked fixed-length crops do not establish a match. Retain quiet pre-contact onset with generous pre-roll. Original audition clips preserve source stereo PCM and level without filters, normalization or fades. Obtain sample approval before changing application synthesis.

- Tile appearance changes must preserve the board renderer, scene and avatars. Preview bakes must use the same WebGL context with render-target state restored before returning to the board.
- Free-camera resize preserves viewing direction and relative zoom while adapting camera distance to the new board fit. Floating tabs split evenly: moves/future left and coach/evaluation right; docked panels retain all four tabs. Fit the board and komadai to the full available canvas first. Floating panels consume remaining gaps only and never reserve space or reduce board scale. When both panels cannot fit, dock one panel. Determine eligibility from the projected full-canvas layout, including the width currently occupied by a docked panel, independently of tilt, rotation or zoom. Once floating, size and position each panel in current-camera free rectangles that avoid the board and komadai, with no camera reservation. Rail menus anchor to their live button bounds and measured menu dimensions, including resize and rail scroll. Explicit floating preferences cannot bypass capacity checks; retain pixel-accurate boundary updates. Explicit docking persists across resizing; automatic fallback never overwrites that preference.
- Canvas resizing uses the existing render loop: observe pending dimensions, adapt camera/layout, then resize the drawing buffer immediately before rendering. Keep CSS sizing independent and never clear the buffer after drawing, including adaptive pixel-ratio changes.
- Cached piece data may stay available for reuse, but unused GPU allocations must be released after preview disposal and appearance preparation. Promotion previews are generated when requested and never gate board readiness. Keep the existing board visible while preparing a new tile appearance.
- View-mode coach toggles govern arrows, move ratings and evaluation. Live AI play at the latest position is not replay; show replay styling only for preview or actual history navigation.
- Install-app has the lowest rail overflow priority and moves into the menu before other optional controls.
- Black-face and freeze fixes require real-GPU settings-change and promotion verification; software GL and source checks alone do not establish resolution.
- The small capture clack belongs to the captured tile landing on the komadai, never pickup or the capturing tile landing on the board.
- Piece sound reference mapping: native synthesis approximates Original 4 for board landing and Original 5 for komadai landing from the second reference video. Recordings are analysis/audition references, not application playback assets. Keep distinct acoustic profiles rather than lowering the board sound's gain for komadai.
- Promotion keeps the original face visible before pickup and turns during movement; the promoted face appears at landing.
- Initial piece preparation must yield to UI input. Share glyph relief maps across grain variants and prepare shaders asynchronously before drawing.
- Verify faceset option-card glyphs themselves, including tablet rendering; the top tile preview strip does not establish option-card correctness.
- Current-move header rows must retain their size at the starting position and during replay, so move text cannot resize the board.
- Compact study layout uses a content-independent drawer height. Evaluation appears as a horizontal strip above board controls; panel content changes must not resize the board. Preserve explicit sheet drag sizing and desktop vertical evaluation.
- Compact controls stay on one row, with previous/next and panel toggle always visible. Lesson return is an icon-only arrow in the top rail; omit the lesson flow-chart button from the bottom bar. Compact bottom buttons share 38px height and 18px icons; watch pause/play and new-game controls use icons with hidden mobile labels and accessible names; study/quiz segments use the same height. Extra controls scroll horizontally; evaluation occupies its own strip above the bar. Only quiz score and feedback reserve stable space; study feedback floats above its card without an empty reservation, and feedback must not trigger scrolling or resize the board, prompt, panel or controls. On compact screens the preview banner and player plates sit in reserved bands above and below the board and never cover it.
- Compact study instruction banners reserve two text lines regardless of content length. Longer instructions scroll within the reserved area; wrapping must not resize the board.
- Prefer responsive rendering over dense relief geometry: main-board pieces use 24 segments, the renderer uses the full device pixel ratio (never cap or adaptively lower it), and shadow maps 512 touch / 1024 desktop. Preserve face texture readability.

Recovery screens retain the existing theme and saved language. Primary reload preserves the open session; session reset remains a separate collapsed recovery option. Stand and hand resizing must rebuild together when assets are ready, never move stands independently. Rail capacity must use measured tool heights and react to font/button size changes.

## Styling system

- UI primitives use Park UI on Ark UI with Panda CSS v2. Park registry files live in `src/components/ui` and `src/theme`; port any newly added Park file to v2 (`createSlotRecipeContext` / `createRecipeContext`, no `createStyleContext`), and use `src/app/icons` rather than Lucide.
- Theme identity stays sumi/washi/shu: Park `gray` maps to washi (light) and sumi (dark), the accent palette is `shu`. Text tokens must pass WCAG AA against every surface they sit on; check new pairs with the antislop contrast script.
- Migration is phased. Legacy CSS stays unlayered so contextual overrides beat Panda layers; only resets belong in `@layer base`. When a feature's CSS moves to Panda, delete the legacy rules in the same change and retarget selectors at Ark `data-part` attributes.
- `jsxStyleProps` is `all`: Panda JSX (`Box`, `Stack`, `styled.*`) takes style props directly. Panda also extracts same-named props on app components, so do not name app props after CSS properties (`appearance`, `position`, `color`). Recipes whose variants are chosen at runtime must be listed in `staticCss`.
- Dark mode resolves to a `.dark`/`.light` class on `<html>` alongside `data-theme`; keep both in sync in the boot script and `src/utils/theme.ts`.
- Ark locale follows i18next through `LocaleProvider` in `src/root.tsx`.
- Production builds minify, hash CSS variables and prune unused tokens/keyframes. Class-name hashing stays off: Panda 2.1.1's hashed runtime passes an array to `toHash` and every recipe throws. Do not add `postcss-prune-var`; JS inline styles read legacy variables no stylesheet references.
