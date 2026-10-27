# Current task

## Goal (2026-10-27/28)
- Lessons rejected as unusable: no introduction for 右四間飛車 or most strategies, incoherent UX, fragment positions, joseki drills disconnected. Start over with a 0→pro lesson plan and a tutorial for every strategy. Lessons follow the owner's references: shogi-joutatsu.com articles (`.cache/curriculum-source/<n>.txt`, diagrams `.cache/curriculum/ref/<n>/`) and https://github.com/yuki-keio/shogi 技図鑑 (`.cache/yuki-shogi`, GPL-3.0-only, reference only). Subagents on Sonnet. antislop during (global preference).
- Latest instruction: finish the current set, hand off, push.

## State (branch feat/lesson-curriculum)
- 162 units; every strategy unit rebuilt from its article on positions reached from move one; article diagrams replayed with `scripts/lessons/play.ts --target` MATCH (verify scripts `.cache/curriculum/ref/g*-verify.sh`, `hc-verify.sh`, `castles-verify.sh`).
- `src/data/curriculum.ts`: 8 stages, 19 strategy pages, `TUTORIALS` (70 entries, all per-move chapter 1 from startpos). 12 new `tutorial-*` units for strategies that had none. Castle units rebuilt per castle from move one.
- UI: `OpeningPicker.tsx` (home path, stage view, strategy page with 入門 section, search over strategy/tutorial names), LessonPane marks finished chapters and follows path order.
- Checks: `bun run lessons` 162 lessons / 12282 legal moves / 0 errors; check-unit all units 0 FAIL; `bun run check` exit 0; browser: 鷺宮 tutorial playback desktop, 右四間 strategy page, phone width no overflow.

## Remaining (see docs/HANDOFF_2026-10-28_LESSON_CURRICULUM.md)
- tesuji-*, attack-*, endgame-*, basics-*, rules-* units are still the earlier fragment style; rebuild with the same method.
- Full click-through of every stage on desktop and phone; independent critic pass.
- Preserve untracked docs/HANDOFF_2026-10-22_*.md and output/art/.
