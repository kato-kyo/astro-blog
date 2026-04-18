# フィジビリティ検証結果

要件定義と設計判断の前提として、主要な技術選択が実現可能かを Astro プロジェクトの試作で検証した記録。

**検証日**: 2026-04-11
**検証の意義**: 後段の設計判断（ADR-001〜003、デザイン方針）は、ここで確認した「実現可能である」事実に立脚している。

## 検証環境

| 項目 | バージョン |
|------|-----------|
| Node.js | v22.18.0 |
| pnpm | 10.11.0 |
| Astro | 6.1.5 |
| @astrojs/react | 5.0.3 |
| @astrojs/mdx | 5.0.3 |
| React | 19.2.5 |
| TypeScript | 6.0.2 |
| Vitest | 4.1.4 |
| remark-gfm | 4.0.1 |
| rehype-slug | 6.0.0 |
| rehype-autolink-headings | 7.1.0 |

## 検証項目と結果

### 1. Astro Content Collections で外部ディレクトリを参照できるか

**結果: 実現可能**

Astro の `glob()` loader の `base` パラメータに相対パスを指定することで、プロジェクト外（親ディレクトリ配下）の Markdown を読み込めることを確認した。

```typescript
// src/content.config.ts (実装時の想定)
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./content/blog",    // submodule 配置時
    // または "./content-sample/blog" (submodule 未接続時のフォールバック)
  }),
  schema: z.object({ /* ... */ }),
});
```

**確認内容:**
- `npx astro build` が成功し、外部ディレクトリの Markdown が正常にビルドされた
- `file()` loader でも同様に外部 JSON ファイルを参照可能
- 相対パス参照のみで動作（pnpm workspace / symlink 不要）

**実際の採用構成**（ADR-003 参照）:
- `content/` は git submodule として public repo のルート直下に配置される
- `./content/blog/` のような相対パスで参照するため、submodule の内部構造がそのまま見える
- `content-sample/` は submodule 未取得環境でもデザイン確認できるように public 同梱

**注意点:**
- `file()` loader で JSON を読み込む場合、単一オブジェクトはキーがエントリ ID として解釈される → **配列形式 `[{ "id": "...", ... }]` を使用する**

### 2. GitHub Flavored Markdown (GFM) サポート

**結果: 実現可能（デフォルト対応 + プラグイン拡張）**

Astro はデフォルトで GFM と SmartyPants を適用する。追加プラグインと合わせて全機能をカバーすることを確認した。

| GFM 機能 | 対応状況 | 生成HTML |
|----------|---------|----------|
| テーブル | デフォルト対応 | `<table>` 正常生成 |
| タスクリスト | デフォルト対応 | `<input type="checkbox">` 正常生成 |
| 取り消し線 | デフォルト対応 | `<del>` 正常生成 |
| オートリンク | デフォルト対応 | 確認済み |
| 脚注 | デフォルト対応 | `<section data-footnotes>` 正常生成、バックリファレンス付き |
| コード構文ハイライト | Shiki 4 (内蔵) | TypeScript のハイライトが正常動作 |
| 見出しアンカー | rehype-slug + rehype-autolink-headings | 日本語見出しのスラッグ生成も正常 |

**設定:**
```typescript
// astro.config.ts
export default defineConfig({
  markdown: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "append" }],
    ],
  },
});
```

### 3. ドメイン層を Astro から独立させられるか

**結果: 実現可能**

ドメインロジックを Astro/React に依存しない純粋な TypeScript モジュールとして構成し、Vitest で独立にテスト可能であることを確認した。

**検証内容:**
- `Tag` 値オブジェクト: 生成、スラッグ変換、等価性比較
- `Post` の公開判定、日付ソート、タグ/カテゴリフィルタリング
- 全ロジックが Astro ランタイムに依存せず純粋関数として動作

**採用した実装方針**（ADR-001 参照）:
DDD 4層ではなく、個人ブログのスケールに合わせた 3層構成を採用:

```
src/lib/
├── domain/     → 型定義・不変条件。外部依存ゼロ。Vitest でユニットテスト可能
├── policies/   → 業務ルール（公開判定等）。純粋関数
└── queries/    → Astro Content Collections API のラップ。Zod スキーマ依存はここのみ
```

### 4. TDD（テスト駆動開発）の実行性

**結果: 実現可能**

Vitest がドメイン層の TypeScript コードを問題なくテスト実行できることを確認した。

**検証結果:**
```
 Test Files  2 passed (2)
      Tests  15 passed (15)
   Duration  152ms
```

**テスト対象と方針:**

| レイヤー | テスト可能性 | 手法 |
|---------|------------|------|
| domain | 完全にテスト可能 | Vitest ユニットテスト |
| policies | 完全にテスト可能 | Vitest ユニットテスト（純粋関数） |
| queries | テスト可能（制約あり） | Astro ランタイム内で統合テスト |
| presentation | 制限的 | Astro ビルドテスト + 将来 E2E |

**制約事項:**
- `astro:content` の `getCollection` / `getEntry` は Astro ランタイム内でのみ動作
- queries 層はランタイム依存のため、ユニットテストではなくビルド後のスモークテスト等で検証する（`requirements.md` §7.2）

### 5. Content Collections の Zod スキーマ検証

**結果: 実現可能**

Zod 4（`astro/zod` 経由）で Frontmatter スキーマを定義し、ビルド時にバリデーションが実行されることを確認した。

**検証したスキーマ:**
```typescript
schema: z.object({
  title: z.string(),
  description: z.string(),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string()),
  category: z.string(),
  author: z.string(),
  draft: z.boolean().default(false),
  heroImage: z.string().optional(),
})
```

- `z.coerce.date()` により YAML の日付文字列が自動的に `Date` オブジェクトに変換
- `.default(false)` により frontmatter で省略されたフィールドにデフォルト値が適用
- スキーマ違反時はビルドエラーとして検出（検証中に実際にエラーを確認）

### 6. React 統合

**結果: 実現可能**

`@astrojs/react` 5.0.3 が React 19.2.5 と正常にインストール・ビルドされることを確認した。Astro ページ内で React コンポーネントを `client:*` ディレクティブ付きで使用する標準パターンが利用可能。

## 総合評価

| 要件 | 実現可能性 | リスク |
|------|-----------|--------|
| 外部コンテンツディレクトリ参照（submodule 想定） | **可能** | 低 — glob loader の相対パス参照で解決 |
| GFM サポート | **可能** | なし — デフォルト + プラグインで全機能カバー |
| 3層アーキテクチャ | **可能** | 低 — domain/policies の独立性は確保可能 |
| TDD（ドメイン層）| **可能** | 低 — Vitest で高速なユニットテスト |
| Content Collections + Zod | **可能** | 低 — Zod 4 の import パス（`astro/zod`）に注意 |
| React 統合 | **可能** | なし — 安定した統合 |
| 最新バージョン利用 | **可能** | なし — 全パッケージ最新版での互換性確認済み |

## 技術的リスクと注意点

### 低リスク

1. **Zod の import パス**: Astro 6 では `astro/zod` からインポートする必要がある（`zod` 単体パッケージではない）
2. **Node.js バージョン**: Astro 6 は Node 22+ を要求。現環境で問題なし
3. **Vite 7**: Astro 6 が Vite 7 を使用。既存の Vite プラグインとの互換性は要確認

### 設計上の注意点

1. **YAGNI 原則**: ブログは比較的シンプルなドメインのため、過度な抽象化を避ける。DDD 4層 → 3層に縮約した判断根拠は ADR-001 を参照
2. **queries 層のテスト**: `astro:content` API はランタイム依存のため、queries 層はユニットテストではなくビルド後のスモークテストで検証する
3. **コンテンツパスの管理**: submodule の有無で参照先が変わる可能性があるため、`content.config.ts` で環境分岐を設ける余地がある

## 関連 ADR

本検証の結果を踏まえた設計判断:

- **[ADR-001](adr/001-three-layer-architecture.md)**: DDD 4層ではなく 3層構成を採用
- **[ADR-002](adr/002-public-private-repo-split.md)**: site を public、content を private リポジトリに分離
- **[ADR-003](adr/003-git-submodule-for-content.md)**: content の連携方式として git submodule を採用

## 次のステップ

実装フェーズで以下の順序で進める:

1. `package.json` 作成 + Astro 6 プロジェクト初期化
2. `tsconfig.json` / `astro.config.ts` 基本設定
3. `src/content.config.ts` と Frontmatter スキーマ（Zod）
4. Tailwind CSS v4 + `@theme` デザイントークン（GP 風）
5. `src/lib/` 3層スケルトン（domain → policies → queries）
6. `src/layouts/` と `src/components/`（Header / Footer / Sidebar / PostListItem）
7. ページルーティング（`/`, `/blog/`, `/blog/[slug]`, `/tags/`, `/categories/`, `/about/`, `/projects/`）
8. ToC / 関連記事 / 読了時間
9. ダークモード + FOUC 対策
10. Pagefind 検索 + RSS + Sitemap + OGP
11. GitHub Actions + Cloudflare Pages デプロイ設定
