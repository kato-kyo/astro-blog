import { describe, it, expect } from "vitest";
import { estimateReadingTime } from "../../src/lib/policies/readingTime.js";

describe("estimateReadingTime", () => {
  it("空文字列は 0 分", () => {
    expect(estimateReadingTime("")).toBe(0);
    expect(estimateReadingTime("   \n\t")).toBe(0);
  });

  it("日本語 500 文字が約 1 分", () => {
    const text = "あ".repeat(500);
    expect(estimateReadingTime(text)).toBe(1);
  });

  it("日本語 1000 文字が約 2 分", () => {
    const text = "あ".repeat(1000);
    expect(estimateReadingTime(text)).toBe(2);
  });

  it("英単語 250 語が約 1 分", () => {
    const text = "word ".repeat(250);
    expect(estimateReadingTime(text)).toBe(1);
  });

  it("日英混在を合算する", () => {
    // 日本語 500 文字 + 英語 250 語 ≒ 1 + 1 = 2 分
    const jp = "あ".repeat(500);
    const en = "word ".repeat(250);
    expect(estimateReadingTime(jp + en)).toBe(2);
  });

  it("極短文でも 1 分として返す（0 にしない）", () => {
    expect(estimateReadingTime("hi")).toBe(1);
  });
});
