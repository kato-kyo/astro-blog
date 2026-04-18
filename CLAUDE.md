# astro-blog

個人事業主（SWE）向け技術ブログ。ソースコード自体がポートフォリオとして機能する。
詳細な設計は @docs/requirements.md、設計判断の経緯は @docs/adr/ を参照。

## リポジトリ構成

**site（public repo）** と **content（private repo / git submodule）** の2リポジトリ構成。

```
astro-blog/              # public repo
├── content/             ← git submodule (private repo: astro-blog-content)
│   ├── blog/
│   ├── authors/
│   └── pages/
├── content-sample/      # ポートフォリオ用サンプル記事（public に同梱。submodule 外）
├── src/
│   ├── content.config.ts
│   ├── lib/             # ドメインロジック（3層アーキテクチャ）
│   ├── pages/
│   ├── layouts/
│   └── components/
├── tests/
├── astro.config.ts
└── package.json         # 単一パッケージ（pnpm workspace 不使用）
```

## 技術スタック（バージョン固定）

> **承認なしにバージョン変更禁止。**

| 技術 | バージョン | 備考 |
|------|-----------|------|
| Astro | 6.x | フレームワーク |
| React | 19.x | インタラクティブ UI のみ。静的部分は Astro コンポーネント優先 |
| TypeScript | 6.x | 言語 |
| Zod | 4.x | **`astro/zod`** から import（`zod` ではない） |
| Vitest | 4.x | テスト |
| Node.js | >=22 | ランタイム |
| pnpm | 10.x | パッケージ管理 |

## 3層アーキテクチャ（src/lib/）

```
lib/domain/     — 型定義・不変条件。純粋 TS。外部依存禁止
lib/policies/   — 業務ルール（公開判定等）。純粋関数
lib/queries/    — データ取得・フィルタ・ソート。Astro API 依存はここだけ
```

詳細ルールは `.claude/rules/lib-architecture.md` に定義。

## コマンド

```bash
pnpm install          # 依存関係インストール
pnpm dev              # 開発サーバー（localhost:4321）
pnpm build            # 本番ビルド
pnpm check            # astro check（型チェック）
pnpm test             # Vitest テスト実行
```

## 品質ゲート

- **ローカル**: `pnpm check`（高速フィードバック）
- **CI**: `pnpm check && pnpm test && pnpm build`（フル検証）
- UI 変更がある場合は Playwright MCP でブラウザ確認

## submodule 操作

```bash
git clone --recurse-submodules <repo>   # 初回クローン
git submodule update --remote content   # content を最新に更新
# ※ 更新後は親 repo で submodule ポインタを commit すること
```

## MCP サーバー

- **astro-docs**: Astro 公式ドキュメント参照（プロジェクト設定済み）
- **playwright**: ブラウザ操作・UI 確認（グローバル設定済み）

## Git 規約

- ブランチ戦略: `main`(prod) ← `develop`(dev) ← `feature/xxx`
- feature/* → develop に PR → プレビュー確認 → develop → main に PR → prod デプロイ
- コミット: Conventional Commits（`feat:`, `fix:`, `test:`, `refactor:`, `docs:`）

## 環境

- **prod** (`main`): 本番。draft/予約投稿は非表示、`robots.txt` は Allow
- **dev** (`develop`/PR): プレビュー。draft 表示、`robots.txt` は Disallow
- 環境判定: `import.meta.env.PUBLIC_APP_ENV !== "production"`（`CF_PAGES_BRANCH` は補助）
- デプロイ: GitHub Actions → `wrangler pages deploy` に一本化。Cloudflare 側自動デプロイは無効
