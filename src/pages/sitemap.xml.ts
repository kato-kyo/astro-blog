/**
 * sitemap.xml (F-25)
 *
 * 要件 (requirements.md §6.6):
 * - 全公開ページの URL を列挙する
 * - draft / 予約投稿は `isPublished` で除外（listPublishedPosts が保証）
 *
 * ルール (.claude/rules/lib-architecture.md):
 * - `astro:content` は直接 import しない。queries/ 経由でデータを取得する
 *
 * 対象 URL:
 *   - `/`                       トップ
 *   - `/blog/`                  ブログ一覧
 *   - `/blog/<slug>/`           各記事
 *   - `/tags/`                  タグ一覧
 *   - `/tags/<tag>/`            タグ別記事一覧
 *   - `/categories/`            カテゴリ一覧
 *   - `/categories/<category>/` カテゴリ別記事一覧
 */
import type { APIRoute } from "astro";
import { listAllCategories, listAllTags, listPublishedPosts } from "../lib/queries";

type SitemapUrl = {
  readonly loc: string;
  readonly lastmod?: string;
};

function toXml(urls: readonly SitemapUrl[]): string {
  const body = urls
    .map(({ loc, lastmod }) => {
      const lastmodTag = lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : "";
      return `  <url>\n    <loc>${loc}</loc>\n${lastmodTag}  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function absoluteUrl(site: URL | undefined, path: string): string {
  if (!site) {
    throw new Error(
      "`site` is not configured. Set `site` in astro.config.ts (via PUBLIC_SITE_URL)."
    );
  }
  return new URL(path, site).toString();
}

export const GET: APIRoute = async ({ site }) => {
  const [posts, tags, categories] = await Promise.all([
    listPublishedPosts(),
    listAllTags(),
    listAllCategories(),
  ]);

  const urls: SitemapUrl[] = [
    { loc: absoluteUrl(site, "/") },
    { loc: absoluteUrl(site, "/blog/") },
    ...posts.map((post) => ({
      loc: absoluteUrl(site, `/blog/${post.slug}/`),
      lastmod: (post.updatedAt ?? post.publishedAt).toISOString(),
    })),
    { loc: absoluteUrl(site, "/tags/") },
    ...tags.map((t) => ({ loc: absoluteUrl(site, `/tags/${t.value}/`) })),
    { loc: absoluteUrl(site, "/categories/") },
    ...categories.map((c) => ({ loc: absoluteUrl(site, `/categories/${c.name}/`) })),
  ];

  return new Response(toXml(urls), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
