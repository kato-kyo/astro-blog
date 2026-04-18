---
paths:
  - "src/**/*.astro"
  - "src/**/*.tsx"
  - "src/**/*.ts"
  - "astro.config.ts"
---

# Astro 固有規約

## Astro コンポーネント

- Props は `type Props = { ... }` で定義し、frontmatter セクションで分割代入
- レイアウトは `src/layouts/` に配置
- ページは `src/pages/` に配置（Astro のルーティングに対応）

## React コンポーネント

- インタラクティブ要素にのみ使用する。静的コンテンツは Astro コンポーネント優先
- `client:*` ディレクティブを必ず指定（`client:load`, `client:idle`, `client:visible`）
- Props 型を必ず明示する
- ファイル拡張子は `.tsx`

## ページルーティング

| パス | ファイル |
|------|--------|
| `/` | `src/pages/index.astro` |
| `/blog/` | `src/pages/blog/index.astro` |
| `/blog/[slug]/` | `src/pages/blog/[slug].astro` |
| `/tags/` | `src/pages/tags/index.astro` |
| `/tags/[tag]/` | `src/pages/tags/[tag].astro` |
| `/categories/` | `src/pages/categories/index.astro` |
| `/categories/[category]/` | `src/pages/categories/[category].astro` |
| `/about/` | `src/pages/about.astro` |
| `/projects/` | `src/pages/projects/index.astro` |

## データ取得

- ページからは `lib/queries/` 経由でデータを取得する
- `astro:content` を直接 import しない（queries/ に集約）

## ビルドモード

- Static (SSG) がデフォルト
- `getStaticPaths` で動的ルートを生成
