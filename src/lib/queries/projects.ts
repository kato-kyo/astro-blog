/**
 * ポートフォリオ実績（projects コレクション）のクエリ。
 *
 * ルール (.claude/rules/lib-architecture.md):
 * - Astro Content Collections API はここでのみ使用する
 * - ソート順: `order` 昇順（未指定は末尾）→ タイトル昇順で安定ソート
 */
import { getCollection } from "astro:content";
import type { Project } from "../domain/types.js";
import { toProject } from "./mappers.js";

let projectsCache: Promise<Project[]> | null = null;

/** 全プロジェクトを order 昇順で返す（ビルド内でメモ化） */
export function listProjects(): Promise<Project[]> {
  if (!projectsCache) {
    projectsCache = (async () => {
      const entries = await getCollection("projects");
      return entries.map(toProject).sort(compareByOrderThenTitle);
    })();
  }
  return projectsCache;
}

function compareByOrderThenTitle(a: Project, b: Project): number {
  const ao = a.order ?? Number.POSITIVE_INFINITY;
  const bo = b.order ?? Number.POSITIVE_INFINITY;
  if (ao !== bo) return ao - bo;
  return a.title.localeCompare(b.title, "ja");
}
