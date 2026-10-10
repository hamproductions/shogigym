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

## State (2026-10-10)
- Job: rebuild the WHOLE collection — all 146 units in `conductor/lesson-rebuild/plan.json` + 29 replacement courses — not only the first 9. Full handoff with every unit/course row, status, method, commands: `conductor/HANDOFF_2026-10-10.md`.
- Done: compliance removals; 9 units (rules ×8, basics-mate-words); 1 replacement course (gokigen-vs-chousoku--56fu); 4 course + 20 vendored note rewrites; gates green; branch pushed.
- Method: one Sonnet writer at a time, ≤5 units/job, briefs in `conductor/lesson-rebuild/`; orchestrator verifies each unit (checks + line-by-line accuracy read).
- Next action: writer job for table A TODO rows rules-tsume, basics-value, basics-attack-defense, basics-plan, basics-opening.
