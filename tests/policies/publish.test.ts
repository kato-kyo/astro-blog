import { describe, it, expect } from "vitest";
import { isPublished } from "../../src/lib/policies/publish.js";

describe("isPublished", () => {
  const now = new Date("2026-04-18T12:00:00+09:00");

  it("draft=true は常に非公開", () => {
    expect(
      isPublished({ publishedAt: new Date("2025-01-01"), draft: true }, now),
    ).toBe(false);
  });

  it("draft=false かつ過去日付なら公開", () => {
    expect(
      isPublished({ publishedAt: new Date("2025-01-01"), draft: false }, now),
    ).toBe(true);
  });

  it("draft=false でも未来日付なら非公開（予約投稿）", () => {
    expect(
      isPublished({ publishedAt: new Date("2099-01-01"), draft: false }, now),
    ).toBe(false);
  });

  it("現在時刻と同時刻は公開対象（境界ケース）", () => {
    expect(
      isPublished({ publishedAt: new Date("2026-04-18T12:00:00+09:00"), draft: false }, now),
    ).toBe(true);
  });

  it("JST 表記の過去日付は公開対象（タイムゾーンを正しく比較する）", () => {
    // publishedAt = 2026-04-18 00:00 JST (= 2026-04-17 15:00 UTC)
    // now        = 2026-04-18 12:00 JST
    // publishedAt は now より過去なので公開対象
    const publishedAt = new Date("2026-04-18T00:00:00+09:00");
    expect(isPublished({ publishedAt, draft: false }, now)).toBe(true);
  });

  it("JST 表記の未来日付は非公開（タイムゾーンを正しく比較する）", () => {
    // publishedAt = 2026-04-18 23:59 JST (now より未来)
    const publishedAt = new Date("2026-04-18T23:59:59+09:00");
    expect(isPublished({ publishedAt, draft: false }, now)).toBe(false);
  });
});
