# GeneratePress デザイン分析

**目的**: WordPress の人気テーマ GeneratePress のデザイン特徴を詳細に分析し、astro-blog に移植可能な形で整理する。

**調査方法**: Playwright で `generatepress.com`（公式）と `docs.generatepress.com`（ドキュメント＝GeneratePress デフォルトに近い）の CSS 計算値を直接抽出。

---

## 1. GeneratePress のデザイン哲学

| 原則 | 具体的な現れ |
|------|------------|
| **Performance-first** | 本体 30KB 以下、装飾ゼロ |
| **Classic Web UI** | リンクは青+下線、フラットデザイン、シャドウ最小 |
| **Typography-first** | 派手な装飾は避け、文字情報の階層で視認性を確保 |
| **Nothing is opinionated** | デフォルトは極力ニュートラル。ユーザーが選ぶ余地を残す |
| **Accessibility** | セマンティック HTML、十分なコントラスト比 |

「AIっぽい」デザインが**カラフルなグラデーション・グラスモーフィズム・均一な余白**で特徴づけられるのに対し、GeneratePress は**無骨なまでにシンプル**。これが結果的に「人間が作ったクラシックなWeb」の印象を生む。

---

## 2. 実測値: タイポグラフィ

### 公式サイト (generatepress.com)

| 要素 | font-family | size | line-height | weight |
|------|-------------|------|-------------|--------|
| body | **Be Vietnam Pro** | 17px | 27.2px (1.6) | 400 |
| h1 | 同 | **46px** | 55.2px (1.2) | **700** |
| h2 | 同 | **38px** | 49.4px (1.3) | **600** |
| h3 | 同 | 18px | 23.4px (1.3) | 600 |
| p | 同 | 18px | 28.8px (1.6) | 400 |
| nav link | 同 | **15px** | — | 400 |

### ドキュメントサイト (docs.generatepress.com) ＝ GeneratePress デフォルトに近い

| 要素 | font-family | size | line-height | weight |
|------|-------------|------|-------------|--------|
| body | **Open Sans** | (base 14.4px) | 1.6 | 400 |
| h1 | 同 | 28.8px | 43.2px (1.5) | 400 |
| h2 | 同 | 25.92px | 38.88px (1.5) | **700** |
| p | 同 | 14.4px | 21.6px (1.5) | 400 |

### 要点

- **GeneratePress デフォルトは Open Sans**。公式サイトは Be Vietnam Pro にカスタマイズ
- body line-height は **1.5〜1.6**（Figma モダンデザインの 1.75〜2.0 より詰まっている）
- **本文は 17〜18px**（デスクトップ）。文字は大きめで読みやすい
- h1/h2 は大胆にサイズを取る（38〜46px）が、weight はせいぜい 600〜700 で**やりすぎない**
- 日本語を想定する場合、Open Sans 単独では日本語グリフがないため `Open Sans, "Noto Sans JP", sans-serif` の順で指定する

---

## 3. 実測値: カラーパレット

### 公式サイトで抽出された CSS 変数

```css
--base:        #f0f0f0;     /* 最淡い背景 */
--base-2:      #f7f8f9;     /* やや淡い背景 */
--base-3:      #ffffff;     /* 純白 */
--contrast:    #0e1120;     /* ヘッダー・主要テキスト darkest */
--contrast-2:  #575760;     /* セカンダリテキスト */
--contrast-3:  #b2b2be;     /* ミュート */
--accent:      #0171d5;     /* プライマリアクセント blue */
--accent-alt:  #1f81d6;     /* hover 用 alt blue */
```

### 実際に使われている色

| 役割 | Hex | 用途 |
|------|-----|------|
| Body background | `#ffffff` | 本文エリア |
| Body text | `#222222` / `#404040` | 本文 |
| Secondary text | `#585858` | 記事本文グレー |
| Header background | `#0e1120` (dark navy) | ヘッダー |
| Link | **`#1e73be`** / `#4381b5` | 青リンク（クラシック） |
| Accent | `#0171d5` | CTA ボタン |
| Border | `#e5e5e5` 付近 | 区切り線 |
| Secondary bg | `#f7f8f9` | サイドバーウィジェット背景 |

### 要点

- **背景は純白**（オフホワイトではない）。これは 2026 年のトレンドとは逆だが、GeneratePress の「ニュートラルに徹する」哲学の表れ
- **リンクは `#1e73be` の青 + 下線**。90年代からのクラシックなWeb慣習を継承
- **アクセントカラーは1つだけ**（青系）。複数色の使用を避ける
- ヘッダーは白 or 濃紺（ユーザーが選ぶ）。公式は濃紺 `#0e1120`

---

## 4. レイアウト構造

### コンテナ幅

| 要素 | 実測値 | 備考 |
|------|-------|------|
| `.grid-container` | **1300px** | 公式。最外コンテナ |
| `.entry-content` | **620px** | ドキュメント本文。狭めで可読性重視 |
| `.site-main` | 1300px - sidebar | sidebar 配置時の本文領域 |

### ヘッダー

- 高さ: **104px**（公式。ロゴ + ナビを 10px パディングで配置）
- ナビリンク: `padding: 10px 20px`、font-size 15px
- ロゴは左、ナビは右揃え（または中央）

### 記事アーカイブ（archive）の典型構成

```
┌──────────────────────────────────────────┐
│  Header (sticky or static)                │
├──────────────────────────────────────────┤
│  Page Hero (淡いグレー bg + h1)            │
├──────────────────────────────────────────┤
│  ┌────────────────────┬─────────────┐    │
│  │  Post List         │  Sidebar    │    │
│  │  ├─ Item           │  ┌────────┐ │    │
│  │  │  meta           │  │ About  │ │    │
│  │  │  h2 title       │  └────────┘ │    │
│  │  │  excerpt        │  ┌────────┐ │    │
│  │  │  Read more →    │  │Category│ │    │
│  │  ├─ Item           │  └────────┘ │    │
│  │  │  ...            │  ┌────────┐ │    │
│  │  └─────────────    │  │  Tags  │ │    │
│  │  ← Pagination →    │  └────────┘ │    │
│  └────────────────────┴─────────────┘    │
├──────────────────────────────────────────┤
│  Footer widgets (3 columns)              │
│  Copyright                                │
└──────────────────────────────────────────┘
```

**最大の特徴**: **右サイドバー**の存在。Figma 2026 トレンドではサイドバーなし 1 カラムが主流だが、GeneratePress は About / Categories / Tags / Recent Posts の widget を右に配置するのが典型。

---

## 5. 装飾・細部

| 要素 | 実測値 | 所感 |
|------|-------|------|
| Button border-radius | **3px** | 控えめ。角をほぼ立てている |
| Image border-radius | **4px** | 同上 |
| Card shadow | **なし** | シャドウ使わず border で区切る |
| Link underline | **あり（常時）** | クラシックなWeb UI |
| Button padding | `10px` (公式) / `10px 20px` | 小さめ |
| List gap | 6px 程度 | タイトめ |

### 記事カードのスタイル

実際には「カード」ではなく**区切り線で区切られたリスト**である点が特徴。モダンな「浮き上がるカード」ではなく、1 行 1 行が横罫線で区切られたテキストベースの構造。

```html
<article class="post-list-item">        <!-- padding: 24px 0; border-bottom: 1px solid; -->
  <div class="post-meta">…</div>         <!-- 14px gray -->
  <h2><a>Title</a></h2>                   <!-- 28-32px -->
  <p class="excerpt">…</p>                <!-- 17px -->
  <a class="read-more">Read more →</a>    <!-- 15px accent -->
</article>
```

---

## 6. astro-blog への適用方針

### 採用すべき GeneratePress の要素

| 要素 | 採用 | 理由 |
|------|------|------|
| **青リンク + 下線** (`#1e73be`) | ○ | クラシックで「人間らしい」。AI的な「テンプレ青ボタン」とは異なる伝統的Web UI |
| **右サイドバー (About / Categories / Tags)** | ○ | Figma トレンドと逆行するが、技術ブログの情報アクセス性には優れる。**AI っぽさ回避に効果的** |
| **Open Sans + Noto Sans JP** | ○ | 派手さ排除、ニュートラル。一方で Inter より「WordPress らしい」 |
| **line-height 1.6** (本文) | △ | 日本語は 1.7〜1.8 が読みやすい。1.65 程度を折衷案として推奨 |
| **border-radius 3〜4px** | ○ | 現在の設計 (8〜12px) と比べて控えめ。古典的Web感が出る |
| **シャドウなし** | ○ | border で区切る方針に変更 |
| **1300px コンテナ / 720px コンテンツ幅** | ○ | ほぼ同じ |
| **ページヘッダーに淡いグレー bg** | ○ | セクション区切りが明確になる |

### 採用しない要素

| 要素 | 理由 |
|------|------|
| Open Sans 単独 | 日本語グリフが必要。Noto Sans JP とのスタック必須 |
| 本文 14.4px | 小さすぎる。17-18px に揃える |
| ダークテーマ非標準 | astro-blog は ダークモード必須 |
| WordPress特有の構造クラス | Astro/React に不要 |

### トレードオフ: サイドバー

| 選択肢 | Pros | Cons |
|--------|------|------|
| **A. 右サイドバー採用** (GP 流) | AIっぽさ消える、情報密度高い、技術ブログらしい | 記事詳細で本文幅が狭くなる |
| B. サイドバーなし (現行 Figma 流) | 現代的、モバイル最適化しやすい | AI・テンプレ的な印象 |

**推奨**: アーカイブ（`/blog/`, `/tags/`, `/categories/`）は**右サイドバー採用**、記事詳細は**サイドバーなし 720px**（読みに集中）＋ **右に ToC sticky** のハイブリッド構成。

---

## 7. デザイントークンの移植表

Tailwind v4 `@theme` 相当で以下を定義:

```css
@theme {
  /* GP inspired palette */
  --color-bg:            #ffffff;
  --color-bg-secondary:  #f7f8f9;
  --color-bg-alt:        #f0f0f0;
  --color-text:          #222222;
  --color-text-secondary: #585858;
  --color-text-muted:    #878787;
  --color-border:        #e5e5e5;
  --color-accent:        #1e73be;
  --color-accent-hover:  #0e4b80;
  --color-header-bg:     #0e1120;    /* or #ffffff */

  /* GP inspired typography */
  --font-sans: "Open Sans", "Noto Sans JP", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: "JetBrains Mono", Menlo, monospace;

  --text-base: 17px;       /* GP body */
  --leading-base: 1.65;    /* GP 1.6 + 日本語配慮 */

  /* GP inspired spacing */
  --container-max: 1200px;
  --content-max:   720px;

  /* GP inspired radius — controlled minimalism */
  --radius-sm: 3px;
  --radius-md: 4px;
}

.dark {
  --color-bg:            #1a1a1a;
  --color-bg-secondary:  #242424;
  --color-text:          #e4e4e4;
  --color-text-secondary: #b5b5b5;
  --color-accent:        #58a6ff;
  --color-header-bg:     #0e1120;
}
```

---

## 8. 採用デザインの特徴（要約）

- 右サイドバー (About / Categories / Tags) を持つ archive layout
- `#1e73be` 青リンク + **下線常時**（GP クラシック UI）
- 淡いグレー (`#f7f8f9`) のページヘッダー帯
- border で区切るシャドウレス設計
- `border-radius: 3-4px` の控えめな角丸
- Open Sans + Noto Sans JP 混植
- ダーク時はヘッダーだけ `#0e1120` (GP 公式 dark navy)

デザイントークン詳細は `design.md` §3、実装方針は `design.md` §4-5 を参照。

---

## 9. 結論

GeneratePress の本質は **「装飾を排し、情報構造と読みやすさだけで勝負する」**ことにある。これは 2026 年のトレンド（Bento Grid / セリフ混植 / 手書き要素）とは真逆だが、**「AI っぽくない」印象を最も強く出す手段のひとつ**である。

技術ブログとしての実用性（情報アクセス性、長文読解）では GP 流が明確に優れる。モックアップ `11-generatepress-like.html` を採用するか、01〜10 のいずれかの配色と GP 流のレイアウトを組み合わせるハイブリッド案を検討する余地がある。

---

## 参考リンク

- [GeneratePress 公式](https://generatepress.com/)
- [GeneratePress Blog Content Layout ドキュメント](https://docs.generatepress.com/article/blog-content-layout/)
- [GeneratePress Premium](https://generatepress.com/premium/)
