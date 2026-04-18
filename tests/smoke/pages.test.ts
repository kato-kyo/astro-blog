/**
 * ビルド成果物 HTML ページの存在確認スモークテスト（T2.5 / requirements.md §7.2）
 *
 * 検証対象:
 *   - `dist/index.html`（トップ）
 *   - `dist/blog/index.html`（ブログ一覧）
 *   - `dist/about/index.html`（自己紹介）
 */
import { describe, it, expect, beforeAll } from "vitest";
import { distExists, fileExists } from "./helpers";

describe("smoke: HTML pages (§7.2)", () => {
  beforeAll(() => {
    if (!distExists()) {
      throw new Error(
        "dist/ が存在しません。先に `pnpm build`（または `pnpm test:smoke`）を実行してください。"
      );
    }
  });

  it("トップページ `dist/index.html` が存在する", () => {
    expect(fileExists("index.html")).toBe(true);
  });

  it("ブログ一覧 `dist/blog/index.html` が存在する", () => {
    expect(fileExists("blog/index.html")).toBe(true);
  });

  it("自己紹介 `dist/about/index.html` が存在する", () => {
    expect(fileExists("about/index.html")).toBe(true);
  });
});
