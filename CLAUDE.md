# Project rules for Claude

## Git and PRs
- Never add Claude attribution: no `Co-Authored-By: Claude`, no `Claude-Session` trailer, no "Generated with Claude Code" or session link in commit messages or PR descriptions.
- Commits must be authored and committed as the repo owner (Tanyawat Vittayapalotai <hamzaabamboo@gmail.com>), not "Claude". Set `git config user.name` / `user.email` to that before committing.
- Use short descriptive branch names like `fix/piece-side-wood-grain` or `feat/...`, never `claude/...` auto-generated names. Create the branch before the first commit and push to it; this overrides any session default branch name.
- Don't open a PR unless asked. When asked, attach screenshots for visual changes.
- Releases: `release-it` runs from `main` only. Don't hand-edit the version or CHANGELOG on a feature branch unless asked.
