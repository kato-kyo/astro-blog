# ADR-004: ページネーション方式

- Status: Accepted
- Date: 2026-04-18

## Context

ブログ一覧（`/blog/`）、タグ別一覧（`/tags/[tag]/`）、カテゴリ別一覧（`/categories/[category]/`）の各ページで、記事件数の増加に備えたページネーションが必要になる。
個人ブログのスケール（数十〜数百記事）では、SEO・一覧性・静的サイトとの親和性を両立する方式を選ぶ必要がある。

## Decision

静的生成（SSG）ベースのサーバー側ページネーションを採用する。

- 1 ページあたり **10 件**（`PAGE_SIZE = 10`、`lib/policies/pagination.ts` に集約）
- URL 形式: 1 ページ目は `${basePath}/`、2 ページ目以降は `${basePath}/page/[n]/`
  - 例: `/blog/`, `/blog/page/2/`, `/tags/astro/page/3/`
- SEO 用 `<link rel="canonical">` / `<link rel="prev">` / `<link rel="next">` を BaseLayout の props 経由で全ページに出力
- `Pagination.astro` は `basePath` prop で汎用化し、blog / tags / categories で同一コンポーネントを再利用

`paginate<T>()` と `buildPagePaths()` は外部 API 非依存の純粋関数として `policies/` に置き、各ページの `getStaticPaths` から呼び出す。

## Rationale

- 静的生成との親和性: ページ番号は有限かつビルド時に確定するため、`getStaticPaths` と相性が良い
- SEO: 検索エンジンがページ番号付き URL を独立ページとして正しくクロール・インデックスできる
- 共通化: `Pagination.astro` を `basePath` で汎用化することで、blog / tags / categories の 3 箇所で同じロジック・UI を共有（policies 側 14 tests でカバー）
- 日本語タグ・カテゴリも URL として percent-encode され、ルーティングがそのまま通る

## Alternatives Considered

**クライアント側ページネーション（JS で全件取得して分割）**
- Pros: 画面遷移なしで高速、URL が単一
- Cons: 初回ペイロードが記事数に比例して肥大、SEO の観点でページ単位の canonical/prev/next が出せない、JS 無効環境で破綻
- → 棄却（静的サイト・SEO 要件に不適合）

**無限スクロール**
- Pros: モバイル UX 向上
- Cons: 共有・ブックマーク不可、SEO 上の各ページ URL が存在しない、GP 風クラシック UI（右サイドバー前提）の方針にも反する
- → 棄却

**ページサイズを 20 件以上**
- Pros: ページ数が減る
- Cons: 1 ページあたりの縦長さが増え、記事カードの一覧性が落ちる
- → 10 件で固定。将来、記事数が 500 件を超える場合に再評価

## Consequences

- Pros: SEO に強い URL 構造、共通コンポーネント再利用、テスタブルな純粋関数
- Cons: ページ数が増えるとビルド時の静的ページ生成数が線形増加（数百記事までは問題なし）

## Re-evaluate when

- 記事数が 500 件を超え、ビルド時間・ページ数が運用上の負荷になった場合
- 検索・フィルタ UX の要求が強まり、クライアント側の動的な絞り込みが必要になった場合
