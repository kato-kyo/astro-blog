/**
 * Content Collections のエントリをドメイン型に変換するマッパー。
 * この層のみが `astro:content` の型を import してよい。
 */
import type { CollectionEntry } from "astro:content";
import type { Post, PostMeta, Author, Page, Project } from "../domain/types.js";
import { entryIdToSlug } from "../domain/slug.js";

export function toPostMeta(entry: CollectionEntry<"blog">): PostMeta {
  return {
    slug: entryIdToSlug(entry.id),
    title: entry.data.title,
    description: entry.data.description,
    publishedAt: entry.data.publishedAt,
    updatedAt: entry.data.updatedAt,
    tags: entry.data.tags,
    category: entry.data.category,
    author: entry.data.author.id,
    draft: entry.data.draft,
    heroImage: entry.data.heroImage,
  };
}

export function toPost(entry: CollectionEntry<"blog">, body?: string): Post {
  return { ...toPostMeta(entry), body };
}

export function toAuthor(entry: CollectionEntry<"authors">): Author {
  return {
    id: entry.data.id,
    name: entry.data.name,
    bio: entry.data.bio,
    avatarUrl: entry.data.avatarUrl,
    social: entry.data.social,
  };
}

export function toPage(entry: CollectionEntry<"pages">): Page {
  return {
    slug: entryIdToSlug(entry.id),
    title: entry.data.title,
    description: entry.data.description,
    order: entry.data.order,
  };
}

export function toProject(entry: CollectionEntry<"projects">): Project {
  return {
    slug: entryIdToSlug(entry.id),
    title: entry.data.title,
    description: entry.data.description,
    url: entry.data.url,
    tech: entry.data.tech,
    period: entry.data.period,
    order: entry.data.order,
    heroImage: entry.data.heroImage,
  };
}
