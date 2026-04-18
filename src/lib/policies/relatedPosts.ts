/**
 * 関連記事アルゴリズム。
 *
 * 要件 (requirements.md §6.3):
 * - スコア: 共通タグ数
 * - 同点時 tie-breaker: 公開日降順 → slug 昇順
 * - 自己排除
 * - タグなし時のフォールバック: 同一カテゴリの最新記事
 */
import type { PostMeta } from "../domain/types.js";
import { byPublishedDescThenSlug } from "./sort.js";

export const DEFAULT_RELATED_LIMIT = 5;

export function findRelatedPosts(
  target: PostMeta,
  all: readonly PostMeta[],
  limit: number = DEFAULT_RELATED_LIMIT,
): PostMeta[] {
  const candidates = all.filter((p) => p.slug !== target.slug);

  if (target.tags.length === 0) {
    return candidates
      .filter((p) => p.category === target.category)
      .sort(byPublishedDescThenSlug)
      .slice(0, limit);
  }

  const targetTags = new Set(target.tags);
  return candidates
    .map((p) => ({
      post: p,
      score: p.tags.filter((t) => targetTags.has(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return byPublishedDescThenSlug(a.post, b.post);
    })
    .slice(0, limit)
    .map((x) => x.post);
}
