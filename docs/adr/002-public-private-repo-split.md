# ADR-002: site を public、content を private リポジトリに分離

- Status: Accepted
- Date: 2026-04-11

## Context

ブログのソースコードはポートフォリオとして公開したい。一方、記事本文・下書き・個人情報を含むコンテンツは非公開にすべきである。

## Decision

site（ブログ基盤）を public リポジトリ、content（記事・著者情報等）を private リポジトリとして分離する。

- public repo: 設計・コード・テスト・ADR が全て閲覧可能
- private repo: 記事本文・下書き・著者詳細情報を保護
- public repo にはサンプル記事（`content/sample/`）を少数同梱し、UI・タグ・検索の動作を可視化する

## Rationale

- 「コード公開・コンテンツ非公開」は実務的な構成として評価されやすい
- 下書き記事や個人情報の漏洩リスクを排除できる
- コンテンツとコードの関心分離が明確になる
- 将来の CMS 移行時に content の差し替えが容易

## Alternatives Considered

**単一 public リポジトリ（コンテンツも公開）**
- Pros: 構成が最もシンプル
- Cons: 下書き・個人情報の管理に注意が必要
- → 棄却（下書き漏洩リスク）

**単一 private リポジトリ**
- Pros: シンプル、漏洩リスクなし
- Cons: ポートフォリオとして機能しない
- → 棄却（主目的に反する）

## Consequences

- Pros: ポートフォリオ公開とコンテンツ保護を両立
- Cons: リポジトリ間の連携が必要（→ ADR-003 で解決）

## Maintenance conditions

- 維持条件: 連携設定が単純で、ビルド時間増加が軽微
- 撤退条件: 参照経路の複雑化、CI 遅延、ローカル開発体験の悪化
