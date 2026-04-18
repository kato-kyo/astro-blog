/**
 * RSS 2.0 フィード (F-26)
 *
 * 要件 (requirements.md §6.6):
 * - ブログ記事のみを対象（公開済みに限る）
 * - draft / 予約投稿は `isPublished` で除外（listPublishedPosts が保証）
 *
 * ルール (.claude/rules/lib-architecture.md):
 * - `astro:content` は直接 import しない。queries/ 経由でデータを取得する
 */
import type { APIContext } from "astro";
import rss from "@astrojs/rss";
import { getSite, listPublishedPosts } from "../lib/queries";

export async function GET(context: APIContext): Promise<Response> {
  if (!context.site) {
    throw new Error(
      "`site` is not configured. Set `site` in astro.config.ts (via PUBLIC_SITE_URL)."
    );
  }

  const [site, posts] = await Promise.all([getSite(), listPublishedPosts()]);

  return rss({
    title: site.title,
    description: site.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.title,
      link: `/blog/${post.slug}/`,
      pubDate: post.publishedAt,
      description: post.description,
      author: post.author,
    })),
  });
}
