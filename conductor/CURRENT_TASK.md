# Current task

## Scope and authorization
- Move Komadai development page to /dev/komadai.
- Consolidate shared modules in src/utils; root retains React Router entries.
- Configure release-it semantic versioning and update README.
- Configure Oxlint/Prettier, @/ source aliases, autofix and formatting; enforce formatting in CI and release checks.
- Current requests authorize committing all changes, bumping patch from 1.0.0 to 1.0.1, tagging and pushing main.
- No GitHub release publication, server/system changes or new tests required.

## Implementation
- src/utils owns root-level shared modules and previous app/lib helpers, theme and roomMetrics. All consumers and data globs updated.
- Vite, TypeScript and Bun resolve @/ to src. Generated React Router +types imports stay relative.
- Settings reads version directly from package.json.
- release-it handles version, changelog, release commits and tags. npm publishing disabled. GitHub release publishing configured for explicitly invoked full releases; disabled for this patch bump.
- README documents current modes, customization, development routes, structure, aliases, quality commands, loading/error recovery and releases.
- Safe-refactor SKILL.md read 1–EOF (16 lines); GYST SKILL.md read 1–EOF (27 lines).

## Verification
- Module bodies compared before formatting: unchanged except imports and course globs.
- Final lint/format/TypeScript checks passed; production build with /shogilab/ base passed; course validation and diff whitespace passed.
- Bun alias resolution passed. Existing React warnings remain without suppression.
- Local release dry-run passed. Actual patch release runs required checks again.
- localhost:5173 unavailable; browser verification remains unverified. No server or browser started.

## Closure criteria
Patch 1.0.1 committed and tagged; main and tag pushed; working tree clean and local main matches fetched origin/main.
