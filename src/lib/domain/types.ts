/**
 * ドメイン層の型定義。
 *
 * ルール（.claude/rules/lib-architecture.md 参照）:
 * - 外部依存を持たない（Astro/React/Zod/Node.js API の import 禁止）
 * - class を使わず、型 + 関数の関数型スタイル
 */

/** ブログ記事 */
export type Post = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly publishedAt: Date;
  readonly updatedAt?: Date;
  readonly tags: readonly string[];
  readonly category: string;
  readonly author: string;
  readonly draft: boolean;
  readonly heroImage?: string;
  /** 本文 raw Markdown。queries 層が設定する */
  readonly body?: string;
};

/** 一覧表示用。Post から body を除いた軽量な meta */
export type PostMeta = Omit<Post, "body">;

/** 著者 */
export type Author = {
  readonly id: string;
  readonly name: string;
  readonly bio?: string;
  readonly avatarUrl?: string;
  readonly social?: SocialLinks;
};

/** SNSリンク */
export type SocialLinks = {
  readonly github?: string;
  readonly twitter?: string;
  readonly website?: string;
};

/** タグ集計（一覧ページで使用） */
export type TagCount = {
  readonly value: string;
  readonly count: number;
};

/** カテゴリ集計 */
export type CategoryCount = {
  readonly name: string;
  readonly count: number;
};

/** 固定ページ（about / services 等） */
export type Page = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly order?: number;
};

/** ポートフォリオ実績 */
export type Project = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly url?: string;
  readonly tech: readonly string[];
  readonly period: string;
  readonly order?: number;
  readonly heroImage?: string;
};
