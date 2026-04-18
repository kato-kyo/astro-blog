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

export const collections = { blog, authors };
