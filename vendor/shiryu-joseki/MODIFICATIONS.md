# Local modifications

These files are modified from the upstream commit in `SOURCE_COMMIT` (GPL-3.0, section 5a).

- 2026-10-10: comments and notes in `ibisha-vs-shikenbisha--45hayashikake`, `ibisha-vs-shikenbisha--saginomiya`, `aigakari--bougin`, `aigakari--gote`, `kakugawari--hayakurigin`, `nakabisha-vs-chousoku--gote`, `nakabisha-vs-ibisha--gokigen24`, `nakabisha-vs-sankenbisha--aifuri`, `sankenbisha-vs-45hayashikake--sabaki`, `sankenbisha-vs-bougin--53kin`, `shikenbisha-vs-anaguma--sokkou` and `yagura--36gin37kei` were rewritten because their wording overlapped with copyrighted articles. Move sequences are unchanged.

Re-vendoring with `node scripts/build-courses.mjs --vendor` overwrites these edits; run `bun scripts/lessons/check-originality.ts` afterwards and rewrite anything it flags.
