import { describe, it, expect } from "vitest";
import {
  sortByPublishedDesc,
  filterByTag,
  filterByCategory,
  countTags,
  countCategories,
} from "../../src/lib/policies/sort.js";
import { makePostMeta as mk } from "../fixtures/postFactory.js";

describe("sortByPublishedDesc", () => {
  it("公開日降順で並び替える", () => {
    const posts = [
      mk({ slug: "old", publishedAt: new Date("2025-01-01") }),
      mk({ slug: "new", publishedAt: new Date("2026-06-01") }),
      mk({ slug: "mid", publishedAt: new Date("2026-01-01") }),
    ];
    const sorted = sortByPublishedDesc(posts);
    expect(sorted.map((p) => p.slug)).toEqual(["new", "mid", "old"]);
  });

  it("同時刻は slug 昇順で安定化する", () => {
    const t = new Date("2026-04-18");
    const posts = [mk({ slug: "c", publishedAt: t }), mk({ slug: "a", publishedAt: t }), mk({ slug: "b", publishedAt: t })];
    const sorted = sortByPublishedDesc(posts);
    expect(sorted.map((p) => p.slug)).toEqual(["a", "b", "c"]);
  });

  it("入力配列を変更しない（イミュータブル）", () => {
    const posts = [mk({ slug: "a", publishedAt: new Date("2025-01-01") }), mk({ slug: "b", publishedAt: new Date("2026-01-01") })];
    const orig = [...posts];
    sortByPublishedDesc(posts);
    expect(posts).toEqual(orig);
  });
});

describe("filterByTag", () => {
  it("指定タグを含む記事のみを返す", () => {
    const posts = [
      mk({ slug: "a", tags: ["astro", "react"] }),
      mk({ slug: "b", tags: ["vue"] }),
      mk({ slug: "c", tags: ["astro"] }),
    ];
    expect(filterByTag(posts, "astro").map((p) => p.slug)).toEqual(["a", "c"]);
  });
});

describe("filterByCategory", () => {
  it("指定カテゴリの記事のみを返す", () => {
    const posts = [
      mk({ slug: "a", category: "技術" }),
      mk({ slug: "b", category: "ライフ" }),
      mk({ slug: "c", category: "技術" }),
    ];
    expect(filterByCategory(posts, "技術").map((p) => p.slug)).toEqual(["a", "c"]);
  });
});

describe("countTags", () => {
  it("タグを件数降順・値昇順で集計する", () => {
    const posts = [
      mk({ slug: "1", tags: ["a", "b"] }),
      mk({ slug: "2", tags: ["a", "c"] }),
      mk({ slug: "3", tags: ["a"] }),
    ];
    const counts = countTags(posts);
    expect(counts).toEqual([
      { value: "a", count: 3 },
      { value: "b", count: 1 },
      { value: "c", count: 1 },
    ]);
  });
});

describe("countCategories", () => {
  it("カテゴリを件数降順で集計する", () => {
    const posts = [
      mk({ slug: "1", category: "技術" }),
      mk({ slug: "2", category: "技術" }),
      mk({ slug: "3", category: "ライフ" }),
    ];
    const counts = countCategories(posts);
    expect(counts).toEqual([
      { name: "技術", count: 2 },
      { name: "ライフ", count: 1 },
    ]);
  });
});
