/**
 * Pagefind 全文検索モーダル（F-21 / T4.1）。
 *
 * - 自作軽量 UI + Pagefind JavaScript API（`/pagefind/pagefind.js`）の組合せ。
 *   公式の Pagefind UI（CSS 同梱）は使わず、GP 風クラシックスタイルに揃える。
 * - `client:idle` 前提。Pagefind JS は `import()` 動的読込で、モーダル初回オープン時のみ取得する。
 * - キーボード:
 *   - `/` または `Ctrl+K` / `Cmd+K` でオープン（input/textarea にフォーカスが無いときのみ）
 *   - `Esc` でクローズ
 * - dev の `astro dev` では `/pagefind/pagefind.js` が存在しない（build 後にのみ生成される）。
 *   動的 import の失敗は握りつぶし、「検索インデックスが見つかりません」と表示する。
 *
 * 参照:
 * - docs/requirements.md F-21 / §7.2
 * - docs/design.md §4.2 / §5.3 / §8.2
 */
import { useCallback, useEffect, useRef, useState } from "react";

// Pagefind の型定義（公式は提供していないため最小限を手書き）
type PagefindSubResult = {
  readonly url: string;
  readonly title: string;
  readonly excerpt: string;
};
type PagefindResult = {
  readonly id: string;
  readonly data: () => Promise<{
    readonly url: string;
    readonly meta: { readonly title?: string } & Record<string, unknown>;
    readonly excerpt: string;
    readonly sub_results?: readonly PagefindSubResult[];
  }>;
};
type PagefindSearchResponse = {
  readonly results: readonly PagefindResult[];
};
type PagefindApi = {
  readonly search: (query: string) => Promise<PagefindSearchResponse>;
};

type SearchProps = Readonly<Record<string, unknown>>;

const MODAL_ID = "search-modal";
const MAX_RESULTS = 10;
const DEBOUNCE_MS = 200;

/** Pagefind JS を遅延読込する。失敗（dev 環境等）時は null。 */
async function loadPagefind(): Promise<PagefindApi | null> {
  try {
    // Pagefind JS は build 後のみ `dist/pagefind/pagefind.js` として Astro が配信する。
    // ビルド時点では存在しないため、Vite による解析と TS の型解決を同時に回避する目的で
    // URL を変数経由で組み立てる（文字列リテラル直書きは ts(2307) / Vite 解析の対象になる）。
    const url = new URL("/pagefind/pagefind.js", window.location.href).toString();
    const mod: unknown = await import(/* @vite-ignore */ url);
    if (
      mod &&
      typeof mod === "object" &&
      "search" in mod &&
      typeof (mod as PagefindApi).search === "function"
    ) {
      return mod as PagefindApi;
    }
    return null;
  } catch (_e) {
    return null;
  }
}

type ResultItem = {
  readonly id: string;
  readonly url: string;
  readonly title: string;
  readonly excerpt: string;
};

export default function Search(_props: SearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<readonly ResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [indexReady, setIndexReady] = useState<boolean | null>(null);
  const pagefindRef = useRef<PagefindApi | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  // グローバルショートカット: `/` or Ctrl/Cmd+K で open、Esc で close
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (!isOpen) {
        const isSlash = event.key === "/";
        const isCtrlK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
        if ((isSlash && !isTyping) || isCtrlK) {
          event.preventDefault();
          lastFocusRef.current =
            (document.activeElement as HTMLElement | null) ?? null;
          setIsOpen(true);
        }
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    // Astro 側のトリガーから発行されるカスタムイベントでも開く
    const onOpenEvent = () => {
      lastFocusRef.current = (document.activeElement as HTMLElement | null) ?? null;
      setIsOpen(true);
    };
    window.addEventListener("astro-blog:open-search", onOpenEvent);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("astro-blog:open-search", onOpenEvent);
    };
  }, [isOpen]);

  // オープン時: Pagefind を（未ロードなら）読み込み、入力欄へフォーカス
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    (async () => {
      if (!pagefindRef.current) {
        const api = await loadPagefind();
        if (cancelled) return;
        pagefindRef.current = api;
        setIndexReady(api !== null);
      } else {
        setIndexReady(true);
      }
    })();

    // 次フレームでフォーカス（マウント直後だと失敗することがある）
    const raf = requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [isOpen]);

  // クローズ時: 開いた元の要素にフォーカスを戻す
  useEffect(() => {
    if (isOpen) return;
    const prev = lastFocusRef.current;
    if (prev && typeof prev.focus === "function") {
      prev.focus();
    }
  }, [isOpen]);

  // クエリ変更 → デバウンスして検索
  useEffect(() => {
    if (!isOpen) return;

    const api = pagefindRef.current;
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    if (!api) {
      // インデックス未ロード（dev 環境等）では検索できない
      return;
    }

    setIsLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await api.search(trimmed);
        const top = res.results.slice(0, MAX_RESULTS);
        const resolved = await Promise.all(top.map((r) => r.data()));
        const mapped: ResultItem[] = resolved.map((d, i) => ({
          id: top[i]!.id,
          url: d.url,
          title:
            (typeof d.meta.title === "string" && d.meta.title.length > 0
              ? d.meta.title
              : d.url) ?? d.url,
          excerpt: d.excerpt,
        }));
        setResults(mapped);
      } catch (_e) {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [query, isOpen]);

  const handleBackdropClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    // モーダル本体ではなくバックドロップをクリックした時のみ閉じる
    if (event.target === event.currentTarget) setIsOpen(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${MODAL_ID}-title`}
      id={MODAL_ID}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[5vh] sm:pt-[10vh] pb-4 overflow-y-auto"
    >
      <div className="w-full max-w-2xl max-h-[calc(100vh-5rem)] bg-bg border border-border rounded-md shadow-[0_10px_30px_rgba(0,0,0,0.12)] flex flex-col">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
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
            className="text-text-muted"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <label htmlFor={`${MODAL_ID}-input`} className="sr-only" id={`${MODAL_ID}-title`}>
            サイト内検索
          </label>
          <input
            id={`${MODAL_ID}-input`}
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="記事を検索..."
            autoComplete="off"
            className="flex-1 bg-transparent text-[16px] outline-none placeholder:text-text-muted"
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="検索を閉じる"
            className="text-text-muted hover:text-text px-2 text-sm"
          >
            Esc
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {indexReady === false && (
            <p className="px-4 py-6 text-sm text-text-muted">
              検索インデックスが見つかりません（`pnpm build` 後に利用可能になります）。
            </p>
          )}
          {indexReady !== false && !query.trim() && (
            <p className="px-4 py-6 text-sm text-text-muted">
              キーワードを入力してください。
            </p>
          )}
          {indexReady !== false && query.trim() && isLoading && results.length === 0 && (
            <p className="px-4 py-6 text-sm text-text-muted">検索中...</p>
          )}
          {indexReady !== false && query.trim() && !isLoading && results.length === 0 && (
            <p className="px-4 py-6 text-sm text-text-muted">
              該当する記事が見つかりませんでした。
            </p>
          )}
          {results.length > 0 && (
            <ul className="list-none p-0 m-0">
              {results.map((r) => (
                <li key={r.id} className="border-b border-border last:border-b-0">
                  <a
                    href={r.url}
                    className="block px-4 py-3 hover:bg-bg-secondary no-underline"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="text-[15px] font-semibold text-text">{r.title}</div>
                    <div
                      className="text-[13px] text-text-secondary mt-1 leading-snug"
                      dangerouslySetInnerHTML={{ __html: r.excerpt }}
                    />
                    <div className="text-[12px] text-text-muted mt-1">{r.url}</div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
