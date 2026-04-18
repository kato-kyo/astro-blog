# ADR-006: 全文検索に Pagefind を採用

- Status: Accepted
- Date: 2026-04-18

## Context

技術ブログとして、記事数が増えたときの回遊性を担保するため全文検索機能が必要になる。
静的サイト（SSG）・個人運用・Cloudflare Pages デプロイという前提の下、以下を満たす選択肢を比較した。

- ビルド時に index を生成し、ランタイム依存を最小にしたい
- JP/EN 混在の技術記事で動作すること
- 運用コスト（課金・API 管理）を最小化したい
- ページ単位の遅延読み込みで初回ペイロードを圧迫しないこと

## Decision

**Pagefind** を採用する。

- 依存: `pagefind@1.5.2` を devDependency として追加
- ビルド: `astro build && pagefind --site dist` の順に連結し、`dist/pagefind/` に index を出力
- UI: 自作 React モーダル（`Search.tsx`、`client:idle`、Ctrl+K / Esc で開閉）
- 読み込み: Pagefind ランタイムをモーダルオープン時に**動的 import**し、初回表示には影響させない
- 検証: スモークテスト（`tests/smoke/`）で `dist/pagefind/` の生成物 4 件を検証

## Comparison

| 方式 | 静的サイト親和性 | index サイズ | 多言語対応 | 運用コスト | 判定 |
|------|:-:|:-:|:-:|:-:|:-:|
| **Pagefind** | ◎ | ◎（遅延ロード） | ◎（日英混在 OK） | ○（追加費用なし） | **採用** |
| Algolia | ○ | — | ◎ | △（無料枠 + API 管理） | 棄却 |
| Lunr.js | ○ | △（全件 JSON） | △（日本語は工夫要） | ◎ | 棄却 |
| FlexSearch | ○ | △ | △ | ◎ | 棄却 |

## Rationale

- **静的サイトとの親和性**: ビルド後の `dist/` を解析して index を生成するため、ソース側に検索用のメタ出力を仕込む必要がない
- **遅延読み込みに適した index**: サイト全体の index を単一 JSON で配らず、ページ/シャード単位に分割するため、初回ペイロードを抑えたまま高速検索できる
- **多言語対応**: 日本語を含む記事でも追加設定なしで動作することを確認
- **運用コストゼロ**: サードパーティ API / 課金不要。Cloudflare Pages の静的配信に完結
- **UI 独立性**: ランタイムは JS API として呼べるため、既存のデザインシステム（GP 風、右サイドバー）に合わせた自作モーダルを載せられる

## Alternatives Considered

**Algolia（SaaS 検索）**
- Pros: 高速、関連度ランキングが強い、管理画面が便利
- Cons: 無料枠超過時の課金、API キー管理、index 同期ジョブが必要、ポートフォリオとして「外部依存で解決した」印象
- → 棄却（個人ブログにはオーバースペック）

**Lunr.js**
- Pros: 完全クライアント、シンプル
- Cons: index を全件 JSON として配布するため記事数に比例して初回ロード肥大、日本語は tokenizer の工夫が必要
- → 棄却（スケール時に破綻）

**FlexSearch**
- Pros: 高速、軽量
- Cons: index の分割配信が Pagefind ほど洗練されていない、日本語対応に追加実装が必要
- → 棄却

## Consequences

- Pros: 追加コスト 0、初回ペイロード影響なし、日本語対応、静的デプロイと整合
- Cons: ビルドに 1 ステップ（`pagefind --site dist`）追加。CI のビルド時間が微増

## Re-evaluate when

- 記事数が 1,000 件超に到達し、Pagefind の index 生成時間が無視できなくなった場合
- 検索結果の関連度ランキングに不満が出て、ML ベースの検索品質が必要になった場合
- → Algolia など SaaS への移行を検討
