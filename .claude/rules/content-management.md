---
paths:
  - "content/**"
  - "src/content.config.ts"
---

# コンテンツ管理ルール

`content/` は git submodule（private repo）。実データはここに集約する。

ローカル開発で submodule をまだ取得していない場合のみ、代替ディレクトリを
`CONTENT_ROOT` 環境変数で指すことができる。その代替ディレクトリは public repo に
含めない（gitignore 済み）。

## Frontmatter 必須フィールド

```yaml
---
title: string          # 必須
description: string    # 必須
publishedAt: date      # 必須
updatedAt: date        # 任意（本文変更時のみ更新）
tags: string[]         # 必須
category: string       # 必須
author: string         # 必須（authors の ID）
draft: boolean         # 任意（default: false）
heroImage: string      # 任意
---
```

## ディレクトリ規約

```
content/                       # git submodule (private)
├── config/
│   └── site.json              # サイトメタ情報（id: "default" の 1 エントリ）
├── blog/
│   └── my-first-post.md       # ファイル名 = スラッグ
├── pages/
│   ├── about.md               # 固定ページ
│   └── services.md
├── authors/
│   └── authors.json           # 配列形式 [{ "id": "...", ... }]
└── projects/                  # ポートフォリオ実績
    └── *.md
```

## Content Collections 設定

```typescript
// src/content.config.ts
import { z } from "astro/zod";  // ← "zod" ではなく "astro/zod"

const contentRoot = process.env.CONTENT_ROOT?.trim() || "./content";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: `${contentRoot}/blog` }),
  schema: z.object({ /* ... */ }),
});
```

- Zod は必ず `astro/zod` から import
- `base` は `${contentRoot}/...`（デフォルト `./content/...`、submodule ディレクトリ）
- authors.json は配列形式（file() loader の仕様）

## Markdown / GFM

- Astro はデフォルトで GFM を適用（テーブル、タスクリスト、取り消し線、脚注）
- コードブロックの構文ハイライトは Shiki 4（Astro 6 内蔵）
- 見出しアンカーは rehype-slug + rehype-autolink-headings で自動生成
