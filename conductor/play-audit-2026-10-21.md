# Play-experience audit (2026-10-21)

Scope: playing a proper game against the AI (welcome → new game → moves → captures/promotion → mistakes → resign/game over), desktop 1400×900 and phone 390×844, production build. antislop mode: during (global preference). Direction: existing sumi/washi/shu identity (CLAUDE.md).

## First-hand observations (real browser, production build)

1. Input during the opponent's animation or reply is dropped without feedback: a pawn move clicked while the AI move was still landing did not register.
2. The coach stays on in a timed dan-level game: every move is rated live, the 10-counter rating grid updates, the eval bar and phone 勝率 bar show who is ahead. A serious game leaks the evaluation; the new-game dialog has no coach choice.
3. The rating grid shows ten zero counters before the first move (dashboard filler, R-27/C-3).
4. A brush-stroke tesuji banner (飛車先交換) lands over the middle of the board while it is the player's turn.
5. Strategy detection mislabels the player's ordinary rook-pawn exchange as 7手爆弾 on the plate and move tags.
6. Header repeats turn state: "あなたの手番です。" on the left and "☗番" under the last move on the right.
7. First visit loading text is English ("Loading board and pieces…") while the app defaults to Japanese.
8. At dan level with 10 min + 30 s the AI replies in under a second in the opening; it feels like an instant bot rather than an opponent using its clock.
9. Game over card works (投了, result, review, new game) but says nothing about the game itself.

Screenshots: scratchpad play/ (not committed).
