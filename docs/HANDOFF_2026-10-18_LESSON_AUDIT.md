# レッスン監査 — 引き継ぎと検証方法、2026-10-18

## 1. 作業契約

最新指示により監査を停止し、引き継ぎを作成した。Goal は paused。再開には明示的な指示が必要。目的は全150単元の意味・戦術・教材品質の監査であり、完了していない。今回の権限は監査記録と引き継ぎの作成のみ。教材修正、生成、コミット、push、PR、リリース、デプロイは未承認。

正本は `data/lessons/units/`、プロジェクトの `AGENTS.md`、`docs/lessons.md`。ライブ記録は `conductor/CURRENT_TASK.md` 一つだけ。本書は継続用の証拠でありライブ記録の代替ではない。

## 2. リポジトリの実測状態

- CWD: `/Users/vittayapalotai.tanyawat/code/joseki-practice`
- branch: `refactor/panda-jsx`
- HEAD: `77740b54ed629cdd422ba05c1047a912da3f7b4f`
- `git status --short --branch`: ローカル追跡情報では origin/main より6コミット先行。fetch は今回行っておらず、リモート最新状態を示さない。
- 既存変更: `conductor/CURRENT_TASK.md`。
- 今回の監査証拠: 未追跡 `conductor/lesson-audit/resumed-2026-10-18.json`。
- 以前からの未追跡文書: `docs/HANDOFF_2026-10-15_EXPANDED_LESSON_AUDIT_RELEASE.md`。今回未変更。
- 既存Panda作業を保持。教材ソース・生成物に監査による変更なし。

## 3. 環境と制約

Bun/Node は `DO_NOT_TRACK=1 RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1` を付ける。コマンドは逐次実行。重い検証前に `df -h`。新規テストは禁止条件に従う。ブラウザ、サーバー、バックグラウンド処理は今回起動していない。既存プロセス・ポート・ユーザーのブラウザは調査しておらず、利用可能とは判定しない。認証・CI・公開環境も未検証。

## 4. 実行記録

各単元で `ls -lh <source/reference>`、`wc -l <source/reference>`、`cat <source/reference>` を順に実行し、EOFまで読んだ。正確な対象パスと読了範囲は証拠JSONの `reviewedUnits`。続いて `bun -e` で `tsshogi` の合法性、局面差、取り返し、必要時は全応手を列挙し、`lessonOf` と既存生成物の文字列一致を確認した。結果を証拠JSONに保存し、ライブ記録を置換後、`git diff --check` を実行した。

過去の全インラインコマンド本文・時刻は保存していない。完全な逐語コマンド台帳とは主張しない。旧セッションのログ探索は行っていない。再実行に必要なAPI、具体的手順、SFEN、結果、ソースハッシュは証拠JSONと下記cookbookに残す。

引き継ぎ時の順序: サイズ確認 → ライブ記録更新 → handoff skill 167行を全読 → `git status --short --branch` → `git rev-parse HEAD` → Goalをpausedに変更 → 本書作成 → 文書再読・状態確認・差分検証。

## 5. 方法と判断

エンジンの第一手評価低下は候補選定に限定する。意図的な悪手、協力的応手、局所的な駒の動きの例は評価低下だけでは欠陥ではない。実際の文章と局面を比較する。準備手は前後の利きを比較し、既存の利きを新規効果と扱わない。相手の即時取り・王手・取り返しを確認する。

`tsshogi` の `Position.newBySFEN`、`createMoveByUSI`、`isValidMove`、`doMove` を使用。手番を置換した解析は利き比較専用と明記し、実際の合法手順とは区別する。全応手は81マスの移動元・移動先、成/不成、各持駒の打ちを列挙。詰みは王手かつ合法応手0を要求。エンジンPVだけでは詰み証明しない。`lessonOf` は全主線・分岐を合法再生するが、文章の正しさや描画は保証しない。

## 6. ファイルと証拠

- `conductor/lesson-audit/resumed-2026-10-18.json`: 今回の `findings`、`triage`、`reviewedUnits`、`engineRefresh`。単元名で照会し、全体を無差別に読まない。
- `conductor/lesson-audit/expanded-2026-10-15.json`: 過去の517件の第一手診断、修正済み台帳。変更しない。修正済みというラベルだけで現在の正しさを認定しない。
- `.cache/curriculum-source/<記事ID>.txt`: 参照記事のキャッシュ本文。図・外部書籍・動画の全読とは別。
- `data/lessons/units/<id>.json`: 著者ソース。監査では未変更。
- `src/data/lessons/<id>.json`: 生成物。`lessonOf` 一致を確認、直接編集禁止。
- 旧2026-10-15引き継ぎ: 候補位置の照会のみ。全読未完。旧停止指示・旧状態を今回の状態に優先しない。

今回の読了・再生記録がある単元:
hineribisha, castles-hidarimino, castles-funa, basics-value, shiken-tateishi, proverb-three-pawns, castles-nakazumai, tesuji-bishop, yokofu-basics, rules-checkmate, rules-tsume, endgame-tsume-study, rules-fouls, ureshino-new, aifuri-vs-ishida, basics-middlegame, aifuri-hidari-anaguma, aigakari-basics, aiyokofu, taifuri-bougin-ishida, endgame-yose, taifuri-anaguma, rules-promotion, shiken-vs-yagura, taifuri-millennium, endgame-tsumero, tesuji-knight, rules-drops, attack-mino-aifuri, yagura-vs-migishiken, kakugawari-ittezon, fujii-vs-hidarimino, ishida-basics, castles-aifuri, sanken-tomahawk, kishu-ahiru, tesuji-pawn, aifuri-ishida-vs-naka, attack-kinmusou, kishu-sujichigai, attack-anaguma, taifuri-bougin, gokigen-vs-chousoku, ureshino-basics

## 7. 検証マトリクス

| 項目                        | 証拠                                      | 状態・限界                         |
| --------------------------- | ----------------------------------------- | ---------------------------------- |
| 個別戦術・利き              | JSONのSFEN、手順、列挙結果                | 記録した局面のみ検証済み           |
| 主線・分岐の合法性          | lessonOf再生                              | reviewedUnitsに記録した単元のみ    |
| 生成物との一致              | JSON.stringify(lessonOf(source))との一致  | 教材の意味や表示は保証しない       |
| 全150単元・後続手の意味監査 | 全件の主張と証拠の対応が必要              | 未完                               |
| 参照図・独創性              | 原資料の図との比較、originality検証が必要 | 今回のテキスト読了では未達         |
| 表示・注釈・クイズ          | 実ブラウザが必要                          | 今回未実施                         |
| 差分整合性                  | git diff --check                          | 引き継ぎ時に実行。戦術証明ではない |

## 8. 欠陥と再発防止

未修正の確認事項:

- `nakabisha-sente` ch1、`taifuri-46gin` ch2: 即時の2b角取りと守備駒不足。
- `proverb-three-pawns` ch5: と金が取られることと飛車への利きがないことを混同。
- `tesuji-bishop` ch1: 銀の取り返しを必須とするが玉の逃げ2通りが残る。
- `yokofu-basics` ch2: 既に開いた角道を新しく開くと説明。
- `endgame-tsume-study` ch1/2: 表示持駒限定の前提が不明示。表示持駒での詰みは証明済みだが残余駒を後手に与えると受けが変わる。
- `taifuri-bougin-ishida` ch1: N7gx6eで金が取られ直ちに取り返せない。
- `attack-mino-aifuri` ch3: R6iが既に6c歩を狙っており、R6hで新規圧力は生じない。
- `taifuri-bougin` ch3: `4d4e 4g4f 4e4f 5h4g` の後、`4f4g+` が金を取り合法な直接の取り返し0。後続の金による歩取りの説明が即時応手を飛ばす。
  詳細の正確な局面・ソースハッシュ・範囲は `findings` を照会する。盤面構成上の懸念と明確な文章上の誤りを同列にしない。

偽陽性: `kakugawari-ittezon` の `B*7c` 王手飛車取りは `8a7c` で角を取れる。`endgame-tsumero` ch5は全86応手中82非王手すべてに一手詰があり、即詰を避ける4手は `4a4i`、`4a4i+`、`4a9a`、`P*9h`。エンジンの損失だけで誤りにしない。

## 9. 制限とブロッカー

外的な進行不能はない。停止理由は依頼されたwrap-up。教材の全意味監査、参照図・書籍・動画、全独創性、実表示は未完。`endgame-yose` のエンジンmate67は独立証明なし。過去の約評価値は現在の再計算値と異なるため固定事実として引用しない。

## 10. 再開直後の一手

明示的な再開指示後、Goal状態と `conductor/CURRENT_TASK.md` を確認。CWDで `ls -lh .cache/curriculum-source/5256.txt` を実行する。存在すれば行数確認後にEOFまで読む。存在しなければ同じ参照の既存キャッシュを対象限定で探す。`hayaishida` のソースは1–125 EOFまで読了したが、参照・戦術検証・生成物一致は未完。reviewedUnitsに追加していない。

## 11. 残作業の順序

1. `hayaishida` 参照5256の読了。ch2 `B*4e` の飛車・銀両取り、王手への応答、取り返しを検証。ch1の角交換、ch3の玉位置と角の王手も確認。結果を既存JSONへ保存。
2. 過去診断から次の未読候補を選択。`reviewedUnits` と `findings`、過去修正済み台帳を候補選択時のみ除外し、既存の記録を重複作成しない。
3. 第一手診断だけでなく、全単元・全後続説明の検証範囲を照合。未検証主張を残し、全体合格を宣言しない。
4. 確認済み欠陥の修正は別途承認後。著者ソースのみ変更、必要な単元・コース検証と `bun run lessons`、独創性検証、実表示の確認を行う。
5. 外部書き込み、コミット、push、公開にはその時点の明示的権限が必要。

## 12. コマンドcookbook

逐次実行、ネットワーク不要:

```sh
cd /Users/vittayapalotai.tanyawat/code/joseki-practice
ls -lh conductor/CURRENT_TASK.md
cat conductor/CURRENT_TASK.md
ls -lh .cache/curriculum-source/5256.txt
wc -l .cache/curriculum-source/5256.txt
cat .cache/curriculum-source/5256.txt
git status --short --branch
git rev-parse HEAD
git diff --check
```

Bun解析の先頭は `DO_NOT_TRACK=1 RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 bun -e`。インポートは `Position` from `tsshogi` と `lessonOf` from `./scripts/lessons/unit`。各手は作成・合法判定・適用の三段階で失敗を例外にする。生成物比較は `readFileSync("src/data/lessons/ID.json","utf8") === JSON.stringify(lessonOf(unit))`。

既存検証を実行する場合はskillに従い、`bun scripts/lessons/check-unit.ts <id>`、開始局面がopeningなら `--engine`、コースは `bun scripts/lessons/check-course.ts <id> --engine`。今回これらを全件実行したとは主張しない。監査再開だけでは生成や修正を実行しない。

## 13. 引き継ぎ確認

- 作成日: 2026-10-18 JST。
- 状態証拠: 引き継ぎ時の `git status --short --branch`、`git rev-parse HEAD`、Goal pausedのツール応答。
- skill読了: handing-off-pro-max 1–167 EOF。既存shogi skill読了範囲はライブ記録に保持。
- 追加履歴読解: なし。旧セッション・他プロジェクトを調査していない。
- 保存物: 本書、既存ライブ記録。監査結果は既存JSONを保持。
- 書込後確認対象: 本書全文、ライブ記録、git diff --check、git status。
- 明示的未検証: 全件完了、実ブラウザ、参照図、外部書籍/動画、完全な逐語コマンド台帳、リモート最新状態。
