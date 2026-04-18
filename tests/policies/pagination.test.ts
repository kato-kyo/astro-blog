import { describe, it, expect } from "vitest";
import {
  PAGE_SIZE,
  paginate,
  buildPagePaths,
} from "../../src/lib/policies/pagination.js";

describe("PAGE_SIZE", () => {
  it("既定のページサイズは 10", () => {
    expect(PAGE_SIZE).toBe(10);
  });
});

describe("paginate", () => {
  const mk = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1);

  it("空配列の 1 ページ目は items=[] / totalPages=1 / hasPrev=hasNext=false", () => {
    const result = paginate([], 1);
    expect(result.items).toEqual([]);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.total).toBe(0);
    expect(result.hasPrev).toBe(false);
    expect(result.hasNext).toBe(false);
  });

  it("1 ページに収まる場合は全件・hasNext=false", () => {
    const items = mk(7);
    const result = paginate(items, 1);
    expect(result.items).toEqual(items);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.total).toBe(7);
    expect(result.hasPrev).toBe(false);
    expect(result.hasNext).toBe(false);
  });

  it("ちょうどページサイズ境界（10 件 / size=10）は 1 ページ", () => {
    const items = mk(10);
    const result = paginate(items, 1);
    expect(result.items).toEqual(items);
    expect(result.totalPages).toBe(1);
    expect(result.hasNext).toBe(false);
  });

  it("11 件 / size=10 は 2 ページ。1 ページ目に 10 件、2 ページ目に 1 件", () => {
    const items = mk(11);
    const p1 = paginate(items, 1);
    expect(p1.items).toEqual(mk(10));
    expect(p1.totalPages).toBe(2);
    expect(p1.hasPrev).toBe(false);
    expect(p1.hasNext).toBe(true);

    const p2 = paginate(items, 2);
    expect(p2.items).toEqual([11]);
    expect(p2.page).toBe(2);
    expect(p2.totalPages).toBe(2);
    expect(p2.hasPrev).toBe(true);
    expect(p2.hasNext).toBe(false);
  });

  it("途中ページは hasPrev=true かつ hasNext=true", () => {
    const items = mk(25);
    const p2 = paginate(items, 2);
    expect(p2.items).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(p2.totalPages).toBe(3);
    expect(p2.hasPrev).toBe(true);
    expect(p2.hasNext).toBe(true);
  });

  it("範囲外ページ（page < 1）は items=[] / page=1 に丸める", () => {
    const items = mk(15);
    const result = paginate(items, 0);
    expect(result.items).toEqual([]);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(2);
    expect(result.hasPrev).toBe(false);
    expect(result.hasNext).toBe(false);
  });

  it("範囲外ページ（page > totalPages）は items=[] / hasNext=false", () => {
    const items = mk(15);
    const result = paginate(items, 99);
    expect(result.items).toEqual([]);
    expect(result.page).toBe(99);
    expect(result.totalPages).toBe(2);
    expect(result.hasPrev).toBe(true);
    expect(result.hasNext).toBe(false);
  });

  it("カスタム size を指定できる", () => {
    const items = mk(7);
    const result = paginate(items, 2, 3);
    expect(result.items).toEqual([4, 5, 6]);
    expect(result.totalPages).toBe(3);
    expect(result.hasPrev).toBe(true);
    expect(result.hasNext).toBe(true);
  });

  it("入力配列を変更しない（イミュータブル）", () => {
    const items = mk(5);
    const orig = [...items];
    paginate(items, 1);
    expect(items).toEqual(orig);
  });
});

describe("buildPagePaths", () => {
  it("total=0 は空配列", () => {
    expect(buildPagePaths(0)).toEqual([]);
  });

  it("1 ページのみ（total <= size）は空配列（1 ページ目は除外）", () => {
    expect(buildPagePaths(5)).toEqual([]);
    expect(buildPagePaths(10)).toEqual([]);
  });

  it("2 ページ以上は 2..N を返す（1 ページ目は除く）", () => {
    expect(buildPagePaths(11)).toEqual([2]);
    expect(buildPagePaths(25)).toEqual([2, 3]);
    expect(buildPagePaths(31)).toEqual([2, 3, 4]);
  });

  it("カスタム size を指定できる", () => {
    expect(buildPagePaths(7, 3)).toEqual([2, 3]);
    expect(buildPagePaths(6, 3)).toEqual([2]);
  });
});
