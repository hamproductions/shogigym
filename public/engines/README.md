# AIモデル

探索部はやねうら王です。モデルごとに対応するアーキテクチャとFV_SCALEを使います。「新規対局」と形勢パネルの「検討の設定・ファイル」で、先手・後手それぞれのモデルを選べます。対局と検討は同じ設定を共有し、手番側のモデルで探索します。「設定」の「対局とAI」も同じ設定を使います。自分のHalfKPファイルを読み込む機能と、従来のK-P・Fairy-Stockfishも残しています。

| モデル | アーキテクチャ | FV_SCALE |
| --- | --- | --- |
| mini | SFNN_ka2_4096_8_64_progress8 | 24 |
| micro | SFNN_ka2_2048_8_64_progress8 | 24 |
| 水匠5 | HalfKP_256x2-32-32 | 24 |
| tanuki- Háo | HalfKP_256x2-32-32 | 20 |
| tanuki- Lí | HalfKP_1024x2-8-32 | 20 |
| AobaNNUE | HalfKP_768x2-16-64 | 40 |

mini・microの評価関数はMIT、追加した4モデルと探索部はGPLv3です。mini・microの許諾文は `LICENSE.models.txt`、GPLv3全文は `LICENSE.engine.txt` にあります。対応する探索部の完全なソースは `yaneuraou-source.tar.gz` に同梱しています。

追加モデルは選択時だけ取得し、SHA-256で検証してブラウザに保存します。約61.2MiBの水匠5・Háo、約183.7MiBのAobaNNUE、約244.9MiBのLíを初回起動時にまとめて取得しません。保存済みのモデルはネットワークなしでも読み込めます。取得の取り消し・失敗では前のモデルを保持します。mini・microは従来どおり軽量な同梱モデルです。

大きな評価関数は `models/<id>/nn.bin.000` から32MiBずつに分割しています。番号順に連結すると公式配布の `nn.bin` と同じバイト列になります。`src/utils/engineModels.json` にサイズと各部分のSHA-256があります。再配布上のファイルサイズ制限を避けるための分割で、評価関数自体は変更していません。

モデルの設定を対局用・検討用に分離しません。モバイルの形勢パネルでは結果を先に表示し、設定は44px以上の操作領域で展開します。大きなモデルの保存が完了するまで選択は確定せず、取り消し・失敗では直前の設定を保ちます。

## 入手元

- [公式配布記事](https://yaneurao.fanbox.cc/posts/12761272)
- [mini](https://storage.yaneu.com/yaneuraou/TuyouraOu11mini-SFNN_ka2_4096_8_64_progress8-epoch0010-20261003.7z)
- [micro](https://storage.yaneu.com/yaneuraou/TuyouraOu11micro-SFNN_ka2_2048_8_64_progress8-epoch0010-20261001.7z)
- [探索部のソース](https://github.com/yaneurao/YaneuraOu/tree/3a0e4fd2394e40f72fc6e2ad5aada832b4045cd9)
- [水匠5：たややん氏提供・公式配布](https://github.com/yaneurao/YaneuraOu/releases/tag/suisho5)
- [水匠5単体公開の説明](https://yaneuraou.yaneu.com/2024/06/23/suisho10-beta/)
- [Háo：nodchip氏・GPLv3許諾文を同梱](https://github.com/nodchip/tanuki-/releases/tag/tanuki-.halfkp_256x2-32-32.2023-05-08)
- [Lí：nodchip氏・GPLv3許諾文を同梱](https://github.com/nodchip/tanuki-/releases/tag/tanuki-wcsc33-2023-05-04)
- [AobaNNUE：山下宏氏・v1.1公式配布](https://github.com/yssaya/AobaNNUE/releases/tag/v1.1)
- [AobaNNUEの評価関数もGPLv3であるとの作者回答：2026年9月27日](http://www.yss-aya.com/bbs/patio.cgi?read=210&ukey=0)

上記のモデル名は各作者の評価関数を示します。各作者が配布する独自の探索部そのものを移植したという意味ではありません。探索部は同梱ソースからビルドしたやねうら王です。

## 再ビルド

Emscripten 6.0.13、Python 3、make、Node.jsを使います。上記ソースを指定コミットでチェックアウトし、公式アーカイブの全ファイルをそれぞれ `<models>/mini` と `<models>/micro` に展開します。リポジトリルートから実行します。

```sh
DO_NOT_TRACK=1 node scripts/build-tsuyoura.mjs <YaneuraOu checkout> <models> <em++ path>
```

追加モデル用の3アーキテクチャをビルドする場合は、最後に `halfkp,li,aoba` を指定します。水匠5とHáoは同じHalfKP256エンジンを共有します。

```sh
DO_NOT_TRACK=1 node scripts/build-tsuyoura.mjs <YaneuraOu checkout> <models> <em++ path> halfkp,li,aoba
DO_NOT_TRACK=1 node scripts/prepare-engine-models.mjs <models>
```

`<models>` の配置は、水匠5が `suisho5/nn.bin`、Háoが `hao/eval/nn.bin`、Líが `li/eval/nn.bin`、AobaNNUEが `aoba/AobaNNUE/eval/nn.bin` です。公式アーカイブから展開したファイルを使います。

USIコマンドを専用のスレッドで順番に処理する変更を加えています。ブラウザのメインスレッドを探索スレッドとの同期待ちで停止させないためです。変更は `scripts/tsuyoura-command-worker.patch` にあります。同梱ソースにも適用済みです。

ビルド時にSIMD、pthread、探索用4ワーカーとコマンド用1ワーカー、8MiBスタック、動的メモリ拡張を指定しています。ビルドの並列数は2です。mini・microの `nn.bin` と `progress.bin` は選択したモデルのみ読み込み、FV_SCALEは24に固定します。追加モデルのFV_SCALEは上表の値です。
