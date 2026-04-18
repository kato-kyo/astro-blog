/**
 * サイト全体のナビゲーション定義。
 * Header / Footer / モバイルメニュー から共通で参照する。
 */
export type NavItem = { href: string; label: string };

export const MAIN_NAV: readonly NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/blog/", label: "Blog" },
  { href: "/tags/", label: "Tags" },
  { href: "/categories/", label: "Categories" },
  { href: "/projects/", label: "Projects" },
  { href: "/about/", label: "About" },
] as const;

/** Footer に並べる主要リンク（Home は省く） */
export const FOOTER_NAV: readonly NavItem[] = MAIN_NAV.filter((item) => item.href !== "/");
