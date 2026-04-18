/**
 * 記事 HTML の `<head>` 要素に関するスモークテスト（requirements.md §7.2）
 *
 * 検証対象:
 *   - OGP タグ（`og:title`, `og:description`, `og:type=article`, `og:url`）
 *   - ダークモード初期化スクリプト（`document.documentElement.classList.add("dark")` を含む）
 *
 * 備考:
 *   - 対象記事は `dist/blog/hello-world/index.html`（content-sample の安定記事）
 *   - ダークモード FOUC 防止スクリプトは BaseLayout.astro §6.1 で配信される
 */
import { describe, it, expect, beforeAll } from "vitest";
import { load } from "cheerio";
import { fileExists, readDistFile, distExists } from "./helpers";

const TARGET_POST = "blog/hello-world/index.html";

describe("smoke: article <head> (§7.2)", () => {
  beforeAll(() => {
    if (!distExists()) {
      throw new Error(
        "dist/ が存在しません。先に `pnpm build`（または `pnpm test:smoke`）を実行してください。"
      );
    }
  });

  it("対象記事 HTML が存在する（前提）", () => {
    expect(fileExists(TARGET_POST)).toBe(true);
  });

  it("記事 HTML の <head> に og:title / og:description / og:type=article / og:url が含まれる", () => {
    const html = readDistFile(TARGET_POST);
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
    const html = readDistFile(TARGET_POST);
    const $ = load(html);
    const inlineScripts = $("head script:not([src])")
      .toArray()
      .map((el) => $(el).html() ?? "");
    // BaseLayout.astro の FOUC 防止スクリプト内の特徴文字列を検出する。
    // requirements.md §7.2 は「テーマ初期化スクリプト」の存在確認を求めており、
    // 指示で指定された `document.documentElement.classList.add("dark")` を検出キーにする。
    const hasThemeInit = inlineScripts.some((src) =>
      src.includes('document.documentElement.classList.add("dark")')
    );
    expect(hasThemeInit).toBe(true);
  });
});

// T4.1 Pagefind 全文検索のスモークテストは `tests/smoke/pagefind.test.ts` に追加済み。
