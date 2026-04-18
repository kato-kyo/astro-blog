# UI デザイン設計書

## 1. デザイン方針

### 1.1 コンセプト

**GeneratePress 系「クラシック WordPress ブログ」スタイル**

- コンテンツが主役。装飾は最小限
- **伝統的な Web UI**（青リンク + 下線常時、サイドバー付きアーカイブ、フラットデザイン）
- タイポグラフィ駆動。テキストの階層で情報構造を表現
- **シャドウゼロ / border で区切る**（浮き上がるカードではない）
- コードブロックの視認性を重視（SWE ポートフォリオとして）
- ダークモードをファーストクラスで対応
- モバイルファースト・レスポンシブ

**なぜ GP 系を選ぶか**: 2026 年の AI 生成デザインに頻出する特徴（紫→青グラデーション、グラスモーフィズム、完全対称、装飾過多）とは対極にある「古典的に完成された Web デザイン」を意図的に選ぶことで、ポートフォリオとして「場面に応じた適切な技術選択ができる」ことを示す。判断根拠の詳細は `docs/generatepress-analysis.md` 参照。

### 1.2 デザイン原則

| 原則 | 説明 |
|------|------|
| Classic | 90〜2010年代 WordPress 文脈を踏襲。下線付きリンク、右サイドバー、3px 角丸 |
| Restraint | 色数は 2 色（白黒 + 青）。装飾最小 |
| Clarity | 情報の階層を明確にし、迷わない導線 |
| Consistency | 全ページで統一されたトーン・スペーシング |
| Accessibility | WCAG 2.1 AA 準拠のコントラスト比 |

## 2. 技術選定

| カテゴリ | 選定 | 理由 |
|---------|------|------|
| CSS フレームワーク | **Tailwind CSS v4** | Astro 6 公式対応。`@tailwindcss/vite` プラグイン。CSS-first 設定 |
| ダークモード | class ベース + OS 追従 | `@custom-variant` + `localStorage` + `prefers-color-scheme` |
| フォント（本文） | **Open Sans + Noto Sans JP** | GeneratePress デフォルト踏襲。日本語フォールバックで国際化対応 |
| フォント（コード） | **JetBrains Mono** | リガチャ対応、コードの視認性に優れる |
| コードハイライト | Shiki 4（Astro 6 内蔵） | テーマ: light=`github-light`, dark=`github-dark` |

### 2.1 Tailwind CSS v4 セットアップ

```bash
pnpm add tailwindcss @tailwindcss/vite @tailwindcss/typography
```

```typescript
// astro.config.ts
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

```css
/* src/styles/global.css */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@custom-variant dark (&:where(.dark, .dark *));
```

## 3. デザイントークン

### 3.1 カラーパレット（GeneratePress 実測値ベース）

```css
@theme {
  /* --- Neutral (GP defaults) --- */
  --color-bg:            #ffffff;   /* 純白（オフホワイトではない。GP 哲学に従う） */
  --color-bg-secondary:  #f7f8f9;   /* GP: --base-2。widget / page header 帯 */
  --color-bg-alt:        #f0f0f0;   /* GP: --base。コードブロック代替背景 */
  --color-text:          #222222;   /* GP body */
  --color-text-secondary: #585858;  /* GP docs body */
  --color-text-muted:    #878787;   /* 補助ラベル（日付・件数等）専用 */
  --color-border:        #e5e5e5;

  /* --- Accent (classic blue + underline) --- */
  --color-accent:        #1e73be;   /* GP link blue（下線常時） */
  --color-accent-hover:  #0e4b80;
  --color-accent-light:  #e8f1f9;

  /* --- Header (ダークネイビーを Light でも採用可) --- */
  --color-header-bg:     #ffffff;
  --color-header-text:   #222222;
  --color-header-border: #e5e5e5;

  /* --- Semantic --- */
  --color-success:       #16a34a;
  --color-warning:       #ca8a04;
  --color-error:         #dc2626;
  --color-draft-badge:   #f59e0b;   /* dev 環境の draft バッジ */
}
```

**`text-muted` の使用制限**: 補助ラベル（日付、読了時間、件数等）にのみ使用する。本文テキストには `text` または `text-secondary` を使用すること。

**`accent` の下線ルール**: リンクには `text-decoration: underline` を**常時適用**する（GP 慣習）。ホバー時は色を濃く変更。

### 3.2 ダークモードカラー

```css
.dark {
  --color-bg:            #1a1a1a;
  --color-bg-secondary:  #242424;
  --color-bg-alt:        #2a2a2a;
  --color-text:          #e4e4e4;
  --color-text-secondary: #b5b5b5;
  --color-text-muted:    #888888;
  --color-border:        #3a3a3a;

  --color-accent:        #58a6ff;   /* GitHub Dark 系の青 */
  --color-accent-hover:  #79b8ff;
  --color-accent-light:  #1a2636;

  --color-header-bg:     #0e1120;   /* GP 公式の dark navy */
  --color-header-text:   #ffffff;
  --color-header-border: #0e1120;
}
```

### 3.3 prose（Typography プラグイン）のトークン連動

`@tailwindcss/typography` の既定色はデザイントークンと連動しないため、明示的に上書きする:

```css
/* src/styles/global.css */
.prose {
  --tw-prose-body:       var(--color-text);
  --tw-prose-headings:   var(--color-text);
  --tw-prose-links:      var(--color-accent);
  --tw-prose-bold:       var(--color-text);
  --tw-prose-code:       var(--color-text);
  --tw-prose-pre-bg:     var(--color-bg-code);
  --tw-prose-pre-code:   var(--color-text);
  --tw-prose-quotes:     var(--color-text-secondary);
  --tw-prose-hr:         var(--color-border);
  --tw-prose-th-borders: var(--color-border);
  --tw-prose-td-borders: var(--color-border);
}

.dark .prose {
  --tw-prose-body:       var(--color-text);
  --tw-prose-headings:   var(--color-text);
  --tw-prose-links:      var(--color-accent);
  --tw-prose-bold:       var(--color-text);
  --tw-prose-code:       var(--color-text);
  --tw-prose-pre-bg:     var(--color-bg-code);
  --tw-prose-pre-code:   var(--color-text);
  --tw-prose-quotes:     var(--color-text-secondary);
  --tw-prose-hr:         var(--color-border);
  --tw-prose-th-borders: var(--color-border);
  --tw-prose-td-borders: var(--color-border);
}
```

### 3.4 タイポグラフィ

フォント定義は `@theme` **1箇所のみ**に集約する。変更時はここだけ修正すれば全体に反映される。

```css
@theme {
  /* ============================================================
   * フォント定義（変更時はここだけ修正）
   *
   * 本文: Open Sans（英数字）+ Noto Sans JP（日本語）
   *       GeneratePress デフォルトを踏襲しつつ日本語対応
   * コード: JetBrains Mono
   *
   * Astro 6 Fonts API で自動ダウンロード・最適化される。
   * フォントを差し替える場合はここと astro.config.ts の
   * fonts 設定を合わせて変更すること。
   * ============================================================ */
  --font-sans: "Open Sans", "Noto Sans JP", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "Cascadia Code", "Fira Code", Menlo, Monaco, monospace;

  /* --- Font Size (rem) --- */
  --text-xs:   0.75rem;   /* 12px */
  --text-sm:   0.875rem;  /* 14px */
  --text-base: 1rem;      /* 16px — 本文 */
  --text-lg:   1.125rem;  /* 18px */
  --text-xl:   1.25rem;   /* 20px */
  --text-2xl:  1.5rem;    /* 24px */
  --text-3xl:  1.875rem;  /* 30px */
  --text-4xl:  2.25rem;   /* 36px — 記事タイトル */

  /* --- Line Height (GP base 1.6 + 日本語配慮で 1.65) --- */
  --leading-tight:  1.25;
  --leading-normal: 1.65;  /* 本文。GP 1.6 を日本語向けに微調整 */
  --leading-relaxed: 1.85;

  /* --- Font Weight --- */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### 3.4 スペーシング

8px グリッドベース:

| トークン | 値 | 用途 |
|---------|-----|------|
| `--space-1` | 0.25rem (4px) | 最小間隔 |
| `--space-2` | 0.5rem (8px) | インライン要素間 |
| `--space-3` | 0.75rem (12px) | リスト項目間 |
| `--space-4` | 1rem (16px) | 段落間 |
| `--space-6` | 1.5rem (24px) | セクション内 |
| `--space-8` | 2rem (32px) | セクション間 |
| `--space-12` | 3rem (48px) | 大セクション間 |
| `--space-16` | 4rem (64px) | ページセクション間 |

### 3.5 ブレークポイント

| 名前 | 幅 | 対象 |
|------|-----|------|
| sm | 640px | スマートフォン横 |
| md | 768px | タブレット |
| lg | 1024px | デスクトップ（ToC サイドバー表示） |
| xl | 1280px | ワイドデスクトップ |

### 3.6 コンテンツ幅

| 要素 | 最大幅 | 理由 |
|------|--------|------|
| 本文 | 720px (45rem) | 長文の可読性最適ライン（1行60〜80文字）。GP 620px + 日本語配慮 |
| コンテナ | 1200px (75rem) | デスクトップでのサイドバー込み幅。GP 1300px をやや圧縮 |
| コードブロック | 本文幅に合わせる | 横スクロール可能 |

### 3.7 Border Radius（GP 実測: 極めて控えめ）

```css
@theme {
  --radius-sm: 3px;    /* GP button */
  --radius-md: 4px;    /* GP image */
  --radius-lg: 8px;    /* 例外（widget 背景等のやや大きい面） */
}
```

**基本ルール**: 浮き上がる「カード」は作らない。`border-radius` は 3〜4px、シャドウなし。

### 3.8 シャドウ

**原則: シャドウを使用しない**（GP 哲学に従う）。要素の分離は `border` で行う。例外的に必要な場合のみ:
- theme switch ボタン等の浮遊 UI: `0 2px 6px rgba(0,0,0,.08)` の控えめなシャドウ可。

## 4. レイアウト設計

### 4.1 共通レイアウト

```
┌─────────────────────────────────────────┐
│  Header (static, 60-70px)               │
│  ┌──────────────────────────────────┐   │
│  │ Logo        Nav   Search  Theme │   │
│  └──────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Page Hero (bg-secondary, h1 + subtitle)│
├─────────────────────────────────────────┤
│                                         │
│  Main Content                           │
│  (ページ固有コンテンツ)                    │
│                                         │
├─────────────────────────────────────────┤
│  Footer (3-col widgets + copyright)     │
│  ┌──────────────────────────────────┐   │
│  │ About  Navigation   Connect     │   │
│  │ Copyright ©                     │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**注**: GP はヘッダーを sticky にせず static で置くのが一般的。技術ブログの読書体験では sticky でも可だが、デフォルトは static を採用。

### 4.2 Header

```
[Mobile]
┌──────────────────────────┐
│ Logo          [☰] [🔍] [◐]│
└──────────────────────────┘

[Desktop]
┌──────────────────────────────────────────────┐
│ Logo    Home  Blog  Tags  Projects  About │  🔍  ◐ │
└──────────────────────────────────────────────┘
```

- **static**（sticky にしない。GP デフォルト踏襲）
- 背景: **ソリッド `bg-header`**（blur は使用しない）
  - Light: `#ffffff` / Dark: `#0e1120`（GP dark navy）
- 高さ: 60-70px（ロゴ + nav を含む）
- nav padding: `10px 20px`（GP 実測値）
- nav font-size: 15px（GP 実測値）
- モバイルはハンバーガーメニュー
- 検索ボタン → Pagefind モーダル
- テーマトグルボタン（◐ アイコン）

### 4.3 ページ別レイアウト

#### F-01 トップページ `/`

```
┌─────────────────────────────────────────┐
│  Hero Section                           │
│  ┌──────────────────────────────────┐   │
│  │ Kyosuke Kato                     │   │
│  │ Software Engineer                │   │
│  │ 短い自己紹介テキスト               │   │
│  └──────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Latest Posts                           │
│  ┌──────────┐ ┌──────────┐             │
│  │ PostCard │ │ PostCard │ ...         │
│  └──────────┘ └──────────┘             │
│                          [View all →]   │
├─────────────────────────────────────────┤
│  Featured Projects                      │
│  ┌──────────┐ ┌──────────┐             │
│  │ProjCard  │ │ProjCard  │             │
│  └──────────┘ └──────────┘             │
└─────────────────────────────────────────┘
```

#### F-02 ブログ記事一覧 `/blog/` （サイドバー付き）

```
[Desktop 1024px+]
┌────────────────────────────────────────────────┐
│  Page Hero: h1 "Blog" + subtitle (bg-secondary) │
├────────────────────────────────────────────────┤
│  ┌─────────────────────┬──────────────────┐    │
│  │ Post List (2/3)     │ Sidebar (1/3)    │    │
│  │                     │                  │    │
│  │ date | author | cat │ ┌──────────────┐ │    │
│  │ ## Title            │ │ About        │ │    │
│  │ Excerpt...          │ └──────────────┘ │    │
│  │ Read more →         │ ┌──────────────┐ │    │
│  │ ─────────           │ │ Categories   │ │    │
│  │ date | author | cat │ │ - 技術 (12)  │ │    │
│  │ ## Title            │ │ - TS (8)     │ │    │
│  │ Excerpt...          │ └──────────────┘ │    │
│  │ Read more →         │ ┌──────────────┐ │    │
│  │                     │ │ Tags         │ │    │
│  │ ← 1 2 3 ... →       │ │ [Astro][TDD] │ │    │
│  └─────────────────────┴──────────────────┘    │
└────────────────────────────────────────────────┘

[Mobile 〜1023px]
サイドバー非表示、Post List が全幅を占有。
サイドバーウィジェット（Categories / Tags）は記事一覧の**下に**配置。
```

**PostListItem 構造（GP 典型）**:
- meta 行: `date | author | category`（`#878787` muted + separator `|`）
- h2 title（28-32px, 600 weight, `text`, hover で `accent`）
- excerpt（17px, `text-secondary`）
- Read more →（`accent`, 600 weight, 下線 hover）
- 項目間は border-bottom のみで区切る（カード化しない）

#### F-03 記事詳細 `/blog/[slug]/`

```
[Desktop: lg 以上]
┌─────────────────────────────────────────────────┐
│ Article Header                                   │
│ ┌───────────────────────────────────────────┐    │
│ │ Title (text-4xl)                          │    │
│ │ 2026-04-11 · 5 min read · [tag1] [tag2]  │    │
│ │ Author: Kyosuke Kato                      │    │
│ └───────────────────────────────────────────┘    │
├────────────────────────────┬────────────────────┤
│ Article Body (prose)       │ ToC Sidebar        │
│                            │ (sticky, lg以上)    │
│ ## Heading 2               │ ● Heading 2        │
│ Paragraph...               │   ○ Heading 3      │
│                            │ ○ Heading 2        │
│ ```code block```           │   ○ Heading 3      │
│                            │                    │
│ ## Heading 2               │                    │
│ Paragraph...               │                    │
│                            │                    │
├────────────────────────────┴────────────────────┤
│ Related Posts                                    │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │ PostCard │ │ PostCard │ │ PostCard │         │
│ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────┘

[Mobile: lg 未満]
┌──────────────────────────────┐
│ Title                        │
│ Meta info                    │
│                              │
│ ToC (折りたたみ可能)           │
│                              │
│ Article Body (prose)         │
│ ...                          │
│                              │
│ Related Posts                │
│ PostCard (縦並び)             │
└──────────────────────────────┘
```

#### F-04/06 タグ一覧・カテゴリ一覧

```
┌─────────────────────────────────────────┐
│  Page Hero: "Tags" / "Categories"       │
├─────────────────────────────────────────┤
│  [tag1 (12)] [tag2 (8)] [tag3 (5)] ... │
│                                         │
│  Flex wrap。小さな border-radius 3px     │
│  背景: bg / border / text-secondary      │
│  hover で accent bg + 白テキスト          │
└─────────────────────────────────────────┘
```

**タグ pill のスタイル**: `padding: 4px 10px`、`border: 1px solid border`、`border-radius: 3px`、`font-size: 12px`。**ボタン化しすぎない**のが GP 流。

#### F-08 自己紹介 `/about/`

```
┌─────────────────────────────────────────┐
│  About                                  │
│  ┌──────────────────────────────────┐   │
│  │ Markdown レンダリング（prose）     │   │
│  │                                  │   │
│  │ 自己紹介テキスト...               │   │
│  │ スキル、経歴、連絡先など           │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

#### F-09 ポートフォリオ `/projects/`

```
┌─────────────────────────────────────────┐
│  Projects                               │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ ProjectCard                      │   │
│  │ Title            2025-01~2026-03 │   │
│  │ Description...                   │   │
│  │ [Astro] [TypeScript] [React]     │   │
│  │                    [View →]      │   │
│  ├──────────────────────────────────┤   │
│  │ ProjectCard                      │   │
│  │ ...                              │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## 5. コンポーネント一覧

### 5.1 レイアウトコンポーネント（Astro）

| コンポーネント | ファイル | 責務 |
|-------------|--------|------|
| BaseLayout | `layouts/BaseLayout.astro` | HTML head, global CSS, Header, Footer, メタタグ |
| ArticleLayout | `layouts/ArticleLayout.astro` | 記事詳細用。ToC サイドバー + prose スタイル |

### 5.2 共通 UI コンポーネント（Astro）

| コンポーネント | ファイル | 責務 |
|-------------|--------|------|
| Header | `components/Header.astro` | static ヘッダー、ナビ、検索、テーマトグル |
| Footer | `components/Footer.astro` | 3-col ウィジェット + コピーライト |
| PageHero | `components/PageHero.astro` | `bg-secondary` 帯 + h1 + subtitle |
| Sidebar | `components/Sidebar.astro` | 右サイドバー（アーカイブページ用） |
| Widget | `components/Widget.astro` | サイドバー内のカード（About / Categories / Tags / Recent） |
| PostListItem | `components/PostListItem.astro` | 記事一覧の1項目（meta / title / excerpt / read-more） |
| PostCard | `components/PostCard.astro` | 関連記事・トップページ用の軽量カード |
| ProjectCard | `components/ProjectCard.astro` | プロジェクトカード |
| TagPill | `components/TagPill.astro` | タグ pill（3px radius、小さな border） |
| CategoryBadge | `components/CategoryBadge.astro` | カテゴリ pill |
| Pagination | `components/Pagination.astro` | ページネーション（数字 + Prev/Next） |
| SEOHead | `components/SEOHead.astro` | メタタグ、OGP |
| DraftBadge | `components/DraftBadge.astro` | dev 環境用 draft バッジ |

### 5.3 インタラクティブコンポーネント（React）

| コンポーネント | ファイル | client ディレクティブ | 責務 |
|-------------|--------|-------------------|------|
| ThemeToggle | `components/ThemeToggle.tsx` | `client:load` | ダークモード切替（FOUC 防止は `<head>` スクリプト） |
| TableOfContents | `components/TableOfContents.tsx` | `client:idle` | 記事内目次。スクロール追従ハイライト |
| MobileMenu | `components/MobileMenu.tsx` | `client:load` | モバイルハンバーガーメニュー |
| SearchModal | `components/SearchModal.tsx` | `client:idle` | Pagefind 検索モーダル（`Cmd+K` ショートカット） |

### 5.4 Markdown 内コンポーネント

Shiki 4 によるコードハイライトは Astro 内蔵。追加の Markdown 用カスタムコンポーネントは初期スコープでは不要。`@tailwindcss/typography` の `prose` クラスで本文をスタイリング。

## 6. ダークモード実装設計

### 6.1 FOUC 防止

```html
<!-- BaseLayout.astro の <head> 内 -->
<meta name="color-scheme" content="light dark" />
<script is:inline>
  (function() {
    try {
      var theme = localStorage.getItem("theme");
    } catch(e) { var theme = null; }
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = theme === "dark" || (!theme && prefersDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  })();
</script>
```

- `try/catch` で `localStorage` がブロックされる環境（Safari プライベートモード等）に対応
- `<meta name="color-scheme">` でブラウザのデフォルト UI（スクロールバー等）を同期
- `document.documentElement.style.colorScheme` でフォーム要素等のネイティブ UI も追従

### 6.2 Tailwind 設定

```css
/* src/styles/global.css */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@custom-variant dark (&:where(.dark, .dark *));
```

### 6.3 Shiki デュアルテーマ

```typescript
// astro.config.ts
shikiConfig: {
  themes: {
    light: "github-light",
    dark: "github-dark",
  },
}
```

## 7. レスポンシブ戦略

### 7.1 ブレークポイント別対応

| 要素 | 0–639px | 640–1023px | 1024px+ |
|------|---------|-----------|---------|
| Header | Logo + アイコン3つ | 同左 | フルナビ展開 |
| 記事一覧 | 1列リスト | 同左 | 同左 |
| 記事詳細 | ToC 折りたたみ | 同左 | ToC サイドバー固定 |
| PostCard | 縦並び | 2列グリッド | 3列グリッド |
| ProjectCard | 1列 | 同左 | 同左 |
| 検索 | フルスクリーンモーダル | 同左 | 中央モーダル |

### 7.2 モバイル固有の対応

- タッチターゲット: 最小 44x44px（WCAG 準拠）
- コードブロック: 横スクロール + スクロールバー常時表示
- ToC: 記事冒頭に折りたたみアコーディオンとして配置

## 8. アクセシビリティ

### 8.1 基本要件

| 要件 | 対応 |
|------|------|
| コントラスト比 | WCAG 2.1 AA（通常テキスト 4.5:1, 大テキスト 3:1） |
| フォーカス表示 | `focus-visible` でキーボードフォーカスリングを表示 |
| スキップリンク | 「メインコンテンツへ」リンクを最初に配置 |
| セマンティック HTML | `<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>` |
| 画像 alt | 全画像に代替テキスト必須 |
| 読了時間 | `<time>` タグでマークアップ |
| モーション | `prefers-reduced-motion` 対応（ToC 追従・トランジション抑制） |

### 8.2 モーダル・メニューの操作仕様

| 要件 | SearchModal | MobileMenu |
|------|-------------|------------|
| `role` | `dialog` | — (`<nav>` で十分) |
| `aria-modal` | `true` | — |
| `aria-expanded` | — | トグルボタンに `true`/`false` |
| `aria-controls` | — | メニュー要素の ID を参照 |
| フォーカストラップ | 開いている間はモーダル内に閉じ込め | 開いている間はメニュー内に閉じ込め |
| 初期フォーカス | 検索入力欄 | 最初のナビリンク |
| Esc キーで閉じる | 必須 | 必須 |
| 背景クリックで閉じる | 必須 | 必須 |
| 閉じた後のフォーカス | 開いた元のボタンに戻す | 開いた元のボタンに戻す |

## 9. パフォーマンス予算

### 9.1 リソース予算

| リソース | 上限 (gzip) | 備考 |
|---------|------------|------|
| JavaScript（初回読み込み） | < 80 KB | React island の合計 |
| CSS | < 40 KB | Tailwind の purge 後 |
| フォント | < 200 KB | Noto Sans JP (subset) + Inter + JetBrains Mono |
| LCP 要素 | < 120 KB | hero 画像またはテキスト |
| 合計ページ重量 | < 500 KB | トップページ基準 |

### 9.2 Core Web Vitals 目標

| 指標 | 目標 |
|------|------|
| LCP | < 2.5s |
| FID / INP | < 200ms |
| CLS | < 0.1 |

### 9.3 React island のサイズ方針

| コンポーネント | ディレクティブ | 理由 |
|-------------|-------------|------|
| ThemeToggle | `client:load` | FOUC 直後の操作性。ただし極小（< 3KB） |
| MobileMenu | `client:load` | ナビゲーション即応。極小（< 5KB） |
| TableOfContents | `client:idle` | メインコンテンツ閲覧後で十分 |
| SearchModal | `client:idle` | Pagefind JS は遅延読み込み |

`client:load` は ThemeToggle と MobileMenu の2つのみ。それ以外は `client:idle` で遅延。

## 10. コードブロック仕様

| 項目 | 仕様 |
|------|------|
| ハイライトエンジン | Shiki 4（Astro 6 内蔵） |
| ライトテーマ | `github-light` |
| ダークテーマ | `github-dark` |
| 行番号 | デフォルト非表示。将来 remark プラグインで対応可 |
| コピーボタン | 各コードブロック右上に配置（Astro コンポーネントで実装） |
| 折返し | **禁止**（`white-space: pre`）。横スクロールで対応 |
| ハイライト行 | Shiki の `// [!code highlight]` 記法で対応 |
| ファイル名表示 | コードブロックの meta string から取得（例: ` ```ts title="post.ts" `） |
| タブサイズ | 2スペース |
| モバイル | 横スクロール + スクロールバー常時表示（`-webkit-scrollbar` カスタマイズ） |

## 11. ToC（記事内目次）仕様

| 項目 | 仕様 |
|------|------|
| 対象見出し | h2, h3 のみ（h1 は記事タイトル、h4 以下は深すぎる） |
| デスクトップ (1024px+) | 右サイドバーに sticky 配置。スクロール追従でアクティブ見出しをハイライト |
| モバイル (0–1023px) | 記事冒頭にアコーディオン配置。デフォルト**閉じた状態** |
| スクロール追従 | `IntersectionObserver` で現在の見出しを検出し、`aria-current="true"` を付与 |
| クリック動作 | 対応する見出しへスムーズスクロール（`prefers-reduced-motion` 時は即座にジャンプ） |
| 見出しがない記事 | ToC を非表示 |
