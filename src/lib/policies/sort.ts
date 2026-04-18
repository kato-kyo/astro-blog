/**
 * ソート・集計の純粋関数群。
 * queries 層・presentation 層から共通で使用する。
 */
import type { PostMeta, TagCount, CategoryCount } from "../domain/types.js";

type HasDateAndSlug = { publishedAt: Date; slug: string };

/**
 * tie-breaker 共通コンパレータ: 公開日降順 → slug 昇順。
 * sortByPublishedDesc / findRelatedPosts などから共通で参照する。
 */
export function byPublishedDescThenSlug<T extends HasDateAndSlug>(a: T, b: T): number {
  const diff = b.publishedAt.getTime() - a.publishedAt.getTime();
  if (diff !== 0) return diff;
  return a.slug.localeCompare(b.slug);
}

/** 公開日降順でソートする（同時刻は slug 昇順で安定化）。入力を変更しない */
export function sortByPublishedDesc<T extends HasDateAndSlug>(posts: readonly T[]): T[] {
  return [...posts].sort(byPublishedDescThenSlug);
}

/** 指定タグを含む記事のみを返す */
export function filterByTag(posts: readonly PostMeta[], tag: string): PostMeta[] {
  return posts.filter((p) => p.tags.includes(tag));
}

/** 指定カテゴリの記事のみを返す */
export function filterByCategory(posts: readonly PostMeta[], category: string): PostMeta[] {
  return posts.filter((p) => p.category === category);
}

/** 全タグを件数付きで集計し、件数降順・値昇順で返す */
export function countTags(posts: readonly PostMeta[]): TagCount[] {
  const map = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.tags) {
      map.set(t, (map.get(t) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.value.localeCompare(b.value);
    });
}

/** 全カテゴリを件数付きで集計し、件数降順・名前昇順で返す */
export function countCategories(posts: readonly PostMeta[]): CategoryCount[] {
  const map = new Map<string, number>();
  for (const p of posts) {
    map.set(p.category, (map.get(p.category) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    });
}
