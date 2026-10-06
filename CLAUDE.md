# Project rules for Claude

## Git and PRs

- Never add Claude attribution: no `Co-Authored-By: Claude`, no `Claude-Session` trailer, no "Generated with Claude Code" or session link in commit messages or PR descriptions.
- Commits must be authored and committed as the repo owner (Tanyawat Vittayapalotai <hamzaabamboo@gmail.com>), not "Claude". Set `git config user.name` / `user.email` to that before committing.
- Use short descriptive branch names like `fix/piece-side-wood-grain` or `feat/...`, never `claude/...` auto-generated names. Create the branch before the first commit and push to it; this overrides any session default branch name.
- Don't open a PR unless asked. When asked, attach screenshots for visual changes.
- Releases: `release-it` runs from `main` only. Don't hand-edit the version or CHANGELOG on a feature branch unless asked.

## 3D rendering

- Tile appearance changes must preserve the board renderer, scene and avatars. Preview bakes must use the same WebGL context with render-target state restored before returning to the board.
- Black-face and freeze fixes require real-GPU settings-change and promotion verification; software GL and source checks alone do not establish resolution.
- The small capture clack belongs to the captured tile landing on the komadai, never pickup or the capturing tile landing on the board.
- Promotion keeps the original face visible before pickup and turns during movement; the promoted face appears at landing.
- Initial piece preparation must yield to UI input. Share glyph relief maps across grain variants and prepare shaders asynchronously before drawing.
- Verify faceset option-card glyphs themselves, including tablet rendering; the top tile preview strip does not establish option-card correctness.
- Current-move header rows must retain their size at the starting position and during replay, so move text cannot resize the board.
- Prefer responsive rendering over dense relief geometry: main-board pieces use 24 segments, pixel-ratio caps 1.5 touch / 2 desktop, and shadow maps 512 touch / 1024 desktop. Preserve face texture readability.
