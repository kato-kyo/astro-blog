/**
 * 目次（Table of Contents）コンポーネント（F-18）。
 *
 * - h2/h3 のみ対象（h1 は記事タイトルのため除外）
 * - IntersectionObserver で現在位置をハイライト
 * - 折りたたみ可能（本文上部配置。モバイルで邪魔にならないように）
 * - `client:idle` で遅延ハイドレート（ページ読み込みをブロックしない）
 *
 * 参照: docs/requirements.md §6.3 F-18
 */
import { useEffect, useMemo, useRef, useState } from "react";

export type TocHeading = {
  readonly depth: number;
  readonly slug: string;
  readonly text: string;
};

type Props = {
  /** Astro `render()` が返す `headings` をそのまま渡す */
  headings: readonly TocHeading[];
};

const TARGET_DEPTHS = new Set([2, 3]);

export default function ToC({ headings }: Props) {
  const items = useMemo(() => headings.filter((h) => TARGET_DEPTHS.has(h.depth)), [headings]);
  const [activeSlug, setActiveSlug] = useState<string | null>(items[0]?.slug ?? null);
  const [expanded, setExpanded] = useState<boolean>(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // スクロール位置に応じて現在位置をハイライトする。
  // ヘッダー固定分を考慮してルートマージンを上側に寄せる。
  useEffect(() => {
    if (items.length === 0) return;

    const targets = items
      .map((h) => document.getElementById(h.slug))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const visibility = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            visibility.set(e.target.id, e.intersectionRatio);
          } else {
            visibility.delete(e.target.id);
          }
        }
        // 可視な見出しのうち最初に現れる（= ドキュメント順で一番上）ものをアクティブ扱いとする
        const firstVisible = items.find((h) => visibility.has(h.slug));
        if (firstVisible) setActiveSlug(firstVisible.slug);
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: [0, 1],
      },
    );

    for (const el of targets) observer.observe(el);
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="目次" className="mb-8 border border-border rounded-sm bg-surface">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full flex justify-between items-center px-4 py-2 text-sm font-semibold text-text hover:bg-surface-hover"
      >
        <span>目次</span>
        <span aria-hidden="true" className="text-xs text-text-muted">
          {expanded ? "−" : "+"}
        </span>
      </button>
      {expanded && (
        <ol className="px-4 pb-3 pt-1 text-sm list-none">
          {items.map((h) => {
            const isActive = h.slug === activeSlug;
            return (
              <li
                key={h.slug}
                className={h.depth === 3 ? "pl-4" : ""}
              >
                <a
                  href={`#${h.slug}`}
                  aria-current={isActive ? "location" : undefined}
                  className={
                    "block py-1 border-l-2 pl-2 -ml-[2px] " +
                    (isActive
                      ? "border-accent text-accent font-medium"
                      : "border-transparent text-text-secondary hover:text-accent")
                  }
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ol>
      )}
    </nav>
  );
}
