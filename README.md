# astro-blog

個人事業主（Software Engineer）向け技術ブログ基盤。**ソースコード自体がポートフォリオとして機能する**ことを意識して設計しています。

[![Astro](https://img.shields.io/badge/Astro-6.x-FF5D01?logo=astro)](https://astro.build/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

## 概要

- **スタック**: Astro 6 / React 19 / TypeScript 6 / Tailwind CSS v4 / Vitest 4
- **アーキテクチャ**: 3層（`lib/domain` + `lib/policies` + `lib/queries`） — 参考: [ADR-001](docs/adr/001-three-layer-architecture.md)
- **リポジトリ構成**: 2リポ (public site + private content via git submodule) — 参考: [ADR-002](docs/adr/002-public-private-repo-split.md), [ADR-003](docs/adr/003-git-submodule-for-content.md)
- **デザイン**: GeneratePress 系クラシック WordPress ブログスタイル — 参考: [generatepress-analysis.md](docs/generatepress-analysis.md)
- **デプロイ**: Cloudflare Pages (GitHub Actions → `wrangler pages deploy`)

## 主な機能（F-01〜F-30）

ブログ記事一覧・詳細、タグ/カテゴリ、ページネーション、記事内目次、読了時間、関連記事、全文検索（Pagefind）、ダークモード、RSS、サイトマップ、OGP、ポートフォリオページ、自己紹介 など。詳細は [requirements.md §6](docs/requirements.md) 参照。

## 設計判断の記録 (ADR)

| # | タイトル |
|---|---------|
| [001](docs/adr/001-three-layer-architecture.md) | DDD 4層ではなく3層構成を採用 |
| [002](docs/adr/002-public-private-repo-split.md) | site を public、content を private リポジトリに分離 |
| [003](docs/adr/003-git-submodule-for-content.md) | content の連携方式として git submodule を採用 |

## ドキュメント

| ファイル | 内容 |
|---------|------|
| [docs/requirements.md](docs/requirements.md) | 要件定義書（機能一覧、スキーマ、テスト戦略、デプロイ） |
| [docs/design.md](docs/design.md) | UI デザイン設計書（デザイントークン、レイアウト、a11y、パフォーマンス予算） |
| [docs/generatepress-analysis.md](docs/generatepress-analysis.md) | GeneratePress 詳細分析と移植方針 |
| [docs/feasibility.md](docs/feasibility.md) | フィジビリティ検証結果 |
| [docs/adr/](docs/adr/) | Architecture Decision Records |

## 開発コマンド

> 実装フェーズに入るまでは未稼働です。

```bash
pnpm install          # 依存関係インストール
pnpm dev              # 開発サーバー（http://localhost:4321）
pnpm build            # 本番ビルド
pnpm check            # astro check（型チェック）
pnpm test             # Vitest
```

## リポジトリ構成

```
astro-blog/                    # public repo
├── content/                   ← git submodule (private repo) — 実装時に追加
├── content-sample/            # public 同梱のサンプル記事（デザイン確認用）
├── src/                       # Astro + lib 3層 — 実装時に作成
├── tests/                     # Vitest — 実装時に作成
├── docs/                      # 要件・設計・ADR
├── astro.config.ts            # 実装時に作成
└── package.json               # 実装時に作成
```

## 環境

- **Node.js**: >= 22
- **pnpm**: 10.x

## ライセンス

ソースコードは MIT ライセンスで公開する予定です（プロジェクト公開時に LICENSE ファイルを追加）。
