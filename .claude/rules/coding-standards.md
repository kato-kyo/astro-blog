# コーディング規約

## 命名規約

| 対象 | 規約 | 例 |
|------|------|----|
| TS ファイル | camelCase | `posts.ts` |
| コンポーネント | PascalCase | `PostCard.tsx`, `BlogLayout.astro` |
| テスト | camelCase + `.test.ts` | `publish.test.ts` |
| Markdown | kebab-case | `my-first-post.md` |
| 型名 | PascalCase | `Post`, `Tag` |
| 関数名 | camelCase | `isPublished`, `filterByTag` |
| 定数 | UPPER_SNAKE_CASE | `MAX_POSTS_PER_PAGE` |

## TypeScript

- `type` を優先し、`interface` は実装を要求する場合のみ
- `any` 禁止。`unknown` を使い型ガードで絞り込む
- domain/ では class を使わず、型 + 関数の関数型スタイル
- Zod は `astro/zod` から import
