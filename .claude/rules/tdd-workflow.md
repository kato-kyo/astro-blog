---
paths:
  - "tests/**"
  - "src/lib/domain/**"
  - "src/lib/policies/**"
---

# TDD ワークフロー

## Red-Green-Refactor サイクル

1. **Red**: 失敗するテストを先に書く
2. **Green**: テストを通す最小限のコードを書く
3. **Refactor**: テストが通る状態を維持しながらリファクタリング

## テスト配置規約

```
tests/
├── domain/          # 型の不変条件テスト
├── policies/        # 業務ルールのユニットテスト（最重要）
└── queries/         # フィルタ・ソートロジックのテスト
```

- テストファイル名: `*.test.ts`

## テスト対象の重点化

**必須**（壊れると価値が下がるロジック）:
- `isPublished`: 公開判定（draft フラグ + 未来日付）
- `sortByPublishedDesc`: 日付ソート（タイムゾーン・同時刻の境界含む）
- `filterByTag` / `filterByCategory`: フィルタリング
- `assertUniqueSlugs`: slug 一意性検証

**任意**（コスト対効果が低い）:
- 単純な型マッピング
- Zod スキーマのバリデーション（ビルド時に Astro が検証する）

## テスト実行

```bash
pnpm test                          # 全テスト
pnpm test -- --run tests/policies/ # policies のみ
```
