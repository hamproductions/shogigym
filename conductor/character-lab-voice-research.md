# Character Lab 音声・リアルタイム助言調査

## ローカル実装の確認

本節は現在のリポジトリ内の実装調査。外部サイトの仕様や動作を示すものではない。ソースは各ファイルのサイズ・総行数を確認してから末尾まで読んだ。音声再生、ブラウザー実行、エンジン実行、ビルドは行っていない。

### 着手評価からコーチ表示まで

| 段階 | 現在の機能 | 根拠 |
| --- | --- | --- |
| 着手確定 | 盤面セッションが棋譜・カーソルを更新する。ユーザー操作時に AudioContext を再開する経路も持つ。 | `src/app/hooks/useBoardSession.ts:115` |
| 評価対象 | `useMoveReview` が直前の SFEN と USI をキーに評価を取得。対局では相手の応手後も自分の直前の手を対象に保つ。エンジン対応・局面対応・有効モードを確認する。 | `src/app/hooks/useMoveReview.ts:10`, `src/app/hooks/useMoveReview.ts:37` |
| エンジン解析 | `reviewMove` は標準 300ms、着手前 MultiPV 3。既知の候補手順を利用できなければ着手後も解析する。候補には評価値・詰み値・PV・深さがある。 | `src/utils/analysis.ts:340`, `src/utils/engine.ts:253` |
| 分類 | 勝率換算の損失、最善手一致、次善手との差、駒の犠牲、定跡判定から `brilliant / great / best / excellent / good / book / inaccuracy / mistake / miss / blunder` を返す。確定的な教師ラベルではなく、探索結果に依存する分類。 | `src/utils/analysis.ts:300` |
| 説明 | `MoveReview` は `loss / before / after / best / reply / reasons / bestReasons` を持つ。説明は駒取り・王手・成り・打ち・両取り、駒の放置、詰み逃し・被詰み、PV 内の駒損等から翻訳文を組み立てる。生成 AI の自由文ではない。 | `src/utils/analysis.ts:116`, `src/utils/analysis.ts:207`, `src/utils/analysis.ts:236`, `src/utils/analysis.ts:281` |
| コーチ表示 | 判定名、理由の先頭 2 件、弱点別の改善原則、必要なら推奨手とその理由を表示。評価未取得時は定跡注記・逸脱注記・解析中表示を使う。この表示経路は音声を呼ばない。 | `src/app/panels/CoachPane.tsx:42`, `src/app/panels/CoachPane.tsx:116` |

`useEvaluation` は現在局面の評価値・勝率・解析完了状態も持つが、一手の良否分類とは別経路（`src/app/hooks/useEvaluation.ts:13`）。棋譜全体の未評価手を埋める `useAutoRate` も存在するため、キャッシュ更新全般を発話トリガーにすると過去の手を読み上げ得る（`src/app/hooks/useAutoRate.ts:22`）。

ライブ助言の表示可否は `useSpar` の `assist` が決める。対局中は `coach === 'live'`、終局後はコーチ非表示状態に従う（`src/app/modes/spar/useSpar.ts:79`）。パネルもこの可否で表示する（`src/app/panels/PanelBody.tsx:116`）。音声追加時にも同じ方針を使う必要がある。

### 現在の音声イベントと再生経路

音声は `say(text, urgent)` → `public/voice/zundamon/manifest.json` の完全一致キー → `.webm` 取得 → `decodeAudioData` → `AudioBufferSourceNode` → `GainNode` → 共通 AudioContext 出力、という静的素材の経路。未登録文字列・取得失敗・デコード失敗は再生されない（`src/utils/voice.ts:3`, `src/utils/voice.ts:29`）。任意のコーチ説明文を読み上げる TTS 呼び出しは、この経路にはない。

| イベント | 発話・タイミング | 根拠 |
| --- | --- | --- |
| 王手・詰み | 王手は緊急発話。詰みは終了挨拶。3D では駒の着地通知に合わせる経路を持つ。 | `src/app/hooks/useAnnouncements.ts:39`, `src/app/hooks/useAnnouncements.ts:110`, `src/app/Application.tsx:433` |
| 戦法・囲い | 発見済みの名称を記録し、同じ開始局面の進行中は重複を抑制。助言非表示の対局では名称発話を抑制する。手筋検出は画面注記に使うが、その検出箇所から直接発話はしない。 | `src/app/hooks/useAnnouncements.ts:16`, `src/app/hooks/useAnnouncements.ts:80`, `src/app/Application.tsx:143` |
| 時計 | 自分側の秒読み、経過秒、時間切れを緊急発話。 | `src/app/modes/spar/useGameClock.ts:79` |
| 開始・振り駒 | 対局開始挨拶、振り駒案内・結果。 | `src/app/Application.tsx:301`, `src/utils/voice.ts:69` |
| 終局 | 復元・モード変更・既に終了していた状態を除外して挨拶。effect の cleanup で当該発話を取り消す。 | `src/app/Application.tsx:288` |

### 設定・割込み・ライフサイクルの制約

- 設定は `sound / voice / volume`。既定値は有効・有効・0.6。音声専用音量、話者選択、キャラクター別の台詞設定はこの設定型にはない（`src/appearance/settings.ts:23`, `src/appearance/settings.ts:69`）。設定画面は効果音、共通音量、音声の有効化を提供し、音声を有効にすると試聴する（`src/app/dialogs/SettingsDialog.tsx:759`）。レールのミュートも共通 `sound` を変更する（`src/app/rail/SoundButton.tsx:30`）。
- 発話待ち行列はない。通常発話は別の音声の再生中なら破棄。緊急発話は現在の音声を停止して置き換える。時計・王手・終了挨拶は同じ一つの再生枠を競合する（`src/utils/voice.ts:35`）。
- 素材取得は非同期。要求番号による新旧確認がないため、取得完了順がイベント発生順と逆になる可能性がある。`say` が返す取消関数を使えば当該要求を取り消せるが、アナウンス・時計の呼出箇所はそれを保持していない（`src/utils/voice.ts:32`, `src/utils/voice.ts:59`, `src/app/hooks/useAnnouncements.ts:39`, `src/app/modes/spar/useGameClock.ts:96`）。
- `sound / voice / volume` は呼出時に取得する。ロード完了後は設定を再確認せず、再生中の音声を設定変更で止める購読もない。したがってミュート直後の既存・読込中発話まで停止する実装ではない（`src/utils/voice.ts:29`, `src/appearance/settings.ts:120`）。
- ページが非表示になると追跡中の音源を停止する。音声と効果音は共通 AudioContext・追跡集合を使う。音声中の効果音を弱める処理はない（`src/appearance/settings.ts:194`, `src/appearance/settings.ts:207`, `src/appearance/settings.ts:260`）。
- 盤面リセット、待った、棋譜移動、モード変更を発話全体の無効化に結び付ける仕組みは現在の音声モジュールにない。盤面側には reset / truncate、対局側には over / halted / aiThinking / resignation / flag 等の状態がある（`src/app/hooks/useBoardSession.ts:160`, `src/app/modes/spar/useSpar.ts:124`, `src/app/modes/spar/useSpar.ts:219`）。
- エンジンには共有の逐次検索キューがある。レビュー effect の取消は古い状態の反映を防ぐが、開始した解析自体の取消ではない。音声のために別解析を増やすより既存レビューを利用する方が、既存の解析負荷と整合する（`src/utils/engine.ts:63`, `src/utils/engine.ts:315`, `src/app/hooks/useMoveReview.ts:14`）。

### 最小の実用的な接続点（未実装案）

判定処理や `CoachPane` の描画中から直接発話せず、`Application` が既に取得している `coach.review / reviewAt` と `session / spar` を受ける専用 hook を接続点にする（`src/app/Application.tsx:97`, `src/app/Application.tsx:143`）。現在の手のレビューが完成した時だけ、自分の実着手・末尾局面・プレビューなし・ライブ助言有効を確認し、開始局面・対象手数・USI で重複を除く。相手の応手後にも同じ自分の手が返る点と、過去棋譜の評価キャッシュ到着を区別する。

初期構成は `MoveReview.label / loss` と既存の説明根拠に対応する短い独自台詞を選ぶ方式が、静的音声資産の仕組みに適合する。現在の `reasons` 全文の任意読み上げには追加の音声生成方式が必要。動的な指し手・座標を含む説明を、そのまま既存 manifest に渡しても再生できない。

その前提として再生側には、時計・王手・終局を優先する規則、古い局面の要求破棄、同種発話の重複抑制、ミュート直後の停止、開始・待った・モード変更時の取消をまとめる必要がある。通常助言を無制限に FIFO 化すると古い助言が残るため、現在局面に有効な一件を置換する方式を検討する。これらは提案であり、実装・動作検証済み機能ではない。

### 読了範囲

以下を各 1–EOF 読了：`src/utils/voice.ts`、`src/utils/analysis.ts`、`src/utils/engine.ts`、`src/app/memory.ts`、`src/appearance/settings.ts`、`src/app/Application.tsx`、`src/app/hooks/useAnnouncements.ts`、`useBoardSession.ts`、`useMoveReview.ts`、`useEvaluation.ts`、`useAutoRate.ts`、`useMistake.ts`、`useModeSwitch.ts`、`useBoardDecor.ts`、`src/utils/mistake.ts`、`src/app/modes/spar/useSpar.ts`、`useGameClock.ts`、`src/app/panels/CoachPane.tsx`、`PanelBody.tsx`、`src/app/rail/SoundButton.tsx`、`src/app/dialogs/SettingsDialog.tsx`、`public/voice/zundamon/manifest.json`。音声素材の聴取・実ブラウザーでの割込み確認は未実施。


## Character Lab の確認結果

調査対象は https://shogimap.com/characterLab と同ページが実際にロードした公開クライアントコード。選択画面・クレジットを実ブラウザーで確認した。対局開始、LLM/TTS の生成、音声聴取は実施していない。以下の通信・再生機構は公開コードの確認結果であり、サーバー内部や実測遅延の確認ではない。

- 選択画面には四人のキャラクター、先後・開始局面の指定がある。クレジットは VOICEVOX、Live2D、AI による台詞作成を明示する。提供画像の文章は、駒の損得・持駒・形勢・直前の角移動による斜線の変化を一つのキャラクター発言にまとめている。
- クライアントは着手・王手・形勢変化等のイベント、局面由来の facts、mood、直近の台詞、既出の話題を reaction API に渡す。反応と検討用の API が分かれている。成功応答の requestId とスキーマを検証し、失敗時は原則沈黙する。挨拶・終局には固定文の経路がある。
- 応答には text / speech / intent / expression / intensity の区分がある。表示文と発音用テキストを分離し、発話単位で表情を指定できる。任意文章を無条件で TTS に渡さず、生成応答に付く ttsAuthorization を使用する経路がある。
- TTS は character と text を POST し、audio/wav を取得する。クライアントには話者＋発話内容のキャッシュ、同一要求の共有、foreground 優先の prefetch 待ち行列、AbortSignal、失敗時の制限がある。ブラウザーから capability GET が発生したことは確認したが、単純な外部 GET は forbidden。設定済みサーバーの実際の生成可否は未確認。
- WAV は WebAudio でデコード・再生する。AnalyserNode の RMS を Live2D の口開閉へ渡し、表情・字幕開始時刻・表示時間を同じ発話に接続する。字幕は時間に応じて自動スクロールし、手動操作で解除する。これは音量連動の口開閉であり、音素別 viseme の確認ではない。
- 公開コード上の実装を参考に機構を整理した。キャラクター台詞、モデル、画像、音声素材、プロンプトは流用しない。サーバーのモデル、プロンプト全体、費用、実測レイテンシ、発話の棋理精度は未検証。

公開コードの確認箇所：`https://shogimap.com/_next/static/immutable/chunks/3mqcqym_568wt.js`（イベント、反応、音声、字幕）、`https://shogimap.com/_next/static/immutable/chunks/0luj-3laa9mej.js`（話者・モデル設定）。取得時の参照用コピーは `.cache/character-lab-study/` に限定し、製品コードには取り込んでいない。

## Chess.com の確認結果

公式ヘルプと掲載画面を確認した。ログインした対局や音声再生は実施していない。公開説明で確認できる製品挙動と、未公開の生成実装を区別する。

| 体験 | 確認した挙動 | 一次資料 |
| --- | --- | --- |
| Play Coach | 着手ごとの自動助言。強さを選択。Hint はまず方針、再度押すと最善手。Undo で試し直せる。推奨手・脅威の矢印、評価値、着手分類を設定できる。 | https://support.chess.com/en/articles/10877257-how-do-i-play-against-the-coach |
| Game Review | 終局後の手ごとの説明と読み上げ。Show で意味・結果を盤上表示し、Best で改善手と比較、Retry で同じ局面を解き直す。 | https://support.chess.com/en/articles/8584089-how-does-game-review-work |
| コーチ設定 | キャラクターごとに異なる話し声。音声、励まし、リマインダー、問題の目標・誤答・ヒントを個別設定する。 | https://support.chess.com/en/articles/10812255-how-do-i-manage-the-coach |
| モバイル | 読み上げを止めても説明文は残る。実戦の結果と最善手の結果を Show で切り替えられる。 | https://support.chess.com/en/articles/10328363-how-do-i-use-game-review-on-the-app |

掲載画像では、盤面の横に顔・吹き出しを置き、対局前の強さ・色の設定と統合している。公開資料からは、Play Coach の全発言が発声されるか、固定録音と TTS の割合、言語別対応、音声待ち行列、遅延、口パク方式までは確定しない。

## このアプリへの適用判断（未実装）

採用する中心は「局面に根拠のある短い指摘」と「盤上で結果を見て試し直す導線」。キャラクター表現はその説明を伝える層にする。

1. 既存の review を一度だけ受け、対象 SFEN・手数・USI を持つ助言イベントを作る。駒・升・手順・損得の主張は盤面と解析から作り、文章生成に棋理判定を任せない。
2. 即時発話は一つの重要点に絞る。詳細は説明欄へ残す。声・字幕・矢印が同一イベントを参照し、別々の古い局面を説明しないようにする。
3. Hint → 盤上で結果を表示 → 改善手との比較 → Retry を段階的に提供する。答えを隠す学習状態では最善手・矢印を先出ししない。
4. 音声は現在局面に有効な一件を置換する。待った・新規対局・棋譜移動・モード変更・ミュートで読込中と再生中を取り消す。王手・時計・終局との優先順位を先に定義する。
5. 固定クリップは即時の短い反応に使える。座標・駒名を含む具体的説明には動的 TTS、または事前生成した組合せ可能な音声設計が必要。方式・話者・実行場所・費用は未決定。今回の調査では生成サービスを実行していない。

最初の実装対象は既存 review と音声の接続・取消制御。Live2D や長い自由会話は必要条件ではない。正確性、発話の鮮度、盤上説明との一致を先に実機検証する。


## ブラウザー内 LLM の費用・実現性

結論：API 従量課金なしの局面説明は技術的に可能。推奨する実験は WebLLM の専用 Web Worker と小型量子化モデル。推論は利用者端末で実行する。モデル配信の帯域、端末の RAM/GPU・電力、初回ダウンロードは必要であり、費用や待ち時間が完全になくなるわけではない。本調査ではモデル取得・実行・ベンチマークを実施していない。

### 実行方式

- WebLLM：WebGPU 対応ブラウザーが必要。Web Worker に推論を分離できる。初回はモデル取得、以後はキャッシュを利用する。静的配信の現在構成に追加可能で、秘密 API キーや推論用サーバーは不要。出典：https://webllm.mlc.ai/docs/user/get_started.html 、https://webllm.mlc.ai/docs/user/basic_usage.html 、https://webllm.mlc.ai/docs/user/advanced_usage.html
- Transformers.js：ONNX Runtime を使用し、WASM/CPU または WebGPU で実行できる。q4 等の量子化に対応する。CPU 経路があることは、現在の将棋エンジンと同時に快適に動くことの証明ではない。出典：https://huggingface.co/docs/transformers.js/en/index 、https://huggingface.co/docs/transformers.js/guides/webgpu
- Chrome Prompt API：ブラウザー内 Gemini Nano を利用できる。ただし公式の現時点の要件はデスクトップ中心で、Android/iOS 非対応。22GB の空き容量、GPU は4GB超の VRAM または CPU は16GB RAM・4コア以上等の条件がある。これはモデル自体のダウンロードサイズではない。特定ブラウザーに依存するため全利用者向けの基盤にはしない。出典：https://developer.chrome.com/docs/ai/prompt-api

### 小型モデル候補

WebLLM の現行 main の設定値。以下は `vram_required_MB` の宣言値で、実測値でもダウンロード容量でもない。固定リリースに同じモデルが入っているかは導入時に確認する。

| モデル（q4f16_1） | 宣言 GPU メモリー MB | 実験上の位置付け |
| --- | ---: | --- |
| Qwen3.5-0.8B | 1629.49 | 最小候補。短い言い換え精度を確認 |
| Qwen3-1.7B | 2036.66 | テキスト専用の比較基準 |
| Qwen3.5-2B | 2245.44 | 0.8B との品質・負荷比較 |
| Qwen3-4B | 3431.59 | 強い端末の比較候補 |

出典：https://github.com/mlc-ai/web-llm/blob/main/src/config.ts 。Qwen3-1.7B と Qwen3.5-0.8B の公式カードは Apache-2.0。モデルの言語対応宣言は将棋説明の正しさを保証しない。Qwen3 には非思考モードがあるため短い説明用途で比較する。出典：https://huggingface.co/Qwen/Qwen3-1.7B 、https://huggingface.co/Qwen/Qwen3.5-0.8B 。実際の量子化配布物の総転送量は未取得であり、数値を推測しない。

### 現在のコードから必要な変更

`analysis.ts` の `MoveReview` はラベル・評価・最善手・応手・PV と、翻訳済みの `reasons / bestReasons` を返す。駒・升・関係性を保持する構造化された根拠は現在の公開型にない。まず説明生成の手前で、根拠ID・対象手・駒・升・主変化・解析深さと観測種別を分離する。単なる利き検出や短い PV の駒損推定を強制手順と同一視しない。

推奨パイプライン：既存解析 → 根拠の抽出 → 小型 LLM による1–2文の表現 → 検証 → 字幕／音声。生 SFEN だけを読ませて最善手や因果関係を考えさせない。応答には根拠IDを要求し、指し手・升・駒の参照を検証する。ただし JSON の形式検証や根拠IDの一致だけでは文章の意味的正しさを保証できない。厳密な主張が必要な箇所は、コードで確定した文を保持する。

即時の事実説明は既存方式で表示し、生成が完了したら短い自然文を追加する。失敗・遅延時は既存説明を維持する。全文のトークンストリームを即座に読み上げず、検証済みの短い文を渡す。局面変更時に破棄し、同時推論は一件。局面・言語・話者・根拠とモデル版を含むキーで再利用する。

Web Worker は UI の JS 実行を分けるが、GPU や共有メモリーの競合は解消しない。3D 表示・エンジン・推論を同時に計測する必要がある。モバイルを一律対応とせず、能力確認・利用者の選択によるモデル取得・既存説明への退避を前提とする。音声合成は別の処理で、テキスト用 LLM だけでは音声は生成されない。現在の固定音声は従量費ゼロで維持できるが、任意文章の日本語音声品質・端末負荷は別途検証が必要。

### 次の実証で判定する項目

既存の実局面を使い、0.8B と1.7B/2B を同一の短い根拠入力で比較する。測定対象は初回転送・初期化、温間の最初の有効文までの遅延、全体の遅延、3Dのフレーム時間、エンジン待ち時間、メモリー、局面変更時の取消。日本語の駒名・先後・升・否定・因果、PV と強制手順の混同、根拠外の付加を人が確認する。将棋説明の正確性と実際の待ち時間が合格するまでは製品採用とはしない。
