/**
 * サイト全体のメタ情報。
 * ここを単一真実源として Header/Footer/SEO/layout が参照する。
 */
export const SITE = {
  /** サイトタイトル（`<title>` や SEO で使用） */
  title: "astro-blog",
  /** 見出しに表示する著者名 */
  author: "Kyosuke Kato",
  /** 著者名のヘッダー表示（日本語） */
  authorJa: "加藤恭介",
  /** サイト説明（OGP・meta description デフォルト） */
  description: "個人事業主(SWE)向け技術ブログ",
  /** 著者短文（Hero / Footer About） */
  bio: "設計と実装の間を行き来しながら、良いコードについて考えています。",
  /** GitHub プロフィール URL（プレースホルダ。実 URL は後で差し替え） */
  github: "https://github.com/kato-kyo",
} as const;
