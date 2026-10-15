# Shogi Lessons Skill — full handoff and methodology, 2026-10-13

joseki-practice専用技能の作成・修正記録。原本はこのリポジトリの`.agents/skills/shogi-lessons/`のみ。global登録は削除済み。今後の教材作業はこのプロジェクトの現行タスクと新しい依頼から開始する。

# PART I — TASK CONTRACT AND LIVE STATE

## 1. Exact task contract

- 依頼: joseki-practiceの教材作成、宣言出典の確認、既存エンジンによる検証、生成と引継ぎの方法を、このプロジェクト専用技能へまとめる。
- 終了条件: 原本をこのプロジェクト内に保存し、実際のハーネスとの照合・技能検証・小規模読取試行の証拠を保持し、project-local参照とglobal登録の不在を確認する。
- 権限: project-local技能・参考手順・引継ぎ・project instructionsの作成/修正、および今回誤って作成したglobal artifactの撤去。教材コードは変更しない。
- 非対象: 教材変更、全教材再監査、ブラウザーの独立巡回、release/push/deploy、全設定sync、OS・音声設定変更。
- 優先順位: 現在の依頼、プロジェクト規則、現行ソース、過去の監査資料。過去の教材HANDOFFは現在の実装状態を上書きしない。
- 保存先: ユーザーのproject-owned規則に従い、この文書をリポジトリ内へ保存。handoff技能の一時ディレクトリ指定は適用せず、二重の一時文書を作らない。

## 2. Ground truth: repository and working tree

以下、`A`は`~/.awesome-agent`、`J`は`~/code/joseki-practice`を表す。

| Field                 | Current value                                                                                | Evidence command/artifact                         |
| --------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Working directory     | 現在J。Aは誤った初期配置の撤去先のみ                                                         | 各execのworkdir                                   |
| Repository and branch | A/main、J/main                                                                               | `git rev-parse --show-toplevel --abbrev-ref HEAD` |
| HEAD                  | A: `6cb3a0774586857ac67fb5603cf5437710978e9f`、J: `0287187e1d13d091eff4228748badada4a855e38` | 各cwdで`git rev-parse HEAD`                       |
| Base/PR state         | 今回の技能作成には不要。fetchしておらずリモート最新性を主張しない                            | 読取・ローカル作成のみ                            |
| Task changes          | JのAGENTS.md、conductor/CURRENT_TASK.md、新しい.agents/skills/shogi-lessons/とこの文書       | `git status --short --branch`                     |
| Skill registration    | J/.agents/skills/shogi-lessonsが実体。global source/build/2 discovery linkなし               | ローカルvalidatorと旧pathの存在確認               |
| Project baseline      | 内容試行まではJ clean。scope修正では技能・説明・task記録のみ変更                             | `git status --short --branch`                     |

Aの作成前の既存差分は次のとおり。所有者不明であり、現行タスク記録以外は変更していない。

- 変更済み: `meta/install-remote-skills.sh`、`shared/AGENTS.md`、`shared/core_profile.md`、`shared/local-skills/get-your-shit-together/SKILL.md`、同`references/refresh-procedure.md`、`shared/local-skills/the-council/SKILL.md`、`shared/local-skills/unfuck-yourself/SKILL.md`、`tests/test_remote_skills.sh`。
- 未追跡: `conductor/failure-process-audit.md`、`docs/HANDOFF_2026-08-17_CODEX_GOAL.md`、GYSTの`references/gyst-2026-07-29-macdroid-retry.md`、`shared/local-skills/motion-reel/`、`shared/local-skills/speak-properly/`。
- A/conductor/CURRENT_TASK.mdは誤ってこの技能作成へ置換したが、作成前に読み取ったdev-server権限修正記録へ復元済み。現在の技能タスクはJ/conductor/CURRENT_TASK.mdのみ。

## 3. Environment and operational rules

- default python3にはPyYAMLがない。技能validatorは隔離された`uv run --no-project --with pyyaml python`で実行。現在は依存がcacheされ、`--offline`で再検証可能。global Pythonへインストールしていない。
- 既存shogiハーネスをJで実行。環境名はRAYON_NUM_THREADS、UV_THREADPOOL_SIZE。両方1。既存engine-evalのThreads1/USI_Hash32MiB、400ms試行。
- 容量確認`df -h .`: 2.9GiB空き。教材生成、フルbuild/testは実施していない。
- 新しいbrowser/server/watch/jobを起動していない。既存アプリdev-serverを操作していない。今回ブラウザー状態・ポート・認証を利用する必要はない。
- ユーザーのアプリ確認中は独立browserを開かないというJ/AGENTS.mdの規則を維持する。将来の許可されたbrowser確認の安全prefixは技能参考手順に記載。
- 初期global登録はscope誤りで、source/build/linkを撤去済み。今後はJ内の技能実体とAGENTS.md参照のみを使う。全sync/remote installer/launch agents/wrapper更新は実施していない。

# PART II — COMPLETE EXECUTION RECORD

## 4. Chronological command and action ledger

以下は初期作成の履歴。global source/copy/linkは撤去済みで再実行不可。最新scope修正が履歴の配置・登録権限に優先する。列挙した相対パスは当時のCWDに対するもの。

| Order | Phase                   | CWD           | Exact command/action                                                                                                                                                                                                                                                                                                                                                                                        | Why / material result                                                       | Safe to rerun?                         |
| ----- | ----------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------- |
| 1     | Scope                   | 開始workspace | `get_goal({})`、`cat conductor/CURRENT_TASK.md`                                                                                                                                                                                                                                                                                                                                                             | 旧goal完了。既存並行laneを変更せず、新依頼を確認                            | 読取可                                 |
| 2     | Routing                 | 開始workspace | `request_user_input_async`による対象確認                                                                                                                                                                                                                                                                                                                                                                    | shogi/joseki-practiceを確認                                                 | 不要                                   |
| 3     | Locator                 | 開始workspace | `rg -n 'engine\|copyright-safe\|HANDOFF_2026-10-10\|joseki-practice\|shogi-joutatsu' ~/.codex/memories/MEMORY.md`、`sed -n '42,122p' ~/.codex/memories/MEMORY.md`                                                                                                                                                                                                                                           | 現行ソースの所在確認のみ。旧release数を採用しない                           | 読取可                                 |
| 4     | Instructions            | A             | `cat conductor/CURRENT_TASK.md`、`cat shared/AGENTS.md`、`wc -l shared/AGENTS.md`、`sed -n '100,225p' shared/AGENTS.md`、`sed -n '65,105p' shared/AGENTS.md`                                                                                                                                                                                                                                                | 原本244行読了。出力切断区間を回収                                           | 読取可                                 |
| 5     | Baseline                | A/J           | `git status --short`                                                                                                                                                                                                                                                                                                                                                                                        | A既存差分記録、J clean                                                      | 読取可                                 |
| 6     | Contract                | J             | `cat conductor/CURRENT_TASK.md AGENTS.md CLAUDE.md package.json`                                                                                                                                                                                                                                                                                                                                            | 現行著作方針、生成方法、active-user-testing規則を確認                       | 読取可                                 |
| 7     | Live record             | A             | `cat > conductor/CURRENT_TASK.md`、後続のPath.write_textによる置換                                                                                                                                                                                                                                                                                                                                          | 新タスクのscope・権限・read coverageを現行記録へ保存                        | 最新依頼を確認してから                 |
| 8     | Skill gates             | A             | `wc -l ~/.codex/skills/.system/skill-creator/SKILL.md ~/.agents/skills/handoff/SKILL.md ~/.awesome-agent/.build/skills/handing-off-pro-max/SKILL.md`、各ファイルの`cat`                                                                                                                                                                                                                                     | 229/16/167行EOF読了                                                         | 読取可                                 |
| 9     | Writing gate            | A             | `cat ~/.agents/skills/writing-for-agents/SKILL.md ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py`、`cat ~/.agents/skills/writing-for-agents/SKILL-MECHANICS.md`                                                                                                                                                                                                                            | 81/127/22行EOF。自動発見はdefault維持                                       | 読取可                                 |
| 10    | Local inventory         | J             | `rg --files scripts/lessons scripts/courses skills conductor/lesson-audit`                                                                                                                                                                                                                                                                                                                                  | 既存ハーネス特定。skillsディレクトリ不在のためexit2、他の対象結果を確認     | 不在skillsを省いて再実行               |
| 11    | Authoring/checks        | J             | `cat docs/lessons.md scripts/lessons/check-unit.ts scripts/lessons/check-course.ts scripts/lessons/check-originality.ts scripts/lessons/build.ts`                                                                                                                                                                                                                                                           | schema、生成、checkerの実際の意味を読了                                     | 読取可                                 |
| 12    | Engine/dependencies     | J             | `cat scripts/lessons/engine-eval.mjs scripts/lessons/unit.ts scripts/lessons/book.ts scripts/lessons/originality.ts scripts/lessons/fetch-references.py scripts/build-courses.mjs scripts/validate-curriculum.mjs conductor/lesson-audit/HANDOFF.md`                                                                                                                                                        | score視点、NOTE、cache欠落、過去handoffの古さを確認                         | 読取可                                 |
| 13    | Representative content  | J             | `cat data/lessons/units/rules-promotion.json scripts/courses/kakukoukan-shikenbisha.mjs`                                                                                                                                                                                                                                                                                                                    | 現行unit/segmentの使用例を全文確認                                          | 読取可                                 |
| 14    | Focused notes           | J             | `rg -n 'engine\|mate\|verified\|command\|SFEN\|repro' conductor/lesson-audit/findings.json`、`head -n 45 conductor/lesson-audit/coverage.json`、`sed -n '602,636p' conductor/lesson-audit/findings.json`                                                                                                                                                                                                    | 読了SHAとengine証拠の形を対象抽出。全監査note読了を主張しない               | 読取可                                 |
| 15    | Sync implementation     | A             | `cat meta/sync.sh`                                                                                                                                                                                                                                                                                                                                                                                          | 534行EOF、対象だけcopy/linkできる既存関数を選定                             | 読取可                                 |
| 16    | Repository pins         | A/J           | `git rev-parse --show-toplevel --abbrev-ref HEAD`、`git rev-parse HEAD`                                                                                                                                                                                                                                                                                                                                     | §2のcheckout/HEADを確定                                                     | 読取可                                 |
| 17    | Author                  | A             | `apply_patch`で`shared/local-skills/shogi-lessons/SKILL.md`と2参考手順を作成                                                                                                                                                                                                                                                                                                                                | 内容は§6の原本。既存engineを再実装しない                                    | 原本を比較してから                     |
| 18    | Trial                   | A/J           | `spawn_agent`、読取専用rules-promotion第一章監査、後続`followup_task`で画像のexact path照会                                                                                                                                                                                                                                                                                                                 | 1つの低コスト試行。アプリ変更・browser・外部通信なし                        | 新しいscopeがある場合のみ              |
| 19    | Validator failure       | A             | `python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py shared/local-skills/shogi-lessons`                                                                                                                                                                                                                                                                                                 | exit1、`ModuleNotFoundError: No module named 'yaml'`                        | 隔離uvを使用                           |
| 20    | Disk/coverage           | J             | `df -h .`、`wc -l scripts/lessons/engine-eval.mjs scripts/lessons/unit.ts scripts/lessons/book.ts scripts/lessons/originality.ts scripts/lessons/fetch-references.py scripts/build-courses.mjs scripts/validate-curriculum.mjs conductor/lesson-audit/HANDOFF.md data/lessons/units/rules-promotion.json scripts/courses/kakukoukan-shikenbisha.mjs ~/.agents/skills/writing-for-agents/SKILL-MECHANICS.md` | 容量とEOF行数確認                                                           | 読取可                                 |
| 21    | Offline failure         | A             | `uv run --offline --with pyyaml python ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py shared/local-skills/shogi-lessons`                                                                                                                                                                                                                                                                   | 未cacheのため解決不能、exit1                                                | cache取得後なら可                      |
| 22    | Validate                | A             | `uv run --no-project --with pyyaml python ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py shared/local-skills/shogi-lessons`                                                                                                                                                                                                                                                                | 隔離依存でSkill is valid、exit0                                             | 可                                     |
| 23    | Registration preflight  | A             | `ls -ld ~/.agents/skills ~/.codex/skills .build/skills/shogi-lessons ~/.agents/skills/shogi-lessons ~/.codex/skills/shogi-lessons`                                                                                                                                                                                                                                                                          | 親directory存在、同名技能なし                                               | 読取可                                 |
| 24    | Failed loader           | A             | `bash`のstdinから`source <(sed '/^echo "Standardizing skills\.\.\."/,$d' meta/sync.sh)`、copy_skill_dir/link_path呼出し                                                                                                                                                                                                                                                                                     | 関数未定義、exit127。生成なし                                               | global登録の再実行不可                 |
| 25    | Loader diagnosis        | A             | `ls -lh meta/sync.sh`、`rg -n '^echo\|copy_skill_dir\|link_path\|^source\|^set' meta/sync.sh`、`sed '/^echo "Standardizing skills\.\.\."/,$d' meta/sync.sh`                                                                                                                                                                                                                                                 | 関数原本は存在、main直前で切れることを確認                                  | 読取可                                 |
| 26    | Registration            | A             | 当時Python subprocessから既存sync関数をbash -cで実行。global登録recipeは撤去                                                                                                                                                                                                                                                                                                                                | 1技能だけbuildと2発見リンク作成、exit0                                      | 再実行不可、global scope誤り           |
| 27    | Installed validation    | A             | `uv run --offline --no-project --with pyyaml python ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py ~/.codex/skills/shogi-lessons`                                                                                                                                                                                                                                                          | Skill is valid、exit0                                                       | 現在は§12のproject-local validatorのみ |
| 28    | Artifact inspection     | A             | `wc -l shared/local-skills/shogi-lessons/SKILL.md shared/local-skills/shogi-lessons/references/*.md`、3ファイルの`cat`                                                                                                                                                                                                                                                                                      | 原本全文再読。後続の限定修正も全文へ統合                                    | 読取可                                 |
| 29    | Narrow revisions        | A             | `apply_patch`でaudit非変更mode、cache欠落、共有事実の扱いを追記                                                                                                                                                                                                                                                                                                                                             | 試行で必要となった限定修正                                                  | 同じ修正の再追加不要                   |
| 30    | Real engine interface   | J             | §12のSFEN smoke command                                                                                                                                                                                                                                                                                                                                                                                     | `32 7g7f -`、exit0。教材品質の証明には使用しない                            | 可、単独実行                           |
| 31    | Independent rule replay | J             | `RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 bun -e`でrules-promotion第一章をPosition.newBySFEN/createMoveByUSI/isValidMove/doMoveで再生                                                                                                                                                                                                                                                                       | 2e2c、2c3c、3c3dの成/不成双方合法。終点`4k4/9/9/6+R2/9/9/9/9/4K4 w - 1`     | 可、既存unitを再読してから             |
| 32    | Independent source      | J             | `cat .cache/curriculum-source/722.txt`、§6の3原画像をview_image                                                                                                                                                                                                                                                                                                                                             | 本文144行、cropped図の駒・矢印・変化を独立確認                              | 読取可                                 |
| 33    | Independent checker     | J             | `RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 bun scripts/lessons/check-unit.ts rules-promotion --engine`                                                                                                                                                                                                                                                                                                       | `rules-promotion: ok (4 chapters)`、exit0。position章ではengineを実行しない | 可                                     |
| 34    | Final artifacts         | A/J           | target-only再copy、validator、参照/link/hash検証、`git diff --check -- conductor/CURRENT_TASK.md`、`git status --short --branch`、各HEAD再確認                                                                                                                                                                                                                                                              | 最終verification receipt参照                                                | 対象scopeのみ可                        |

## 5. Methodology and decision record

1. 現行Jの著作規則と実装を読み、旧教材transcriptionの方針を流用しなかった。source図の読取は調査証拠であり、公開教材への複製権限ではない。
2. 技能entrypointはscope、mode、順序、完成条件と引継ぎを持つ。詳細は出典/執筆とengine/検証の2参考手順へ分割。新しいengine・lesson model・checkerは作成していない。
3. short-search、NOTE、mainline限定、position章skip、欠落cacheを判定上の制約として保存。exit0を意味・品質の完成判定にしない。
4. 試行担当の結果はそのまま受け入れず、rootがcurrent unit、checker実装、cached本文/原画像、promotion合法性を照合。三つの標準的なrule条件の順番一致だけで複製と断定しなかった。完全な独創性認定もしていない。
5. global登録はプロジェクトscopeを誤解していたため撤去。技能実体をJ/.agents/skillsへ移し、description/bodyをjoseki-practice専用に修正。AGENTS.mdへローカル参照とglobal登録の明示依頼要件を記載。Aの現行taskは元へ復元した。

## 6. Files and artifacts

| Path/URL/ID                                                                                          | Role / change                                                      | Verification                             | Ownership / resume               |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------- | -------------------------------- |
| J/.agents/skills/shogi-lessons/SKILL.md                                                              | project-local entrypoint、author/revise/audit/handoffのscopeと順序 | 全文読了、quick_validate                 | 今回作成。原本はこちらを編集     |
| 同references/sources-and-authoring.md                                                                | 出典/asset読取、original authorship、unit/variation/annotation意味 | current J docs/unit/builderと照合        | 今回作成                         |
| 同references/engine-and-verification.md                                                              | 合法手、book/engine/NOTE、originality/cache限界、browser証拠       | 実装読了と限定実行                       | 今回作成                         |
| A/shared/local-skills/shogi-lessons/、A/.build/skills/shogi-lessons/                                 | 誤ったglobal原本/生成copy                                          | 撤去を確認                               | 再作成しない                     |
| ~/.agents/skills/shogi-lessons、~/.codex/skills/shogi-lessons                                        | 誤ったglobal発見link                                               | 撤去を確認                               | 再作成しない                     |
| J/conductor/CURRENT_TASK.md                                                                          | この技能の現行scope/状態、以前の完了教材結果は歴史資料             | 200行/16KiB以下を確認                    | 今回のscope修正記録              |
| この文書                                                                                             | 作成方法・制約・検証記録                                           | 全文再読、対象状態再確認                 | 今回作成。現行記録の代用にしない |
| J/docs/lessons.md、AGENTS.md、CLAUDE.md、package.json                                                | 現行著作/生成/運用契約。AGENTS.mdへproject skill参照のみ追加       | 全文読了、追加diff確認                   | AGENTS.md以外未変更              |
| J/scripts/lessons、scripts/build-courses.mjs、scripts/validate-curriculum.mjs                        | 既存ハーネス。読了対象は現行task recordに列挙                      | API/制約確認、smoke/replay/check-unit    | 未変更                           |
| J/conductor/lesson-audit/{coverage,findings}.json                                                    | SHA、出典、bounded engine記録の既存例                              | 対象抽出のみ                             | 全資料読了を主張しない           |
| J/conductor/lesson-audit/HANDOFF.md                                                                  | 過去の監査方法例                                                   | 全59行読了、現在の実装状態として採用せず | 未変更、現行taskに劣後           |
| J/data/lessons/units/rules-promotion.json、scripts/courses/kakukoukan-shikenbisha.mjs                | 実unit/segment例                                                   | 全文、第一章合法性確認                   | 未変更                           |
| J/.cache/curriculum-source/722.txt                                                                   | 試行用の宣言出典cache                                              | 全144行読了                              | 未変更。今回live source更新なし  |
| 同diagram-inventory-work/assets/f564961e7c072c829c3758660e6a98cea1a1c49a1a518c16258e1633a9fdab22.png | 敵陣への移動図                                                     | rootで原画像確認                         | 未変更                           |
| 同assets/44558159d1b4dbd1b64bb7732113a4afadfe377bf9dad7d27e847440059ee9ed.png                        | 敵陣内の移動図                                                     | rootで原画像確認                         | 未変更                           |
| 同assets/dd91a4a8f006b95676ea9eec84ccafdc2d626fb923c7f8bbd1ab4082b40b6508.png                        | 敵陣外への移動図                                                   | rootで原画像確認                         | 未変更                           |

# PART III — EVIDENCE, FAILURES, AND HONESTY

## 7. Verification matrix

| Requirement/claim         | Evidence layer        | Exact evidence                                    | Result                   | Unverified                             |
| ------------------------- | --------------------- | ------------------------------------------------- | ------------------------ | -------------------------------------- |
| 技能形式とproject scope   | filesystem/validator  | ローカルquick_validate、参照解決、global4path不在 | 確認済み                 | 既存セッションcatalogの再読込          |
| engine commandが動作      | real engine           | §12の400ms/SFEN、32 7g7f -                        | interface確認            | best-play/教材品質                     |
| promotion第一章のルール例 | rules library/source  | exact unit、cached722、3図、独立replay            | 3移動の成/不成合法確認   | browser表示・全単位の意味受入れ        |
| checker限界を正しく説明   | source/runtime        | check-unit原本と実際のok4chapters                 | 確認済み                 | position章のengine診断は実施していない |
| 教材コード未変更          | git                   | Jのstatus/diff                                    | 技能/AGENTS/task/docのみ | remote stateは未確認                   |
| 著作/出典の方法を保存     | project policy/source | J docs/lessons、skill参考手順                     | 手順照合                 | 全教材の独創性/法的認定                |

## 8. Failures, traps, and rejected approaches

| Item                         | Symptom                                                             | Root cause / decision                                           | Recovery                                                   |
| ---------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------- |
| Default validator            | `ModuleNotFoundError: No module named 'yaml'`                       | default Python依存欠落                                          | 隔離uv環境                                                 |
| Offline first retry          | `pyyaml was not found in the cache`                                 | 依存未cache                                                     | 一度だけ隔離uvで取得、以後offline可                        |
| Shell loader                 | `copy_skill_dir: command not found`、`link_path: command not found` | stdin/process substitution経由で関数未定義。低level原因は未確定 | 同じmain前関数文字列をPython subprocessのbash -cへ渡し成功 |
| Wrong validation implication | --engine付きでもposition章は評価しない                              | current checkerのopening判定                                    | 該当SFENを直接確認、claimに合う証拠を選ぶ                  |
| Empty historical comparison  | oldPositionsは欠落directoryをskip                                   | zero比較でも成功し得る                                          | cache有無を記録、独創性証明として扱わない                  |
| Wrong skill scope            | global registriesへ配置                                             | project固有のschema/engine workflowをglobal技能と誤認           | このrepoの.agents/skillsへ移動、global登録撤去             |
| Old handoff status           | 過去資料は未修正/旧branchを記載                                     | 現行taskが後続の完了状態を持つ                                  | current recordとactual HEAD優先                            |
| Overbroad completion         | short engine/原本合法性をbrowser/optimalityへ昇格                   | 証拠層が異なる                                                  | §7の未検証欄を維持                                         |

## 9. Known limitations and blockers

技能作成の阻害要因なし。今回の限定試行は完成教材の再監査ではなく、browser・full build・release・全出典・全assetの受入れは非対象。全教材の独創性や法的安全性を認定していない。

将来、出典欠落やshort-search不確定が実際の教材claimを阻害する場合は、そのclaimと不足する証拠を特定し、直接確認または根拠に合う限定表現に直す。未取得内容や許可を推測しない。

# PART IV — RESUME WITHOUT REDISCOVERY

## 10. Immediate next action

project-local技能作成は完了。新しい教材依頼を受けたら、このプロジェクトの指定checkoutで`ls -lh conductor/CURRENT_TASK.md`、続いて全文を読み、`$shogi-lessons`を使用する。対象IDs・source set・変更/auditのmodeが未確定なら、発見できる事実を調べてから必要な点だけ確認する。今回の試行を自動的に全教材監査へ拡大しない。

## 11. Remaining ordered work

今回の依頼に残作業なし。新しい教材変更、独立browser、release、全syncにはそれぞれ対応する依頼が必要。旧ARS-2372作業を再開しない。

## 12. Command cookbook

Jでローカル技能を検証する。global sync/copy/linkは行わない。

```sh
RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 uv run --offline --no-project --with pyyaml python ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/shogi-lessons
git diff --check -- AGENTS.md conductor/CURRENT_TASK.md
git status --short --branch
```

Jでの実interface smoke。学習内容の検証とは別。

```sh
RAYON_NUM_THREADS=1 UV_THREADPOOL_SIZE=1 node scripts/lessons/engine-eval.mjs 400 <<'SFEN'
lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1
SFEN
```

unit/course/generationの現行コマンドと制約は技能のengine-and-verification参考手順を参照。読取auditでは生成しない。engine/buildは同時に走らせず、規模に応じた既存チェックのみ使う。

## Suggested skills

- 教材作成/修正/監査: `$shogi-lessons`。
- この技能自体の限定改訂: `$skill-creator`、`writing-for-agents`。
- 明示的な全運用引継ぎ: `$handing-off-pro-max`。コンパクト引継ぎでは`$handoff`の重複防止・suggested skills方針を使い、保存先はユーザーのproject-owned規則へ従う。

## 13. Handoff receipt

- 最新修正: project scope。初期global配置は破棄し、技能実体とこの文書をJへ移した。global発見経路には残さない。
- Current artifacts: J/.agents/skills/shogi-lessons/{SKILL.md,references/sources-and-authoring.md,references/engine-and-verification.md}、AGENTS.mdのproject skill参照、conductor/CURRENT_TASK.md、この文書。
- 初期読取・限定試行の証拠は上記履歴と参考手順に保持。新しい教材/browser/source auditを追加していない。
- Verification: local quick_validate、全参照解決、global source/build/2link不在、scoped diff、対象ファイルのwhitespace/secret-pattern確認。current recordへ最終結果を保存。
- Unverified: アプリbrowser表示、全教材/全出典、best-play/semantic originality/legal certification、release/remote。今回のscope修正完了と混同しない。
