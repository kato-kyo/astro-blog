/**
 * 読了時間の推定。
 *
 * 要件 (requirements.md §4.2): 日本語は約 500 文字/分
 * 英単語混在時は単語数も加味する。
 */

const JA_CHARS_PER_MIN = 500;
const EN_WORDS_PER_MIN = 250;

// CJK 文字（漢字・ひらがな・カタカナ）を検出する。
const CJK_PATTERN = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu;

/**
 * 文字列から読了時間（分）を推定する。
 * 日本語文字と英単語を別々にカウントし、合計の分数を返す。
 * 本文が空なら 0 を、極短文でも 1 分として返す。
 */
export function estimateReadingTime(text: string): number {
  if (!text.trim()) return 0;

  const jaMatches = text.match(CJK_PATTERN);
  const jaChars = jaMatches?.length ?? 0;

  const enMatches = text.replace(CJK_PATTERN, " ").match(/[A-Za-z]+/g);
  const enWords = enMatches?.length ?? 0;

  const minutes = jaChars / JA_CHARS_PER_MIN + enWords / EN_WORDS_PER_MIN;
  if (minutes === 0) return 0;
  return Math.max(1, Math.ceil(minutes));
}
