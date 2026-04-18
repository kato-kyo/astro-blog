# ADR-007: ダークモード設計

- Status: Accepted
- Date: 2026-04-18

## Context

GP 風クラシック UI を採用しつつ、モダンな技術ブログとしてダークモード対応が期待される。
ダークモード実装で特に問題になるのは **FOUC（Flash of Unstyled / Unthemed Content）**: ページロード直後にライト表示で描画され、JS が評価された瞬間にダーク表示へ切り替わるチラつき。
React island（`client:load`）はインタラクション前に hydrate されないため、初期テーマ適用を React に任せると必ず FOUC が発生する。

## Decision

**head インラインスクリプト + React トグル** の二段構えで実装する。

- **初期テーマ適用**: `BaseLayout.astro` の `<head>` に同期実行の小さなインラインスクリプトを配置し、最初のペイント前に `document.documentElement.classList.toggle("dark", ...)` を実行
  - 判定順: `localStorage` の保存値 → `matchMedia("(prefers-color-scheme: dark)")` → デフォルト（ライト）
- **切替 UI**: `ThemeToggle.tsx`（React、`client:load`）でボタンを描画し、クリックで `<html class="dark">` と localStorage を更新
- **状態の一次情報**: `document.documentElement.classList.contains("dark")` を単一の Source of Truth とする。React の内部 state はそれを反映するだけ
- **遷移**: CSS の `transition` を 0.15s で全体に適用し、切替時の違和感を抑える

## Rationale

- **FOUC 防止**: head インラインスクリプトは hydrate を待たずに実行されるため、最初のペイント時点で正しいテーマが確定する。これは React の `client:*` では原理的に達成できない
- **React との責務分離**: 初期値決定は DOM API の直接操作（純粋な JS）、トグル UI はインタラクティブなので React。それぞれ適した技術を使う
- **状態整合**: React の内部 state を一次情報にすると、他タブでの変更・OS 設定変更との不整合が発生する。DOM の class を一次情報にすることで、どのコンポーネントからも現在状態を同じ API で参照できる
- **Tailwind のダークモード**: `darkMode: "class"` と整合し、CSS 側の記述が素直

## Alternatives Considered

**React だけで完結（`client:load` でテーマ適用）**
- Pros: 実装がシンプル、状態管理が React 内で閉じる
- Cons: hydrate 前のペイントでライト表示が必ず出る → 強い FOUC
- → 棄却

**CSS の `prefers-color-scheme` メディアクエリのみ**
- Pros: JS ゼロ、FOUC なし
- Cons: ユーザーが OS 設定と独立してテーマを選べない（明示トグル要件を満たさない）
- → 棄却

**サーバーサイドで Cookie からテーマを決定**
- Pros: FOUC なし、SSR と相性が良い
- Cons: 本サイトは SSG（静的生成）で、ビルド時には個別ユーザーの Cookie を参照できない
- → 棄却（アーキテクチャ不整合）

**localStorage 読み取りを React の useEffect で行う**
- Pros: React 慣習に合う
- Cons: useEffect はマウント後に走るため、初回レンダリング時点ではまだダークが適用されず FOUC 発生
- → 棄却

## Consequences

- Pros: FOUC なし、ユーザー選択と OS 設定を両立、状態の一次情報が明確
- Cons: head にインラインスクリプトを 1 つ持つ必要がある（CSP を導入する場合は nonce / hash 対応が必要）

## Re-evaluate when

- CSP を厳格化する要件が出て、インラインスクリプトを許容できなくなった場合
- → 外部 JS ファイル化 + preload、または SSR 化を検討
