# docs/

プロジェクト設計・決定のドキュメント群。

## 📋 ドキュメント一覧

### 要件・設計

| ファイル | 内容 | ステータス |
|---------|------|----------|
| [requirements.md](requirements.md) | 要件定義書（全30機能 F-01〜F-30、Frontmatter スキーマ、テスト戦略、デプロイ） | ✅ 確定 |
| [design.md](design.md) | UI デザイン設計書（GP 系デザイントークン、レイアウト、a11y、パフォーマンス予算） | ✅ 確定 |
| [feasibility.md](feasibility.md) | フィジビリティ検証結果（Astro + Content Collections + GFM + Vitest） | ✅ 完了 |
| [generatepress-analysis.md](generatepress-analysis.md) | GeneratePress 詳細分析と移植方針（採用デザインの根拠） | ✅ 完了 |

### Architecture Decision Records

| ADR | タイトル | ステータス |
|-----|---------|----------|
| [001](adr/001-three-layer-architecture.md) | DDD 4層ではなく3層構成を採用 | Accepted |
| [002](adr/002-public-private-repo-split.md) | site を public、content を private リポジトリに分離 | Accepted |
| [003](adr/003-git-submodule-for-content.md) | content の連携方式として git submodule を採用 | Accepted |

## 🗺️ 読む順序

初めてこのプロジェクトを理解する場合の推奨順序:

1. **ルートの [README.md](../README.md)** — プロジェクト概要
2. **[requirements.md](requirements.md)** — 何を作るか
3. **[adr/001](adr/001-three-layer-architecture.md)〜[003](adr/003-git-submodule-for-content.md)** — なぜその構成か
4. **[design.md](design.md)** — どのように見せるか
5. **[generatepress-analysis.md](generatepress-analysis.md)** — なぜ GP 風を採用したか
6. **[feasibility.md](feasibility.md)** — 技術的に成立するか

## 🔄 更新ポリシー

- **確定後の変更は新しい ADR を書く**（既存の ADR の Status を `Superseded by ADR-N` に変更）
- `requirements.md` / `design.md` は確定後もマイナーな追記は可（実装中の気付き等）
