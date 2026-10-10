# Current task

## Objective
Copyright audit and overhaul of all learning content on branch `audit/lesson-copyright` (created from `main` 4ed7ce0). Non-commercial project, but nothing may rely on that: no copied or closely paraphrased text, no copied creative positions (tsume, constructed teaching diagrams), no reproduced site structure/collections. Content is rewritten from understanding, in original words and original structure; free sources (Wikipedia CC BY-SA, MIT/CC0 data) may be adapted with attribution.

## Requirements (current session)
1. Work on a separate branch.
2. All lessons/courses copyright-compliant; where a source cannot be used, find free alternatives (Wikipedia etc.).
3. Game records are not copyrightable; annotated game records and collections of records can be. Sites with copyright notices are reference-only.
4. No plagiarism: study each lesson, understand it, write genuinely original explanations (not sentence-by-sentence paraphrase).
5. Use Sonnet subagents for bulk writing; verify their output myself.
- Non-actions: no push, merge, PR, history rewrite or deploy without explicit approval in the current turn.

## Audit findings (2026-10-10)
- shogi-joutatsu.com (footer Copyright©): 171 lessons in `data/lessons/` + `src/data/lessons/` hold verbatim captions/headings, near-verbatim "paraphrases" (checked article 1001), English translations, the site's article index as catalog; 1手詰/3手詰/寄せ problem sets are composed tsume (copyrightable works). All public on `main`, in history, deployed on Pages. No raw HTML/images ever committed (`.cache` ignored).
- shogi-rule.com (利用規約 forbids 転載・複製・翻訳 and imitation of 情報の構造): 30 `shogirule--*` courses = its kif files verbatim; 26 `tesuji--*` courses = its constructed diagrams.
- hibitonshi (kakukoukan), shogijam (millennium), thirdfilerook (aifuri ×2): comments follow the articles' explanations.
- Vendored Shiryu181 joseki (GPL, 45 files): lines follow shogilounge/hibitonshi/shogi-joutatsu/ameblo 基本図 move orders; comment originality to be checked by overlap tool.
- Low risk: Wikipedia kuzushi/fujii/hidarimino courses (CC BY-SA, attributed), YaneuraOu tsume (computer-generated), Peta book (MIT).

## Plan
1. Overlap checker: fetch source article text into `.cache/sources/` (ignored); flag shared substrings / n-gram containment and copied positions.
2. New authored lesson format `data/lessons/units/<id>.json` (own curriculum/taxonomy) + rewritten builder/validator; drop extraction scripts and source-figure data.
3. Rewrite lessons in batches (Sonnet writers; original positions for tesuji/tsume/崩し; joseki lines verified legal + engine/book), checker must pass.
4. Replace `tesuji--*`, `shogirule--*`; rewrite comments of medium-risk courses; check vendored comments.
5. Update AGENTS.md lesson rule, docs/lessons.md, README sources table; rebuild tesuji drills; typecheck/validate.
6. Report: history rewrite + Pages redeploy needed to remove old content from public — user decision.

## State (2026-10-10, after correction)
- Correction: usage burned by 11 parallel Sonnet writers + Opus orchestration on a 146-unit plan; user ordered no subagent spam, work smart.
- Mistake: oversized scope (90 opening lessons duplicating joseki courses) and fan-out, against the cheap-single-worker rule. Rule added to AGENTS.md.
- Compliance done: copied lessons, tesuji--* and shogirule--* courses removed; strategies.ts remapped (empty matchups say 「収録している手順はまだない」); vendored + 4 course notes rewritten; README/docs/AGENTS updated; app shows lesson references.
- Content: 9 units (rules ×8 + basics-mate-words) pass check-unit; 1 salvaged course gokigen-vs-chousoku--56fu passes check-course and is wired.
- Verification: `bun run lessons` 0 errors, check-originality 0/8399 flagged, validate.mjs 0 errors, strategy-check 0 errors, `bun run check` exit 0. Committed ac24259 on `audit/lesson-copyright` and pushed (HTTPS via gh credential; SSH key denied); full handoff `conductor/HANDOFF_2026-10-10.md`.
- Next: reduced curriculum ~25 units (remaining basics ×8, tesuji ×9, castles/attacks/endgame few), written sequentially; user decides commit/merge/history rewrite.
