/**
 * robots.txt (T1.3)
 *
 * 要件 (requirements.md §8.3 環境別の振る舞い):
 * - prod (`PUBLIC_APP_ENV=production`) : `Allow: /` + `Sitemap:` で本番 URL を公開
 * - dev (それ以外) : `Disallow: /` で検索エンジンに索引させない
 *
 * 環境判定は `src/lib/env.ts` の `isDev` を単一真実源として利用する。
 * Sitemap の絶対 URL は `APIRoute` の `site` コンテキスト（astro.config.ts の site 設定）から組み立てる。
 */
import type { APIRoute } from "astro";
import { isDev } from "../lib/env";

function absoluteUrl(site: URL | undefined, path: string): string {
  if (!site) {
    throw new Error(
      "`site` is not configured. Set `site` in astro.config.ts (via PUBLIC_SITE_URL)."
    );
  }
  return new URL(path, site).toString();
}

function renderProd(sitemapUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;
}

function renderDev(): string {
  return `User-agent: *\nDisallow: /\n`;
}

export const GET: APIRoute = ({ site }) => {
  const body = isDev ? renderDev() : renderProd(absoluteUrl(site, "/sitemap.xml"));

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
