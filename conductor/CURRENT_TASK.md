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
1. VRM characters (agent running; uncommitted: src/workshop/avatars/*, public/avatars/*, HandsTest.tsx, routes/hands.tsx, Board3D.tsx, board3d/{effects,pieces,types}.ts, BoardStage.tsx, useBoardSession.ts, routes.ts, README credits). Open defects: casual idle posture (raised hands), finger extension in the shogi grip (index+middle long), near-arm sleeve stub, seiza feet, far-square lean, /dev/hands verification. Then coordinator browser-verifies and commits with the power-mode wiring in Board3D.tsx (s.onLand fired from the hand press).
2. Production build check (dev pages absent), then README GIF via /motion-reel.
3. Continued dogfood (new player, phone + desktop) with fixes; critic + usability pass for UI changes.

## Done this stretch (committed locally)
Nine backlog bugs (persisted sessions, resigned state, flat coordinates, tsume buttons, New game clocks, Settings sizing, phone sheet), power mode effects (3345e86), opening stats from engine games (f53f91b, fd50e52), Settings dialog top-anchored, Play AI restore when last mode was Tesuji, tsume failure reasons localized, move facts/mistake explanations localized, study bar shows move + reason, phone title wraps, tour wording, quiz feedback scrolled into view.
