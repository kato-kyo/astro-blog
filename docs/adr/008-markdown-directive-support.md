# ADR-008: Markdown ディレクティブ記法（Zenn / Qiita 互換）対応

- Status: Accepted
- Date: 2026-04-18

## Context

zenn-pub から移行した記事の本文には `:::message`・`:::details` といったコンテナディレクティブ記法が多数含まれる。
将来的には Qiita からの記事追加も想定しており、Qiita の `:::note` を含めて同じ `:::` 記法の構文を再利用できるようにしておきたい。

一方、Astro 6 の Markdown パイプラインは remark / rehype ベースで構築されている（`astro.config.ts` の `markdown.remarkPlugins` / `markdown.rehypePlugins`）。
Zenn 公式の `zenn-markdown-html` は markdown-it 系のランタイムで、Astro の remark パイプラインに直接組み込めない。

- 記法の例:
  - `:::message` / `:::message alert` — 情報 / 警告 callout
  - `:::note warn` — Qiita の警告 callout
  - `:::details ラベル` — 折りたたみブロック
- 24 記事中、この記法を含む記事が複数あり、記事側を全部書き換える方針は保守性が低い

## Decision

**remark-directive（公式 remark プラグイン）+ 自作 handler** で 3 ディレクティブを Zenn / Qiita 両対応で解釈する。

- 依存: `remark-directive@4.0.0`（`mdast-util-directive` / `@types/mdast` / `@types/unist` を間接的に利用）
- 自作プラグイン: `src/lib/markdown/directives.ts` の `remarkZennQiitaDirectives`
  - `remark-directive` → `remarkZennQiitaDirectives` の順に `astro.config.ts` の `remarkPlugins` に登録
- サポートするディレクティブ:
  - `:::message` / `:::message alert` / `:::message{kind=warn}` → `<aside class="msg msg-{info|warn|alert}">`
  - `:::note` / `:::note warn` / `:::note alert`（Qiita 互換） → `<aside class="msg msg-{info|warn|alert}">`
  - `:::details[ラベル]` → `<details class="callout"><summary>ラベル</summary>…</details>`
- kind 解決の優先順: `attributes.kind / level / type` → name 空白 rest（`:::message alert`） → directive label（`:::message[alert]`） → `"info"` フォールバック
- ラベル解決の優先順（`:::details`）: directive label（`:::details[ラベル]`） → `attributes.summary` → name 空白 rest（`:::details ラベル`） → `"Details"` フォールバック
- スタイルは `src/styles/global.css` の `.msg` / `details.callout` セクションに自作（GP 風デザイントークン `--color-border` / `--color-bg-secondary` / `--color-accent` に準拠。`zenn-content-css` は採用しない）
- ラベル付き `:::details` は **`:::details[ラベル]` 形式を正とする**。`:::details ラベル`（空白区切り）は remark-directive が name フィールドに「details ラベル」を取り込んでしまい正規認識されないため、記事側を `[…]` 形式に書き換える（T9.3 で実施済み）

## Rationale

- **remark-directive は公式プラグイン**で、コンテナディレクティブ記法（`:::name[label]{attrs}`）を mdast の `containerDirective` ノードとして AST 化してくれる。自作プラグインは `hName` / `hProperties` を差し込むだけで済み、hast 変換ロジックを自前で書かずに済む
- **Zenn / Qiita 構文の共通化**: `:::message` と `:::note` は kind 指定の語彙がほぼ同じ（`alert` / `warn` / `info`）。1 つの handler で両方を吸収することで、将来 Qiita 記事を追加しても追加実装が不要
- **記事側の書き換え最小化**: kind が name 空白 rest に残る Zenn 記法（`:::message alert`）も handler 側でフォールバック解析するため、記事を書き換えずに正しい class が付与される。書き換え必須なのは `:::details ラベル`（空白区切り）のみ
- **デザイン統一**: CSS は既存の GP 風トークン（`--color-border` 等）を使って自作する。`zenn-content-css` を取り込むとライセンス・デザイン方針の両面で衝突する
- **テスト容易性**: `remarkZennQiitaDirectives` は純粋な AST 変換関数として書け、mdast ノードを入力 → 出力で検証できる（T9.1 で 10 unit tests 追加）

## Alternatives Considered

**A. `zenn-markdown-html` を Astro に組み込む**
- Pros: Zenn の CSS・記法に完全追従できる
- Cons: markdown-it 系ランタイムであり、Astro の remark / rehype パイプライン（Shiki ハイライト、rehype-slug、rehype-autolink-headings）と二重経路になる。統合コスト高
- → 棄却

**B. 記事側で `:::` を `<aside>` 等に手書き書き換え**
- Pros: 追加プラグイン不要、ビルドがシンプル
- Cons: 将来の記事投入のたびに変換作業が発生。submodule（private content repo）側の運用負担が永続的に増える
- → 棄却

**C. Qiita と Zenn をそれぞれ別 handler で処理**
- Pros: 構文差分が将来拡がった場合に分離しやすい
- Cons: 現時点では `:::message` と `:::note` の構文差は kind 指定の語彙だけで、実質共通化できる。二重実装はコスト過多
- → 棄却（共通 handler に統合）

**D. CSS を `zenn-content-css` から丸ごと import**
- Pros: 見た目が Zenn と完全に一致
- Cons: GP 風クラシック UI の方針（ADR-007 のデザイン文脈）と衝突。ライセンス管理も追加発生
- → 棄却

## Consequences

- Pros:
  - Zenn / Qiita の大半の記事を最小修正で取り込める
  - CSS は既存デザイントークンで統一感を保てる
  - handler は純粋関数で 10 unit tests によりデグレを検出しやすい
- Cons:
  - 数式（`$$…$$`） / URL カード（`@[card](url)`） / 画像サイズ指定（`![alt](url =WxH)`）は未対応
    - 数式は T9.6 で `remark-math` + `rehype-katex` の導入を optional 判断
    - URL カード / 画像サイズ指定は該当記事数に応じて将来再評価
  - 記事側で `:::details ラベル` → `:::details[ラベル]` の書き換えが必要（T9.3 で実施済み。24 記事中 1 記事 3 箇所）
  - `remark-directive` という新規依存が増える（Wave 1 で D 軸として認識済み）

## Re-evaluate when

- 未対応記法（数式 / URL カード / 画像サイズ指定）を使う記事が増えた場合
  - 該当件数が少ないうちは記事側で代替表現（通常の画像・リンク）で回避、増えた段階で remark プラグインの追加導入を検討
- Zenn / Qiita 以外のプラットフォーム（Scrapbox, Hatena 等）からの移行が必要になった場合
  - 別 handler に分離するか、共通 handler の拡張で吸収するかを再判断
