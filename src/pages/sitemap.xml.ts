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
 *   - `/`            トップ
 *   - `/blog/`       ブログ一覧
 *   - `/blog/<slug>/` 各記事
 *   ※ `/tags/`, `/categories/` は未実装のため本 sitemap では含めない
 */
import type { APIRoute } from "astro";
import { listPublishedPosts } from "../lib/queries";

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
  const posts = await listPublishedPosts();

  const urls: SitemapUrl[] = [
    { loc: absoluteUrl(site, "/") },
    { loc: absoluteUrl(site, "/blog/") },
    ...posts.map((post) => ({
      loc: absoluteUrl(site, `/blog/${post.slug}/`),
      lastmod: (post.updatedAt ?? post.publishedAt).toISOString(),
    })),
  ];

  return new Response(toXml(urls), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
