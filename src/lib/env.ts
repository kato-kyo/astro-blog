/**
 * 環境判定の単一真実源。
 *
 * 参照: CLAUDE.md 「## 環境」
 *   - prod(main) では `PUBLIC_APP_ENV=production` を Cloudflare Pages 環境変数で設定
 *   - それ以外は dev 扱い（draft/予約投稿を表示、robots.txt Disallow 等）
 */
export const isDev = import.meta.env.PUBLIC_APP_ENV !== "production";
