// テストで使用する PostMeta のビルダー。
// vitest は `tests/**/*.test.ts` のみを拾う設定なので、このファイル自体はテスト対象外。
import type { PostMeta } from "../../src/lib/domain/types.js";

export function makePostMeta(overrides: Partial<PostMeta> = {}): PostMeta {
  return {
    slug: "sample",
    title: "Sample",
    description: "desc",
    publishedAt: new Date("2026-01-01"),
    tags: [],
    category: "技術",
    author: "kyosuke",
    draft: false,
    ...overrides,
  };
}
