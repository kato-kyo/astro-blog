/**
 * RSS フィードのスモークテスト（requirements.md §7.2）
 *
 * 検証対象:
 *   - `dist/rss.xml` が存在
 *   - `<item>` を含む（= 1 件以上の公開記事がフィードに載る）
 *   - draft 記事タイトルが混入していないこと
 *
 * 備考: content-sample に draft 記事が含まれない場合、draft 検出ロジックはノーオペ
 *       になるがロジック自体は常に走らせる（将来 draft を追加した瞬間に機能する）。
 */
import { describe, it, expect, beforeAll } from "vitest";
import { load } from "cheerio";
import { fileExists, readDistFile, distExists } from "./helpers";

describe("smoke: RSS feed (§7.2)", () => {
  beforeAll(() => {
    if (!distExists()) {
      throw new Error(
        "dist/ が存在しません。先に `pnpm build`（または `pnpm test:smoke`）を実行してください。"
      );
    }
  });

  it("`dist/rss.xml` が存在する", () => {
    expect(fileExists("rss.xml")).toBe(true);
  });

  it("`<item>` タグを 1 件以上含む", () => {
    const xml = readDistFile("rss.xml");
    const $ = load(xml, { xmlMode: true });
    const items = $("item");
    expect(items.length).toBeGreaterThan(0);
  });

  it("draft 記事タイトル（'draft' を含む）がフィードに混入していない", () => {
    // 大文字小文字を無視して "draft" が含まれる <title> がないことを検証する。
    // content-sample には draft 記事は存在しないため通常は 0 件だが、将来的な
    // リグレッションを早期検出するためロジックは常に実行する。
    const xml = readDistFile("rss.xml");
    const $ = load(xml, { xmlMode: true });
    const draftTitles = $("item > title")
      .toArray()
      .map((el) => $(el).text())
      .filter((t) => /draft/i.test(t));
    expect(draftTitles).toEqual([]);
  });
});
