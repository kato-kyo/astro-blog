/**
 * 公開判定ポリシー。
 *
 * 要件 (requirements.md §5.3):
 * - draft=true の記事は非公開
 * - publishedAt が現在時刻（Asia/Tokyo 基準）より未来の記事は非公開
 * - この関数は単一の真実源として、ページ生成・RSS・サイトマップ・Pagefind で共通使用する
 */

export type PublishInput = {
  readonly publishedAt: Date;
  readonly draft: boolean;
};

/**
 * 記事が公開対象か判定する。
 * @param input - 公開日時と draft フラグ
 * @param now - 現在時刻（テスト時に注入可能）
 */
export function isPublished(input: PublishInput, now: Date = new Date()): boolean {
  if (input.draft) return false;
  return input.publishedAt.getTime() <= now.getTime();
}
