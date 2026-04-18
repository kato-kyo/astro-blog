# ADR-001: DDD 4層ではなく3層構成を採用

- Status: Accepted
- Date: 2026-04-11

## Context

個人事業主（SWE）が一人で運用する技術ブログを構築する。
DDD 4層（domain / application / infrastructure / presentation）+ Repository パターンを検討し、フィジビリティ検証で技術的に実現可能であることを確認した。

しかし、ブログのソースコード自体がポートフォリオとして機能するため、「DDD を知っている」ことではなく「スケールに応じた適切な設計判断ができる」ことを示す必要がある。

## Decision

DDD 4層ではなく、3層構成を採用する。

```
src/lib/
├── domain/      # 型定義・不変条件（純粋 TS、外部依存なし）
├── policies/    # 業務ルール（純粋関数）
└── queries/     # データ取得・フィルタ・ソート（Astro API 依存はここだけ）
```

DDD の思考（ユビキタス言語としての型定義、ビジネスルールの分離）は残しつつ、形式的なレイヤー分離（Repository インターフェース、Application ユースケースクラス等）は省略する。

## Rationale

- データソースが Astro Content Collections 1つのみ。Repository 抽象化の実効性が低い
- 個人運用のため、変更1件あたりの編集点削減が開発速度に直結する
- ドメインロジック（公開判定・フィルタ・ソート）は `lib/` の純粋関数で十分にテスト可能
- 過剰設計はポートフォリオとして「適用判断力の欠如」と映るリスクがある

## Alternatives Considered

**DDD 4層 + Repository パターン**
- Pros: 拡張性が高い、DDD の教科書的実装を示せる
- Cons: 個人ブログのスケールに対して変更コストが増大、過剰設計に見える
- → 棄却

**フラットな `lib/` に全て配置**
- Pros: 最もシンプル
- Cons: 責務の境界が曖昧になり、肥大化時にリファクタリングが必要
- → domain/policies/queries の3分割で回避

## Consequences

- Pros: 実装コスト削減、判断力を示せる、テスタビリティ維持
- Cons: 将来複雑化時に再分割が必要

## Re-evaluate when

- 外部 API 統合が2つ以上（CMS、検索サービス等）
- 非同期ワークフロー導入（予約投稿のキュー処理等）
- 権限制御の複雑化（複数著者による共同編集等）
