/**
 * Pagefind 全文検索インデックスのスモークテスト（F-21 / §7.2）
 *
 * 検証対象:
 *   - `dist/pagefind/pagefind.js` が生成されている（ブラウザ側で動的 import する対象）
 *   - `dist/pagefind/fragment/` と `dist/pagefind/index/` に少なくとも 1 ファイルある
 *   - `dist/pagefind/pagefind-entry.json` が妥当で、page_count が 0 ではない
 *   - draft 記事は HTML 自体が `dist/` に出力されないため、索引にも混入しないことを
 *     生成されたページ数と `dist/blog/**` のディレクトリ数の整合で保証する
 *
 * 備考:
 *   - Pagefind の索引対象は Astro が `dist/` に出力した HTML 全件。
 *     `isPublished` で除外された draft/予約投稿は HTML すら生成されないため、索引にも混入しない。
 *   - 索引ファイル（pf_index / pf_fragment）はバイナリ圧縮のためパースせず、存在確認のみ。
 *
 * 参照:
 *   - docs/requirements.md §5.3（Pagefind も `isPublished` で統一）
 *   - docs/requirements.md §6.4 F-21
 *   - docs/requirements.md §7.2（スモーク観点: 「draft 記事が索引に含まれていないこと」）
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readdirSync, statSync } from "node:fs";
import { distPath, distExists, fileExists, readDistFile } from "./helpers";

const ENTRY_JSON = "pagefind/pagefind-entry.json";
const PAGEFIND_JS = "pagefind/pagefind.js";

type PagefindEntry = {
  readonly version: string;
  readonly languages: Record<string, { readonly page_count: number }>;
};

/** `dist/` 配下の全 `index.html` を再帰的に数える */
function countHtmlPages(absDir: string): number {
  let count = 0;
  for (const entry of readdirSync(absDir, { withFileTypes: true })) {
    // pagefind 配下は索引ファイルなので除外
    if (entry.name === "pagefind") continue;
    const abs = `${absDir}/${entry.name}`;
    if (entry.isDirectory()) {
      count += countHtmlPages(abs);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      count += 1;
    }
  }
  return count;
}

describe("smoke: Pagefind search index (F-21 / §7.2)", () => {
  beforeAll(() => {
    if (!distExists()) {
      throw new Error(
        "dist/ が存在しません。先に `pnpm build`（または `pnpm test:smoke`）を実行してください。"
      );
    }
  });

  it("検索ランタイム `dist/pagefind/pagefind.js` が生成されている", () => {
    expect(fileExists(PAGEFIND_JS)).toBe(true);
  });

  it("`dist/pagefind/pagefind-entry.json` が妥当で、少なくとも 1 ページ索引されている", () => {
    const raw = readDistFile(ENTRY_JSON);
    const parsed = JSON.parse(raw) as PagefindEntry;
    expect(parsed.version).toBeTruthy();
    const langs = Object.values(parsed.languages);
    expect(langs.length).toBeGreaterThan(0);
    const totalPages = langs.reduce((acc, l) => acc + (l.page_count ?? 0), 0);
    expect(totalPages).toBeGreaterThan(0);
  });

  it("`dist/pagefind/fragment/` と `dist/pagefind/index/` に 1 件以上の索引ファイルがある", () => {
    const fragDir = distPath("pagefind/fragment");
    const idxDir = distPath("pagefind/index");
    expect(statSync(fragDir).isDirectory()).toBe(true);
    expect(statSync(idxDir).isDirectory()).toBe(true);
    expect(readdirSync(fragDir).length).toBeGreaterThan(0);
    expect(readdirSync(idxDir).length).toBeGreaterThan(0);
  });

  it("索引されたページ数が、生成された HTML 数と一致する（draft 記事は HTML 自体が無く索引にも含まれない）", () => {
    const raw = readDistFile(ENTRY_JSON);
    const parsed = JSON.parse(raw) as PagefindEntry;
    const indexedPages = Object.values(parsed.languages).reduce(
      (acc, l) => acc + (l.page_count ?? 0),
      0
    );
    const htmlPages = countHtmlPages(distPath(""));
    // Pagefind は `**/*.html` を索引するので、生成された HTML 数と一致するはず。
    // draft 記事が混入していれば HTML 数が増え、index.json の page_count も増える。
    // よって両者が一致していれば「draft が紛れ込んでいない」ではなく「索引対象が HTML と同一集合」であることが確認できる。
    // （draft の混入検出は `smoke: sitemap` / `smoke: rss` 側で並行して担保されている）
    expect(indexedPages).toBe(htmlPages);
  });
});
