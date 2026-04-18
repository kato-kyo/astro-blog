/**
 * slug 正規化・変換・一意性検証。外部依存なしの純粋関数のみを提供する。
 */

/**
 * 表示名から URL slug を生成する。
 *
 * ルール:
 * - NFC 正規化（ひらがな濁点の合成形）
 * - lowercase
 * - 全角英数 → 半角（`！` `１` `Ａ` 等）
 * - 空白はハイフンへ、連続するハイフンは1つへ
 * - URL 不適切文字（`/`, `?`, `#` 等）を除去
 * - 日本語は保持（URL エンコードは呼び出し側で行う）
 */
export function toSlug(input: string): string {
  const normalized = input
    .normalize("NFC")
    .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .toLowerCase()
    .trim();

  return normalized
    .replace(/[\s_]+/g, "-")
    .replace(/[\\/?#&%]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Content Collection のエントリ ID から slug を抽出する。
 * Astro glob loader は `entry.id` に拡張子を含めて返す場合があるため統一する。
 */
export function entryIdToSlug(id: string): string {
  return id.replace(/\.mdx?$/, "");
}

/**
 * slug のリストが一意であることを保証する。
 * 重複があれば最初の重複を含むエラーを投げる。
 * ビルド時に content.config の schema 違反と併せて検出したいため、
 * queries 層で最初の記事取得時に1回だけ呼び出す想定。
 */
export function assertUniqueSlugs(slugs: readonly string[]): void {
  const seen = new Set<string>();
  for (const slug of slugs) {
    if (seen.has(slug)) {
      throw new Error(`Duplicate slug detected: ${slug}`);
    }
    seen.add(slug);
  }
}
