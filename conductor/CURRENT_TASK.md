# Current task

## State (2026-10-22) — lesson audit remainder closed out
- main = origin/main = `68bee65` (merge of `fix/lesson-audit-remainder` / `ee7af8a`), pushed over HTTPS.
- 39 units repaired, each passed an independent re-check; `bun run lessons` 0 errors; check-unit ok for all 39; `bun run check` exit 0. REPORT.md has a "Repair rounds" section.
- Full continuation record: `docs/HANDOFF_2026-10-22_LESSON_AUDIT_REMAINDER.md` (untracked). Earlier handoff: `docs/HANDOFF_2026-10-22_LINGERING_WORK.md` (untracked).

## Open items
1. yokofu-avoid: 4 known findings still open. Its repair failed the re-check (chapter 2: B*9e fork makes the "rook for bishop" text false; step 1 grades 2d2f while 2d2b is far stronger; 9c8c 寄る written as 上げて), so the file was reverted. Details are in the handoff §9/§11.
2. CI/deploy for 68bee65 not inspected.
3. `origin/feat/suisho-eval-download` needs a user decision; merged branches await an instruction to delete them.

## Rules learned
- "Pro max" means full fan-out at the harness workflow ceiling (8 here); never self-cap.
- Use `.cache/audit-2026-10-22/tools` (repointed); the committed audit tools hardcode another machine's paths.
- Parallel lesson writers must not run `bun run lessons`; build once at the end.
- Never open PRs, edit PR bodies, or push unless asked in the current turn.
- Shell is zsh: run loops under `bash -c`. Commands with RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 DO_NOT_TRACK=1.
