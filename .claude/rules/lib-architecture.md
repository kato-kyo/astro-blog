---
paths:
  - "src/lib/**"
---

# lib/ 3層アーキテクチャルール

DDD の思考を残しつつ、個人ブログのスケールに合わせて3層に縮約した構成。
判断根拠は docs/adr/001-three-layer-architecture.md を参照。

## 構成

```
src/lib/
├── domain/      # 型定義・不変条件
├── policies/    # 業務ルール（純粋関数）
├── queries/     # データ取得・フィルタ・ソート
└── index.ts     # 公開 API の re-export
```

## domain/ — 型定義・不変条件

- **外部依存を持たない**純粋な TypeScript 型・関数
- Astro, React, Zod, Node.js API を一切 import しない
- 型定義: `Post`, `Tag`, `Project` 等
- 不変条件の検証: `assertUniqueSlugs` 等
- class を使わず、型 + 関数の関数型スタイル

## policies/ — 業務ルール

- 外部依存なし。純粋関数のみ
- 公開判定（`isPublished`）、日付計算等のビジネスロジック
- テスト必須（Red-Green-Refactor）

## queries/ — データ取得・フィルタ・ソート

- Astro Content Collections API（`getCollection`, `getEntry`, `render`）を使用する**唯一の場所**
- フィルタリング、ソート、集計のロジック
- Zod スキーマは `content.config.ts` に定義（ここでは import しない）

## 依存方向

```
pages/layouts/components → lib/queries/ → lib/policies/ → lib/domain/
                           （Astro API依存）  （純粋関数）    （純粋型）
```

- pages/components から domain/policies を直接参照してもよい（型の利用等）
- queries/ 以外から `astro:content` を import しない

## 禁止パターン

```typescript
// NG: domain が Astro に依存
import { getCollection } from "astro:content"; // domain/ で使用禁止

// NG: domain が Zod に依存
import { z } from "astro/zod"; // domain/ で使用禁止

// NG: pages から直接 astro:content を呼ぶ（queries/ を経由する）
// pages/blog/[slug].astro
import { getEntry } from "astro:content"; // → queries/posts.ts 経由にする
```
