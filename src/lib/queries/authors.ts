/**
 * authors コレクションのクエリ。
 *
 * ルール (.claude/rules/lib-architecture.md):
 * - Astro Content Collections API はここでのみ使用する
 * - ページ側からは本ファイル経由で取得する
 */
import { getEntry } from "astro:content";
import type { Author } from "../domain/types.js";
import { toAuthor } from "./mappers.js";

/** id 指定で著者エントリを取得。存在しなければ null */
export async function getAuthorById(id: string): Promise<Author | null> {
  const entry = await getEntry("authors", id);
  return entry ? toAuthor(entry) : null;
}
