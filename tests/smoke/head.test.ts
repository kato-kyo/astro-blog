/**
 * 記事 HTML の `<head>` 要素に関するスモークテスト（requirements.md §7.2）
 *
 * 検証対象:
 *   - OGP タグ（`og:title`, `og:description`, `og:type=article`, `og:url`）
 *   - ダークモード初期化スクリプト（`document.documentElement.classList.add("dark")` を含む）
 *
 * 備考:
 *   - 対象は `dist/blog/` 配下の任意の記事 1 件を動的に選択
 *     （特定記事に依存せず、記事が存在すれば成立する汎用 smoke 検証）
 *   - ダークモード FOUC 防止スクリプトは BaseLayout.astro §6.1 で配信される
 */
import { describe, it, expect, beforeAll } from "vitest";
import { load } from "cheerio";
import { readDistFile, distExists, findFirstArticleHtml } from "./helpers";

describe("smoke: article <head> (§7.2)", () => {
  let targetPost: string;

  beforeAll(() => {
    if (!distExists()) {
      throw new Error(
        "dist/ が存在しません。先に `pnpm build`（または `pnpm test:smoke`）を実行してください。"
      );
    }
    const found = findFirstArticleHtml();
    if (!found) {
      throw new Error("dist/blog/ 配下に記事が見つかりません。");
    }
    targetPost = found;
  });

  it("記事 HTML の <head> に og:title / og:description / og:type=article / og:url が含まれる", () => {
    const html = readDistFile(targetPost);
    const $ = load(html);
    const ogTitle = $('head meta[property="og:title"]').attr("content");
    const ogDesc = $('head meta[property="og:description"]').attr("content");
    const ogType = $('head meta[property="og:type"]').attr("content");
    const ogUrl = $('head meta[property="og:url"]').attr("content");
    expect(ogTitle).toBeTruthy();
    expect(ogDesc).toBeTruthy();
    expect(ogType).toBe("article");
    expect(ogUrl).toBeTruthy();
  });

  it("記事 HTML の <head> にダークモード初期化スクリプトが含まれる", () => {
    const html = readDistFile(targetPost);
    const $ = load(html);
    const inlineScripts = $("head script:not([src])")
      .toArray()
      .map((el) => $(el).html() ?? "");
    const hasThemeInit = inlineScripts.some((src) =>
      src.includes('document.documentElement.classList.add("dark")')
    );
    expect(hasThemeInit).toBe(true);
  });
});

// T4.1 Pagefind 全文検索のスモークテストは `tests/smoke/pagefind.test.ts` に追加済み。
