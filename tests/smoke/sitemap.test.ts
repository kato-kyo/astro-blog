/**
 * サイトマップのスモークテスト（requirements.md §7.2）
 *
 * 検証対象:
 *   - `dist/sitemap.xml` が存在
 *   - `<url>` を含む（= 1 件以上の URL が列挙されている）
 *   - draft 記事の URL が混入していないこと
 */
import { describe, it, expect, beforeAll } from "vitest";
import { load } from "cheerio";
import { fileExists, readDistFile, distExists } from "./helpers";

describe("smoke: sitemap (§7.2)", () => {
  beforeAll(() => {
    if (!distExists()) {
      throw new Error(
        "dist/ が存在しません。先に `pnpm build`（または `pnpm test:smoke`）を実行してください。"
      );
    }
  });

  it("`dist/sitemap.xml` が存在する", () => {
    expect(fileExists("sitemap.xml")).toBe(true);
  });

  it("`<url>` タグを 1 件以上含む", () => {
    const xml = readDistFile("sitemap.xml");
    const $ = load(xml, { xmlMode: true });
    const urls = $("url");
    expect(urls.length).toBeGreaterThan(0);
  });

  it("draft slug を含む URL がサイトマップに混入していない", () => {
    // URL パスに "draft" を含むエントリが無いことを確認。
    // content-sample に draft 記事がない現状ではノーオペだが、将来的な
    // リグレッション検出のためロジックは常に走らせる。
    const xml = readDistFile("sitemap.xml");
    const $ = load(xml, { xmlMode: true });
    const draftUrls = $("url > loc")
      .toArray()
      .map((el) => $(el).text())
      .filter((loc) => /draft/i.test(loc));
    expect(draftUrls).toEqual([]);
  });
});
