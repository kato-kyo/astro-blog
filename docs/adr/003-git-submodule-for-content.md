# ADR-003: content の連携方式として git submodule を採用

- Status: Accepted
- Date: 2026-04-11

## Context

ADR-002 で site（public）と content（private）のリポジトリ分離を決定した。
2つのリポジトリを連携させる方式を選定する必要がある。

## Decision

git submodule を採用する。site リポジトリが content リポジトリを submodule として参照する。

```
astro-blog/              # public repo
├── content/             ← git submodule (private repo)
├── src/
├── astro.config.ts
└── package.json
```

## Comparison

| 方式 | private 分離 | ビルド再現性 | 運用負荷 | 判定 |
|------|-------------|------------|---------|------|
| **git submodule** | ○ | ○（SHA pin） | 中 | **採用** |
| git subtree | × (実体取り込み) | ○ | 低 | 棄却 |
| CI 合成（2 repo checkout） | ○ | △ | 低 | 次点 |
| private npm package | ○ | ○ | 高 | 棄却 |

## Rationale

- submodule は private 分離と履歴分離を両立する
- 親 repo が content の commit SHA を固定するため、ビルド再現性が高い
- Astro の glob loader は `./content/blog` の相対パスでそのまま動作する
- pnpm workspace が不要になり、単一パッケージとして構成がシンプルになる

## Known risks and mitigations

| リスク | 対策 |
|--------|------|
| `clone --recurse-submodules` 忘れ | README に明記 + npm scripts でガード |
| content 更新後の submodule ポインタ commit 忘れ | npm scripts で `submodule update` + `git add content` を一括化 |
| detached HEAD で content を編集して混乱 | content ディレクトリでは常にブランチを checkout するルール化 |
| fork PR で secrets が使えない | CI で fork PR 時は content 依存ジョブをスキップ |

## CI configuration

```yaml
steps:
  - uses: actions/checkout@v4
    with:
      submodules: true
      ssh-key: ${{ secrets.CONTENT_DEPLOY_KEY }}
```

- deploy key は content repo に read-only で発行
- `git submodule status` を CI で検証し、未初期化・参照不整合を fail

## Consequences

- Pros: シンプルな連携、ビルド再現性、pnpm workspace 廃止によるシンプル化
- Cons: submodule 特有の運用注意点（上記で緩和）

## Re-evaluate when

- submodule の更新忘れが頻発し、開発体験が悪化した場合
- CI の submodule 取得が安定しない場合
- → CI 合成方式（2 repo checkout）への移行を検討
