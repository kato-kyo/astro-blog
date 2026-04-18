/**
 * ページネーションの共通ヘルパー。
 *
 * 要件 (requirements.md §6.5):
 * - 1 ページあたり 10 件
 * - URL: `/blog/`（1 ページ目）, `/blog/page/2/`, `/blog/page/3/`, ...
 * - `<link rel="canonical">`, `<link rel="prev">`, `<link rel="next">` を出力
 * - `/blog/`, `/tags/[tag]/`, `/categories/[category]/` で共通利用
 *
 * 設計方針:
 * - policies レイヤー（純粋関数）。Astro / Content API に依存しない
 * - page は 1-indexed。1 ページ目が `page=1`
 * - 範囲外ページ（page < 1 / page > totalPages）は items を空にして安全に返す
 *   （ページ生成は `buildPagePaths` で行うため、通常は範囲外にはならない）
 */

/** 1 ページあたりの既定件数 */
export const PAGE_SIZE = 10;

/** ページング結果 */
export type PageInfo<T> = {
  readonly items: readonly T[];
  readonly page: number;
  readonly totalPages: number;
  readonly total: number;
  readonly hasPrev: boolean;
  readonly hasNext: boolean;
};

/**
 * 配列を 1-indexed でページ分割する。
 *
 * @param items - 全件配列（イミュータブル扱い。入力は変更しない）
 * @param page - 1-indexed のページ番号（範囲外は items を空にして返す）
 * @param size - 1 ページあたりの件数（既定 {@link PAGE_SIZE}）
 */
export function paginate<T>(
  items: readonly T[],
  page: number,
  size: number = PAGE_SIZE,
): PageInfo<T> {
  const total = items.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / size);

  // page < 1 は 1 ページ目相当に丸める（items は空で返し、明示的に範囲外扱い）
  if (page < 1) {
    return {
      items: [],
      page: 1,
      totalPages,
      total,
      hasPrev: false,
      hasNext: false,
    };
  }

  // page > totalPages の場合、items は空。hasPrev は true を返し、呼び出し側で検知可能にする
  if (page > totalPages) {
    return {
      items: [],
      page,
      totalPages,
      total,
      hasPrev: true,
      hasNext: false,
    };
  }

  const start = (page - 1) * size;
  const end = start + size;
  const sliced = items.slice(start, end);

  return {
    items: sliced,
    page,
    totalPages,
    total,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
}

/**
 * 静的ルート（`/blog/page/[page]/`）を生成する際の page 番号リストを返す。
 *
 * - 1 ページ目（`/blog/`）は除外する
 * - 2 ページ目以降のみ `[2, 3, ..., N]` を返す
 * - 総件数が 1 ページに収まるなら空配列
 *
 * @param total - 全件数
 * @param size - 1 ページあたりの件数（既定 {@link PAGE_SIZE}）
 */
export function buildPagePaths(total: number, size: number = PAGE_SIZE): number[] {
  if (total <= size) return [];
  const totalPages = Math.ceil(total / size);
  const pages: number[] = [];
  for (let p = 2; p <= totalPages; p += 1) {
    pages.push(p);
  }
  return pages;
}
