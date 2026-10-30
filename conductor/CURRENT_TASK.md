# Current task

Camera-driven play: a physical board watched by a connected or phone camera drives the app in real time (vs AI and analysis), at oblique angles. Shipped: fast-forwarded to `main` (`7bfa62e`), PR #28 merged, production deployed. Full continuation record: `docs/HANDOFF_2026-10-31_CAMERA_PLAY.md`. No further push/deploy without a new instruction. Dev server on 5173 may stay up; test data under `/private/tmp/claude-502/`.

## Request ledger (user requests this session, in order; status)

| # | Request | Status |
|---|---|---|
| 1 | Investigate shogi.nkkuma.tokyo; camera moves pieces vs AI, real time; connected + smartphone camera; odd angles | shipped to main; user judged it usable; full real-board game on the final build not yet reported |
| 2 | Use the GitHub references; dig GitHub more | done (kbinani/shogi-camera MIT design ported; others unlicensed, ideas only) |
| 3 | Moves not detected on the real board | several causes fixed; real re-test pending |
| 4 | UI must not shift while dragging; no unlabeled green line; corners must not jump | done |
| 5 | Phone as camera, plug and play: no adb, no dev-server dependency (Wi-Fi/WebRTC fine) | implemented: `/camera-send` production route + PeerJS (MIT) WebRTC, public broker 0.peerjs.com for signalling only, QR in the panel; dev relay, adb watchdog and JPEG path removed. Verified two-tab P2P (fake camera → panel 1280×720). Deployed as PR #28 preview (branch `feat/camera-play`, https://hamproductions.github.io/shogigym/pr/28/); QR uses BASE_URL; `/camera-send` prerendered. Verified on the preview: desk QR → second tab with fake camera → 「接続しました」, desk video 960×540. Real phone not yet confirmed by the user |
| 6 | Piece type for captures/drops; follow references; YOLO/transfer learning; ONNX/MediaPipe allowed | partial: CNN fine-tuned on user pieces (~90% unseen) for drops/promotions; no full-board reading |
| 7 | Official match video → precise KIF | capability in the hook; panel button removed per #24; no exposed entry point |
| 8 | Train like ShogiVision | done once (light run); more training pending labelled real footage |
| 9 | Did you brick my PC | answered (training on near-full disk caused the stall) |
| 10 | Test a whole game | done on synthetic footage; real game pending |
| 11 | Camera panel blocking; own position | done (docked in side column; floating fallback) |
| 12 | Too slow; too much 盤と一致 fiddling | done (baseline-relative reads, hysteresis, faster confirm, auto-match to app line) |
| 13 | Read moves aloud for headless play; use zundamon | done (VOICEVOX clips; ready prompt once per ply) |
| 14 | 駒台 broken: hand piece off the stand (reported 3×) | open: resize does not reproduce; investigating code paths |
| 15 | Auto grid; no manual line fiddling | done (360-px detection, startup re-detect, 3 s snap) |
| 16 | Specific, short problem messages | done (per-square 見えます/見えません; partial-move message) |
| 17 | No twitch/loop; auto-pick drops; ready feedback; hand vs board moved | done |
| 18 | Camera stops after game end | done |
| 19 | Mixed piece typefaces | open: not reproduced with defaults; needs the user's 駒 settings |
| 20 | Read the whole board state / recognize every square; drops pick wrong piece | partial (see #6) |
| 21 | Use our 3D data for training | pending |
| 22 | What footage was tested; test on the real setup | in progress (real frames now used; found resolution, crease, orientation bugs) |
| 23 | Debug info | done (デバッグ toggle) |
| 24 | Remove the video file button from the camera panel | done |
| 25 | ☗/☖ randomly switching | fixed (lock after first read; legal-only flips) |
| 26 | 「盤の上に手があります」 stuck (phone on tripod) | fixed (flicker counted only when still) |
| 27 | 「４四の駒が見えません」 after reproducing AI move | fixed (partial-move message; no flicker freeze) |
| 28 | Screen twitching every frame; pieces move randomly; piece designs flicker; 駒台 still broken | open: suspected main-thread load from the camera path (relay JSON/base64 parse + JPEG decode at up to 19 fps, two GPU readbacks per frame) competing with the 3D render loop; also HMR from live edits. Vision compute itself ≈2.4 ms/frame. Plan: move relay receive/decode and vision to a Web Worker; A/B check by closing the camera panel |

| 30 | Stateless reading: always evaluate the whole board; physical take-back without waiting | done: each still frame matched against current/earlier/pre-AI positions or current+1 legal move; 盤と一致 removed. Verified with a fake-camera video in analyze mode: 9 moves incl. captures, 2-ply physical take-back, new branch, recorded moves exact. Spar take-back path not yet exercised live |
| 31 | AI move as arrow; you move it; then the app moves it. Accept your move when the AI move is skipped on the board; instructions as from→to; 同 notation | done, verified with live canvas camera vs the real AI (hold, land, skip, both-at-once, 2-move take-back). Header now says to play the AI move on the board (verified) |
| 32 | Phone/computer discover each other without QR; remember pairing | done: network room from public address + saved last computer on the phone; panel always listens, auto-switches, reopens after reload. Verified in browser and on the real Pixel (plain address reconnects) |
| 33 | Voice overlap, 盤が動きました loop, graph zigzag/mate flip, random re-grid | done: single voice channel, fewer announcements; regrid only after ~3 s; after-move eval sign and mate-0 fixed; periodic grid re-snap removed. Verified camera regression + consistent evals |
| 34 | Auto grid fails / shifted one file on the current board | done: window line sampling, top-3 candidate search, 3 weak lines allowed, game-occupancy acceptance, full re-search when the saved grid does not read the game; phone sends 1080p detail at up to 6 Mbit/s (verified on the Pixel: 1080x1920, contentHint detail). Offline: current board 81/81 squares correct |
| 35 | Handoff and push to main | done: main `7bfa62e` + handoff commit, production run 41096009037 success |

Explicit non-actions: no commit/push/PR; no outbound/cloud services (VOICEVOX and training run locally); no synthetic frames on the relay while the user's phone streams; do not touch the other session's Chromium.

## Implementation state

- `src/features/camera/`: `geometry.ts`; `vision.ts` (sampling, occupancy hysteresis empty <0.24 / occupied >0.32 / red ink, PieceBook, decide/inferMove, auto grid, `gridLocked`, `snapRefine`); `useCamera.ts` (sources device/phone/file, baseline-relative changes, orientation lock, flicker damping when still, statuses, async classifier, debug snapshot); `CameraPanel.tsx`; `classifier.ts` (onnxruntime-web, `public/models/piece.onnx`); `speech.ts` + zundamon `cam:*` phrases; `phone.ts` + `/dev/camera-send`; Vite relay + adb reverse watchdog.
- Real-footage facts: grid detection reliable only at ~360 px width (all grid work uses a 360-wide copy); 5筋 crease puts empty 5四/5五 at 0.12–0.16, pieces ≥0.37; piece direction cannot decide 180° orientation; the user sits at the image top.

## Verification

- Synthetic: 10-ply oblique render 10/10; vs-AI synthetic games 34 and 56 plies all read; 56-ply video 56/56.
- Real: auto grid locks on clear recorded frames, not on hand frames; live occupancy matches the app square by square; classifier loads in browser.
- Not verified: a complete live game on the real board after the latest fixes; 駒台 bug; typeface mix.

- Rail: at short windows (~577 px tall) 「その他」 falls below the visible rail, so the camera tool is unreachable (#29 open). Source dropdown now always shown (phone option was hidden when the computer has no camera).

## Next

Wait for the user's real-board report; then rail overflow at short windows, 駒台/flicker/typefaces (need their settings). Details and commands: `docs/HANDOFF_2026-10-31_CAMERA_PLAY.md` §10–§12.
