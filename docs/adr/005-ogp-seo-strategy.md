# ADR-005: OGP / メタタグ設計

- Status: Accepted
- Date: 2026-04-18

## Context

技術ブログとして SNS でのシェア体験と検索エンジンへの正確なメタ情報提供が必要になる。
一方、個人運用のため、各ページで OGP タグを個別に組み立てる冗長さは避けたい。
さらに、現時点ではデフォルト OGP 画像を持たないため、画像の扱いを将来拡張可能な形で設計する必要がある。

## Decision

OGP / Twitter Card / article 系メタタグの生成を `BaseLayout.astro` に集約する。

- BaseLayout の props として以下を受け取り、head 内で一括出力:
  - `title`, `description`, `canonical`, `prev`, `next`
  - `image?`（省略可。将来のデフォルト画像導入に備えた任意 prop）
  - `type`（`website` / `article`）と article 用の `publishedTime` / `modifiedTime` / `tags`
- 各ページは必要な値を props で渡すだけで、OGP・Twitter Card・article 系が統一的に出力される
- **現状はデフォルト画像なし**で、`image` が未指定の場合は `og:image` / `twitter:image` を出力しない
  - Twitter Card は画像がない場合 `summary`、ある場合 `summary_large_image` を切替
- canonical / prev / next も同じ props から出力し、ページネーションの SEO 要件（ADR-004）と統合

## Rationale

- **Single Source of Truth**: メタタグ生成ロジックを BaseLayout 1 箇所に置くことで、漏れ・ズレを防ぐ
- **段階的拡張**: `image?` を optional prop として用意することで、将来デフォルト OGP 画像を導入する際に呼び出し側の変更を最小化
- **不完全な画像タグの回避**: 存在しない画像 URL を出すよりは、画像タグ自体を出さない方が SNS プレビューとして適切
- **検証可能性**: dist の HTML をスモークテスト（T2.5）で検証可能。T3.3 完了時点で OGP の skip を解除

## Alternatives Considered

**各ページで個別に meta タグを書く**
- Pros: ページごとの柔軟性が最大
- Cons: 重複が大量発生、追加・変更時の修正漏れリスク、ポートフォリオとして質が低い
- → 棄却

**専用コンポーネント `<Seo>` を別ファイルで提供**
- Pros: BaseLayout を肥大化させない
- Cons: 2 箇所（BaseLayout と Seo）で props を受け渡すボイラープレートが増える。現時点では BaseLayout に集約する方がシンプル
- → 将来 BaseLayout が肥大化した段階で切り出しを再検討

**デフォルト OGP 画像をプレースホルダで仮置き**
- Pros: SNS プレビューで画像が必ず出る
- Cons: 内容と無関係な画像が一貫して表示されるのは UX として悪い。プレースホルダ画像をメンテナンスする負担も発生
- → 棄却。実画像を用意できるタイミングまで未出力を維持

## Consequences

- Pros: メタタグ生成の一元化、段階的に画像対応を追加できる、canonical/prev/next と統合
- Cons: 現状は SNS プレビュー時に画像が出ない（画像素材確保後に `image` prop で解消予定）

## Re-evaluate when

- デフォルト OGP 画像（ブランドロゴ / 自動生成サムネ等）を導入する段階
- BaseLayout の props が 10 個を超え、可読性が落ちた場合 → `<Seo>` コンポーネントへの切り出し
