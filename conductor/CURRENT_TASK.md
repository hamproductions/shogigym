# CURRENT TASK

## Goal (standing /goal)
Shogi Gym 将棋ジム: dogfood as a new/weak player and keep fixing until the UX is smooth; finish the whole backlog autonomously; no "still open" lists as a stopping point.

## Constraints
- No push/deploy unless the user says so in the same turn. Shipped v1.0.0 on 2026-10-03 (main 307b5e5, Pages deploy green, live at hamproductions.github.io/shogilab).
- No Artifact publishing; no code comments; agent-browser with mock keychain + mute-audio, one named session, close it; never click mailto:/tel:.
- Dev server on 5317 (background task, 2 h limit; restart when it expires). User's own VOICEVOX engine container on 50021: use read-only, never stop.
- Dev-only pages (/komadai, /dev/hands) via `import.meta.env.DEV` lazy import; keep the /dev/hands tester.
- Disk is tight (~2 GiB free); df -h before builds. One headless browser at a time.

## Ledger (status as of 2026-10-03)
Done and browser-checked: hand reach parity sente/gote, hip lean (no collapse), smoothing (no twitch), long fingers, piece glued to fingertips with fallback, no teleport, shadows, rest-hand thigh lift (measured, not visually confirmed), hands on table in casual room, top-view dissolve of far player (hands kept — re-check after height change), promotion picker faces, drops keep stand pile until landing, faster hands, characters auto-load, power mode wired, tsume mate → loser flips table, flip held until next click/scroll/key, eval bar on board margin + steady value + phone row, move knock on every forward step (3D and 2D), voice clips (76, WebM/Opus, katakana readings, no なのだ), more castles, English UI strings/titles, take-back flow, quiz/tesuji/tsume retry flows.
Done but NOT browser-verified: byoyomi voice count, よろしくお願いします/ありがとうございました, voice toggle in Settings, ink-brush announcement banner, drag only own side, tester move sounds, quiz header de-dup.
Open:
1. Piece looks off-centre in its square (user screenshot with green best-move badge) — not reproduced yet.
2. Power-mode capture "tiles missing/misplaced, placed tiles not shown as placed" — duplicate ghost removed; rest unconfirmed.
3. "Tiles floating" report — stray-piece ease-back added; root cause unconfirmed.
4. Characters: seiza feet flat, near-arm sleeve stub, cloth/hair clipping re-check, thigh clip visual confirm.
5. Tesuji announcements should use gold (CSS exists, class not applied).
7. Critic minors: stale panel after tesuji go-back, onboarding step 2 density + Skip, picker heading duplication.
Deferred by user: lesson note text translation (dynamic content), Zundamon 3D model (voice only).
