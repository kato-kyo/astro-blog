/**
 * 固定ページ（pages コレクション）のクエリ。
 *
 * ルール (.claude/rules/lib-architecture.md):
 * - Astro Content Collections API はここでのみ使用する
 * - ページ側からは本ファイル経由で取得する
 */
import { getEntry, type CollectionEntry } from "astro:content";

type PageEntry = CollectionEntry<"pages">;

/**
 * slug 指定で固定ページのエントリを取得。
 * Astro の `render()` に渡すため、entry をそのまま返す（本文 MDX を展開するため）。
 */
export async function getPageEntryBySlug(slug: string): Promise<PageEntry | null> {
  const entry = await getEntry("pages", slug);
  return entry ?? null;
}
