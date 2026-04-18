---
paths:
  - "content/**"
  - "src/content.config.ts"
---

# コンテンツ管理ルール

content/ は git submodule（private repo）。content-sample/ はサンプル記事で submodule 外（public repo 同梱）。

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
├── blog/
│   └── my-first-post.md       # ファイル名 = スラッグ
├── pages/
│   ├── about.md               # 固定ページ
│   └── services.md
├── authors/
│   └── authors.json           # 配列形式 [{ "id": "...", ... }]
└── projects/                  # ポートフォリオ実績
    └── *.md

content-sample/                # submodule 外 (public)
├── blog/
│   └── hello-world.md
└── authors/
    └── authors.json
```

## Content Collections 設定

```typescript
// src/content.config.ts
import { z } from "astro/zod";  // ← "zod" ではなく "astro/zod"

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/blog" }),
  schema: z.object({ /* ... */ }),
});
```

- Zod は必ず `astro/zod` から import
- `base` は `./content/...`（submodule ディレクトリへの相対パス）
- authors.json は配列形式（file() loader の仕様）

## Markdown / GFM

- Astro はデフォルトで GFM を適用（テーブル、タスクリスト、取り消し線、脚注）
- コードブロックの構文ハイライトは Shiki 4（Astro 6 内蔵）
- 見出しアンカーは rehype-slug + rehype-autolink-headings で自動生成

## サポートする記法（Zenn / Qiita 互換ディレクティブ）

詳細は `docs/adr/008-markdown-directive-support.md` を参照。
`remark-directive` + 自作 `remarkZennQiitaDirectives`（`src/lib/markdown/directives.ts`）で、
以下の 3 ディレクティブを解釈し、`src/styles/global.css` のスタイルを当てる。

### 通知系 callout

`:::message` / `:::note`（Qiita 互換）は `<aside class="msg msg-{kind}">` に展開される。

| 記法 | 解釈 | 出力 class |
|------|------|-----------|
| `:::message` | info | `.msg .msg-info` |
| `:::message alert` | alert（Zenn 互換の name 空白記法） | `.msg .msg-alert` |
| `:::message{kind=warn}` | warn（属性指定） | `.msg .msg-warn` |
| `:::note` | info | `.msg .msg-info` |
| `:::note warn` | warn（Qiita 互換） | `.msg .msg-warn` |
| `:::note alert` | alert | `.msg .msg-alert` |

kind の正規化:

- `alert` / `danger` / `error` → `alert`
- `warn` / `warning` / `caution` → `warn`
- `info` / `note` / `tip` / 未指定 → `info`

### 折りたたみ（details）

`:::details[ラベル]` は `<details class="callout"><summary>ラベル</summary>…</details>` に展開される。

- **ラベル指定は `[…]` 形式が必須**。`:::details ラベル`（空白区切り）は
  remark-directive が name フィールドに「details ラベル」を取り込んでしまい
  正規認識されないため NG。記事側で必ず `:::details[ラベル]` に書き換えること
- ラベル省略時は `"Details"` がフォールバック表示される

```markdown
:::details[実行計画の詳細]
本文…
:::
```

### 未対応の記法

以下は現状の handler では処理しない。該当記事が少ないうちは通常の Markdown 記法で代替し、
件数が増えた段階で remark プラグイン追加を検討する（将来 T9.6 等で再判断）。

- 数式: `$$…$$` / `$…$`（`remark-math` + `rehype-katex` 未導入）
- URL カード: `@[card](url)` 形式
- 画像サイズ指定: `![alt](url =WxH)` 形式

### 記事執筆時の注意

- `:::message` / `:::note` の kind 指定は表記ゆれを handler 側で吸収するが、
  既存記事との統一のため **Zenn 系記事は `:::message alert`**、
  **Qiita 系記事は `:::note warn`** のように移行元の慣習を残してよい
- 新規記事で折りたたみを使う場合は `:::details[ラベル]` の括弧記法で書くこと
