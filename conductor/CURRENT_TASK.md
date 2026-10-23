# Current task

## Lesson audit — source delivery, 2026-10-23
- Current authorization: format namedMarkdown, test, commit and pushmain. No PR/release or unrelatedart publication. Git identity Tanyawat Vittayapalotai <hamzaabamboo@gmail.com>; authenticatedGitHubhamzaabamboo has push permission on existingorigin.
- Latest handoff remainder and preceding lingering handoff read fully1–183/1–258. Historical source coverage is150 distinctunitIDs: original92 + resumed14 + workflow44; coverage-reconciled.json maps provenance. This is not a fresh150unit browser/reference-image audit.
- Known remaining yokofu-avoid repaired and independently rechecked. Three additional confirmed wording defects in basics-plan, hayaishida and shiken-vs-migishiken corrected and independently rechecked. Source/generated files updated together. Detailed evidence: conductor/lesson-audit/2026-10-18/REPORT.md.
- Verification: all150unitchecks pass; generator150lessons/540chapters/2062figures/2590legalmoves/0errors; source/generated pairs equal150/150; originality16126strings/0flags. Full bunruncheck passes in primary and isolatedcandidateworktree; affected4unitchecks pass in isolation too. Existing lint warnings are non-fatal.
- Both namedMarkdown files formatted. Existing untracked handoffs and concurrent artresearch remain local rather than being added to auditcommit. Sourcecheck logs in .cache/audit-2026-10-23/{ship-check,isolated-check,all-units-check}.log.
- Runtime: one isolated audit-ship browser onlocalhost5181. Four changedlesson sections loaded through library/study UI; corrected text checked. Yokofu chapter3 actual2d2f/K5h mouse clicks accepted2/2 with correctopponentmoves and completion. Shiken6ply variation fully replayed. Zero pageerrors; consoleonlyVite/dev notices. Evidence .cache/audit-2026-10-23/browser/verification.json and viewedPNGs.
- Temporary browser close and ownedserver shutdown issued; verificationworktree removed. Do not close foreign default/jobcan-ui/historical-style/avatar-clip-pack sessions. No independent browser proof of all150lesson/screens or full reference-image/English originality is claimed.
- Preserve concurrent historicalart section above and untracked output/, public/historical-shogi.html, src/rendering/historical/. Only this lesson section is staged for the audit taskrecord; concurrentartcontent stays uncommitted.
- Skills fully read: shogi-lessons1–60, authoring1–55, verification1–90, docslessons1–84; GYST1–27; unfuck-yourself1–60; antislopcore1–724/copy1–372; check1–228/referencesdurable1–21/project1–130/ship1–51; agent-browserstub1–52/runtimecoreEOF. Checkreviewdepthquick/staticcontent.
- No lessonrepair work remains. Delivery state is established by git HEAD/remote refs and currentheadCI; the source commit and push must cover all intendedauditfiles without including concurrentwork.


## Coaching pattern catalog

- Publish the coaching research, reproducible self-play records, categorized template designs and checked sample prose for review.
- Scope: `conductor/character-lab-voice-research.md` and `output/coaching-study/`. Application, lesson and artwork implementation are outside this change.
- Entry: `output/coaching-study/README.md`; pattern definitions: `PATTERN_CATALOG.md` / `pattern-catalog.json`; actual randomized match samples: `randomized/SAMPLES.md`.
- Four completed YaneuraOu games use randomized legal opening candidates and per-side SkillLevel settings; 24 selected positions have move/PV replay and factual prose checks. Templates cover the existing guide hierarchy; named opening recognition and runtime integration remain unverified.
- PR writing skill read 1–170 through EOF. Both saved game corpora pass independent legal replay; the randomized set passes 42,978 assertions across 444 played plies and all recorded PVs. Category, sample, JSON and document-link checks pass. `bun run check` passes with existing non-fatal source warnings. Generated datasets are marked for collapsed review; authored patterns and readable examples remain visible.

## Runtime implementation
- Existing Coach panel derives six factual pattern families from actual positions; matching coordinate colors, tiles and legal-reply arrows reuse the lesson annotation renderer. Hide marks outside Coach, with assistance disabled, during previews and when reviewed/displayed plies differ.
- Furigoma skip and dismissal start the game in 2D/3D. Real headed browser verified 3D skip control and settled start; 2D close started the AI game; imported self-play ply30 showed recapture explanation, colored tile/text and legal arrows.
- Existing full check passed before annotation addition; final targeted lint/typecheck pass with existing warnings. Real browser confirms assistance-off hides explanation colors/arrows while preserving normal last-move tiles. Native attachments work; replace old coaching screenshot with current annotations.
- Voice/LLM and all112strategy runtime coverage remain outside implemented scope.
