# Current task

## Current scope
- Active correction: study prompt had empty quiz feedback reservation above content. Reserve feedback only in quiz; study feedback floats above card without affecting flow. Study gap verified removed at 390px and 1440px: prompt sits 12px below card top; empty feedback height zero. Quiz reservation remains 72px; checking retains identical board/bar/panel/prompt bounds. TypeScript, lint and formatting pass.
- Latest correction completed: top rail icon-only lesson-return arrow; lesson flow-chart and verbose return buttons removed from bottom bar. All compact bottom icons 18px, buttons 38×38px, study/quiz segments 46×38px. Full lesson row fits at 320px without scrolling.
- Correction skills read: get-your-shit-together 1–EOF/27 and look-at-the-screen 1–EOF/60; both supplied screenshots inspected.
- Mobile bottom controls contain previous/next and panel toggle in one fixed row with panel open or closed. Extra tools scroll horizontally; evaluation occupies a separate strip above controls.
- Quiz score and two-line feedback have reserved space; incorrect moves and engine checking do not insert rows or trigger panel scrolling. Mobile preview banners are positioned overlays.
- Full Peta book downloader accepts hash-verified compressed or browser-decoded chunks. Local Vite HTTP gzip decoding previously caused invalid-chunk rejection.
- Approved native shogi clack integration remains complete: board Original 4, komadai Original 5; no recording playback in application.

## Permissions and runtime
- Current authorization: commit patch on main, close all repository PRs, synchronize main and leave working tree clean. No new commit, push, release or deployment authorized this turn; no active Goal.
- User explicitly authorized leaving localhost dev server running. Foreground session 81111 at http://127.0.0.1:5173 runs after a free-port check; do not stop it during cleanup.
- Owned muted headed browser book-fetch used for QA; closed after final checks. Preexisting default session untouched.

## Implementation
- src/appearance/clack.ts builds live native oscillator and filtered generated-noise graphs. Prepared periodic waves, noise buffers and gain curves cached per AudioContext/profile. Every source tracked and graph disconnected after completion.
- src/appearance/clack.json contains synthesis parameters only: 24 resonant oscillators and 12 shaped-noise bands per profile, frequency/amplitude envelopes, 2 ms measured contact envelope with 0.5 ms gain knots and audition level calibration.
- Board: +4 dB low shelf at 900 Hz, -4 dB body bell at 1 kHz/Q0.8.
- Komadai: -2 dB low shelf at 900 Hz, same body cut, -10 dB high shelf at 6500 Hz and frequency multiplier 0.95; less table thud.
- settings.ts routes move/capture to board profile and komadai to its distinct profile at reduced gain, respecting sound toggle, volume and visibility suppression. Existing animation callers unchanged.
- src/appearance/clack.pcm.txt deleted; no reference PCM decoder or recorded waveform dependency remains in app sound implementation.
- sound-samples/native-compare.html and native-board.wav/native-komadai.wav preserve approved audition. Reference recordings used only for analysis/comparison.

## Verification
- Browser native OfflineAudioContext rendering of actual app module matches reviewed WAVs: relative waveform error 0.0142% board, 0.0161% komadai, within PCM16 quantization; 36 tracked sources per event, 250 ms, 48 kHz. Peaks 0.888/0.874 at full audition gain.
- Real headed study move emitted 24 board-profile oscillators plus separate existing success tones. Sound toggled off through M; actual reply advanced without any new oscillator starts.
- Real analysis-board capture performed by pointer selection and promotion: captured tile landing emitted komadai frequencies, followed 576 ms later by board frequencies on capturing tile landing. Result position inspected in native-capture-after.png.
- Current runtime screenshots: dogfood-output/clack-mobile/native-capture-before.png and native-capture-after.png. No browser errors.
- TypeScript, targeted lint, formatting and diff whitespace checks passed. Checks capped with UV_THREADPOOL_SIZE=2; no new tests created. Dev server reports existing Node 22.12/version warning but ran successfully.
- Physical browser output muted; sound character previously reviewed by user in personal Chrome comparison.

## Earlier completed scope
- Compact study drawer independent of content; horizontal evaluation above bottom controls; fixed two-line instruction banner with internal scrolling.
- Actual mobile/tablet/desktop states inspected at 320/390/690/834/1440 px. Short/wrapped banner keeps board/control bounds unchanged.

## Skills read
- stop-inventing 1–EOF/79; get-your-shit-together 1–EOF/27; show-me 1–EOF/93; look-at-the-screen 1–EOF/60.
- surgical-patch 1–EOF/16; ui-density 1–EOF/155; agent-browser 1–EOF/52 plus full required CLI guide; real-testing-evidence 1–EOF/70.

## Current verification
- Real pointer quiz wrong move 9g9f at 390px: board, bar, panel, card, prompt and answer button bounds identical before/after. Engine checking and final feedback for alternative 2g2f also retain exact bounds, including prompt and answer button.
- Bottom controls inspected at 320/390/834/1440px, panel open/closed; previous/next navigation exercised through actual buttons. Mobile control row remains 56px; no page overflow at 320px.
- Study tablet evaluation visibly occupies separate strip above one control row.
- Full-book download completed through actual localhost settings UI: user_book1.db 470.3 MB saved; progress/cancel disappeared, no error. Owned QA book subsequently removed through UI.
- Current evidence in dogfood-output/clack-mobile: quiz-wrong-fixed.png, quiz-320-fixed.png, quiz-panel-hidden.png, controls-desktop.png, study-tablet-controls.png, book-download-complete.png; each inspected.
- TypeScript, targeted lint, formatting and whitespace checks pass. No new tests.
- Final evaluated wrong-move screenshot quiz-final-wrong.png inspected; no browser errors. Owned book-fetch browser closed; only preexisting default remains. Authorized dev server left running. Patch committed on main as 7b74387.

## Compact controls verification
- Both supplied screenshots inspected; inconsistent button sizing and verbose bottom actions were the defect.
- Real headed browser checked 390px and 320px, panel open/closed. All seven lesson controls visible in one row; 320px tool width equals content width, page width 320px.
- Top return arrow clicked and lesson picker appeared. Bottom flow-chart and lesson-return buttons absent.
- Current screenshots compact-controls-390.png, compact-controls-320.png and compact-controls-panel-open.png inspected.
- TypeScript and formatting pass; targeted lint has only existing Application effect warnings. No new tests. Patch committed on main as 7b74387.
- Owned compact-controls browser closed after verification; authorized localhost server retained.

## Repository cleanup
- Open PRs 8 and 2 closed without merge.
- Sound audition samples retained locally and excluded through .git/info/exclude.
- Main refreshed from origin; patch commit is the only local lead. Task record cleanup committed before synchronization.

## Server instruction repair
- unfuck-yourself read 1–EOF/60; audit uses current conversation requests/tool results only.
- Blanket server-start and dead-server-restart bans in .awesome-agent/shared/core_profile.md:35/51 caused unnecessary permission gating; prior process exit cause unavailable, not asserted as a crash.
- Both clauses replaced: start/restart project-local dev commands on free ports without asking; reuse matching listeners or select another port, preserve unrelated services, respect leave-running authorization.
- Existing isolated prompt-unification check passed; canonical prompt regenerated with existing renderer, installed Codex/Claude/Gemini links verified. No full configuration sync or unrelated system changes.
- Runtime resumed successfully and original study-card fix inspected. Owned study-gap browser closed after final checks; dev server retained by standing authorization.
