/**
 * サイト全体のメタ情報（title / author / bio / github 等）の取得。
 *
 * 実体は content collection `site` の `id: "default"` エントリ。
 * content-sample/config/site.json（または submodule 時は content/config/site.json）から読み込む。
 *
 * ビルド時は一度だけ読み込んでメモ化する。
 */
import { getEntry, type CollectionEntry } from "astro:content";

export type Site = CollectionEntry<"site">["data"];

let siteCache: Promise<Site> | null = null;

export function getSite(): Promise<Site> {
  if (!siteCache) {
    siteCache = (async () => {
      const entry = await getEntry("site", "default");
      if (!entry) {
        throw new Error(
          "site config not found. Expected a `default` entry in `${CONTENT_ROOT}/config/site.json`.",
        );
      }
      return entry.data;
    })();
  }
  return siteCache;
}
