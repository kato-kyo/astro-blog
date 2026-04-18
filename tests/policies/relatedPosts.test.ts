import { describe, it, expect } from "vitest";
import { findRelatedPosts } from "../../src/lib/policies/relatedPosts.js";
import { makePostMeta as mk } from "../fixtures/postFactory.js";

describe("findRelatedPosts", () => {
  const target = mk({ slug: "target", tags: ["astro", "typescript"] });

  it("タグ重複度の降順でソートされる", () => {
    const all = [
      target,
      mk({ slug: "a", tags: ["astro"] }),
      mk({ slug: "b", tags: ["astro", "typescript"] }),
      mk({ slug: "c", tags: ["typescript"] }),
    ];
    const related = findRelatedPosts(target, all);
    expect(related.map((p) => p.slug)).toEqual(["b", "a", "c"]);
  });

  it("自己を候補から除外する", () => {
    const all = [target, mk({ slug: "a", tags: ["astro"] })];
    const related = findRelatedPosts(target, all);
    expect(related.find((p) => p.slug === "target")).toBeUndefined();
  });

  it("同点時は公開日降順→slug 昇順", () => {
    const all = [
      target,
      mk({ slug: "a", tags: ["astro"], publishedAt: new Date("2025-01-01") }),
      mk({ slug: "b", tags: ["astro"], publishedAt: new Date("2026-01-01") }),
      mk({ slug: "c", tags: ["astro"], publishedAt: new Date("2026-01-01") }),
    ];
    const related = findRelatedPosts(target, all);
    expect(related.map((p) => p.slug)).toEqual(["b", "c", "a"]);
  });

  it("最大件数を尊重する", () => {
    const all = [
      target,
      ...Array.from({ length: 10 }, (_, i) => mk({ slug: `p${i}`, tags: ["astro"] })),
    ];
    expect(findRelatedPosts(target, all, 3)).toHaveLength(3);
  });

  it("タグなし記事は同一カテゴリの最新から選ぶ", () => {
    const noTagTarget = mk({ slug: "target", tags: [], category: "技術" });
    const all = [
      noTagTarget,
      mk({ slug: "a", tags: [], category: "技術", publishedAt: new Date("2025-01-01") }),
      mk({ slug: "b", tags: [], category: "ライフ", publishedAt: new Date("2026-06-01") }),
      mk({ slug: "c", tags: [], category: "技術", publishedAt: new Date("2026-06-01") }),
    ];
    const related = findRelatedPosts(noTagTarget, all);
    expect(related.map((p) => p.slug)).toEqual(["c", "a"]);
  });
});
