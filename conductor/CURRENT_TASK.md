# CURRENT TASK

## Goal (standing /goal)
Shogi Gym 将棋ジム: dogfood as a new/weak player and keep fixing until the UX is smooth; finish the whole backlog autonomously; no "still open" lists as a stopping point.

## Constraints
- No push/deploy unless the user says so in the same turn (last push cdba2d9; everything after is local).
- No Artifact publishing; no code comments; agent-browser with mock keychain + mute-audio, one named session, close it; never click mailto:/tel:.
- Dev server on 5317 (background task, 2 h limit; restart when it expires).
- Dev-only pages (/komadai, /dev/hands) via `import.meta.env.DEV` lazy import; verify absent from the production build.
- Disk is tight (~7 GiB free); df -h before builds. Concurrent headless browsers starve rAF (software WebGL) — one browser at a time.
- Do not spawn extra agents; only the VRM characters agent is running; coordinator does everything else and commits.

## Pending, in order
1. Lesson note/aim/comment text is Japanese-only (~2,600 unique strings, ~78k chars). The user earlier ruled dynamic content out of localization scope; revisit only if asked.
2. Critic leftovers (minor): duplicate wrong-move wording in header vs card, stale panel after tesuji go-back, onboarding step 2 density + Skip link, picker heading duplication.
3. README GIF via /motion-reel; production-build check that /dev/hands and /komadai are absent.
4. Characters: seiza feet, near-arm sleeve stub, casual seating check.

## Done this stretch (committed locally, not pushed)
Characters: lean planned from real seated geometry, hip hinge with straight back, every /dev/hands pattern reaches (~1 mm) in both rooms, long index/middle fingers, piece glued to fingertips with fallback.
New-player UX: English names for formations, lesson titles (110), tesuji tags, coach explanations (English piece names, 3-move lines); Take back and try again after a mistake (desktop panel + phone bar); quiz prompt before a quiet Show answer; tesuji wrong answer replays with a single go-back action; tsume Hint before Show solution; onboarding defaults to New to shogi; Win chance label; full-height lesson picker; plainer mode descriptions.
