/**
 * ダークモード切替トグル（F-22 / T3.1）。
 *
 * - `<head>` のインラインスクリプト（BaseLayout.astro §6.1）で初期テーマは既に適用済み。
 *   本コンポーネントは**切替操作**のみを担う。
 * - `client:load` 前提: ページ表示直後から操作可能でなければならないため。
 *   `client:idle` / `client:visible` は NG（操作遅延 / FOUC 補助外の問題）。
 * - 状態の一次情報は常に `document.documentElement.classList.contains("dark")`。
 *   React state はその反映用。localStorage との同期も明示的に行う。
 *
 * 参照:
 * - docs/requirements.md F-22
 * - docs/design.md §5.3, §6
 */
import { useEffect, useState } from "react";

// 本コンポーネントはユーザー入力用 props を取らない。
// `Record<string, never>` は厳しすぎて Astro の `client:*` 属性と衝突するため、
// 空オブジェクト型を採用する（`.claude/rules/coding-standards.md` の TS 規約準拠）。
type Props = Readonly<Record<string, unknown>>;

const STORAGE_KEY = "theme";

/** DOM を参照できるか（SSR 時は false） */
const canUseDom = typeof document !== "undefined";

function readDomIsDark(): boolean {
  if (!canUseDom) return false;
  return document.documentElement.classList.contains("dark");
}

function applyTheme(nextDark: boolean): void {
  const root = document.documentElement;
  root.classList.toggle("dark", nextDark);
  root.style.colorScheme = nextDark ? "dark" : "light";
  try {
    localStorage.setItem(STORAGE_KEY, nextDark ? "dark" : "light");
  } catch (_e) {
    /* localStorage が使えない環境は記憶を諦める（セッション内のみ有効） */
  }
}

export default function ThemeToggle(_props: Props) {
  // SSR 時は false で初期化し、hydration 直後に実 DOM と同期する。
  // `<head>` スクリプトが既にクラスを付けているため、ここで取得しても正しい。
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    setIsDark(readDomIsDark());
  }, []);

  const handleToggle = () => {
    const next = !readDomIsDark();
    applyTheme(next);
    setIsDark(next);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="テーマ切替"
      aria-pressed={isDark}
      title={isDark ? "ライトモードに切替" : "ダークモードに切替"}
      className="inline-flex items-center justify-center w-9 h-9 rounded-sm text-header-text opacity-90 hover:opacity-100 hover:bg-bg-secondary transition-colors"
    >
      {isDark ? (
        // Sun icon: ダーク時に表示（クリックでライトに戻す）
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        // Moon icon: ライト時に表示（クリックでダークへ切替）
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
