/**
 * 記事データの取得・フィルタ・集計クエリ。
 *
 * ルール (.claude/rules/lib-architecture.md):
 * - Astro Content Collections API はここでのみ使用する
 * - policies の純粋関数を組み合わせてクエリを構成する
 *
 * パフォーマンス:
 * - ビルド時は同一プロセス内で全ページ生成するため、getCollection 結果を
 *   モジュールスコープの Promise でメモ化し、重複実行と再ソートを防ぐ。
 */
import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import type { Post, PostMeta, TagCount, CategoryCount } from "../domain/types.js";
import { assertUniqueSlugs, entryIdToSlug } from "../domain/slug.js";
import { isDev } from "../env.js";
import { isPublished } from "../policies/publish.js";
import {
  sortByPublishedDesc,
  filterByTag,
  filterByCategory,
  countTags,
  countCategories,
} from "../policies/sort.js";
import { toPost, toPostMeta } from "./mappers.js";

type BlogEntry = CollectionEntry<"blog">;

/** ビルド時の公開判定 predicate（全出力先で共通使用） */
function shouldPublish(entry: BlogEntry): boolean {
  if (isDev) return true;
  return isPublished({
    publishedAt: entry.data.publishedAt,
    draft: entry.data.draft,
  });
}

let entriesCache: Promise<BlogEntry[]> | null = null;
let metasCache: Promise<PostMeta[]> | null = null;

/** 公開対象の blog エントリを返す（ビルド内でメモ化される）。getStaticPaths 用 */
export function listPublishedEntries(): Promise<BlogEntry[]> {
  if (!entriesCache) {
    entriesCache = (async () => {
      const entries = await getCollection("blog", shouldPublish);
      assertUniqueSlugs(entries.map((e) => entryIdToSlug(e.id)));
      return entries;
    })();
  }
  return entriesCache;
}

/** 公開済み記事の meta を公開日降順で返す */
export function listPublishedPosts(): Promise<PostMeta[]> {
  if (!metasCache) {
    metasCache = (async () => {
      const entries = await listPublishedEntries();
      return sortByPublishedDesc(entries.map(toPostMeta));
    })();
  }
  return metasCache;
}

/** slug 指定で記事を取得。存在しないか非公開なら null */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const entry = await getEntry("blog", slug);
  if (!entry || !shouldPublish(entry)) return null;
  return toPost(entry);
}

/** タグで記事をフィルタ */
export async function listPostsByTag(tag: string): Promise<PostMeta[]> {
  const all = await listPublishedPosts();
  return filterByTag(all, tag);
}

/** カテゴリで記事をフィルタ */
export async function listPostsByCategory(category: string): Promise<PostMeta[]> {
  const all = await listPublishedPosts();
  return filterByCategory(all, category);
}

/** 全タグを件数付きで取得 */
export async function listAllTags(): Promise<TagCount[]> {
  const all = await listPublishedPosts();
  return countTags(all);
}

/** 全カテゴリを件数付きで取得 */
export async function listAllCategories(): Promise<CategoryCount[]> {
  const all = await listPublishedPosts();
  return countCategories(all);
}
