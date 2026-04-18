import { describe, it, expect } from "vitest";
import { toSlug, entryIdToSlug, assertUniqueSlugs } from "../../src/lib/domain/slug.js";

describe("toSlug", () => {
  it("ASCII 小文字化", () => {
    expect(toSlug("Hello World")).toBe("hello-world");
  });

  it("全角英数字を半角に正規化する", () => {
    expect(toSlug("Ａｓｔｒｏ")).toBe("astro");
  });

  it("空白はハイフンに統一、連続ハイフンは1つにまとめる", () => {
    expect(toSlug("  multiple   spaces  ")).toBe("multiple-spaces");
  });

  it("URL 不適切文字を除去する", () => {
    expect(toSlug("foo/bar?baz#qux")).toBe("foobarbazqux");
  });

  it("日本語は保持する（URL エンコードは呼び出し側）", () => {
    expect(toSlug("技術 ブログ")).toBe("技術-ブログ");
  });

  it("NFC 正規化を適用する", () => {
    const nfd = "が".normalize("NFD");
    expect(toSlug(nfd)).toBe("が");
  });

  it("空文字列は空文字列を返す", () => {
    expect(toSlug("")).toBe("");
  });
});

describe("entryIdToSlug", () => {
  it(".md 拡張子を剥がす", () => {
    expect(entryIdToSlug("hello.md")).toBe("hello");
  });

  it(".mdx 拡張子を剥がす", () => {
    expect(entryIdToSlug("hello.mdx")).toBe("hello");
  });

  it("拡張子がない場合はそのまま", () => {
    expect(entryIdToSlug("hello")).toBe("hello");
  });

  it("ディレクトリ階層を保つ", () => {
    expect(entryIdToSlug("2026/my-post.md")).toBe("2026/my-post");
  });
});

describe("assertUniqueSlugs", () => {
  it("重複なしなら throw しない", () => {
    expect(() => assertUniqueSlugs(["a", "b", "c"])).not.toThrow();
  });

  it("重複があれば throw する", () => {
    expect(() => assertUniqueSlugs(["a", "b", "a"])).toThrow(/Duplicate slug detected: a/);
  });

  it("空配列は throw しない", () => {
    expect(() => assertUniqueSlugs([])).not.toThrow();
  });
});
