/**
 * Content Collections 定義。
 *
 * 参照ルール:
 * - Zod は必ず `astro/zod` から import（`zod` 単体パッケージではない）
 * - `CONTENT_ROOT` 環境変数があればそれを優先。なければ submodule → content-sample の順でフォールバック
 * - requirements.md §5 のスキーマに準拠
 */
import { defineCollection, reference } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";
import { existsSync } from "node:fs";

function resolveContentRoot(): string {
  const fromEnv = process.env.CONTENT_ROOT?.trim();
  if (fromEnv) return fromEnv;
  return existsSync("./content/blog") ? "./content" : "./content-sample";
}

const contentRoot = resolveContentRoot();

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: `${contentRoot}/blog` }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().min(1),
    author: reference("authors"),
    draft: z.boolean().default(false),
    heroImage: z.string().optional(),
  }),
});

const authors = defineCollection({
  loader: file(`${contentRoot}/authors/authors.json`),
  schema: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    bio: z.string().optional(),
    avatarUrl: z.string().optional(),
    social: z
      .object({
        github: z.string().optional(),
        twitter: z.string().optional(),
        website: z.string().optional(),
      })
      .optional(),
  }),
});

/**
 * 固定ページ（about / services 等）。
 * requirements.md §5.1 pages コレクション参照。
 */
const pages = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: `${contentRoot}/pages` }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    order: z.number().optional(),
  }),
});

/**
 * ポートフォリオ実績（F-09）。
 * requirements.md §5.1 projects コレクション参照。
 */
const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: `${contentRoot}/projects` }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    url: z.url().optional(),
    tech: z.array(z.string()).default([]),
    period: z.string().min(1),
    order: z.number().optional(),
    heroImage: z.string().optional(),
  }),
});

/**
 * サイト全体のメタ情報。
 * content-sample/config/site.json（または content/config/site.json）から読み込む。
 * `id: "default"` のエントリを唯一の singleton として扱う。
 */
const site = defineCollection({
  loader: file(`${contentRoot}/config/site.json`),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    author: z.string().min(1),
    authorJa: z.string().min(1),
    bio: z.string().min(1),
    github: z.url(),
  }),
});

export const collections = { blog, authors, pages, projects, site };
