/**
 * スモークテスト共通ヘルパー
 *
 * 責務: `dist/` 配下のファイル存在確認と読み込み。
 * 他層からは独立したテスト専用コードなので 3 層アーキテクチャ（lib/）には属さない。
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

/** プロジェクトルート（worktree ルート）からの絶対パスを返す */
export const DIST_DIR = resolve(process.cwd(), "dist");

/** `dist/` ルート起点でファイルを絶対パスに解決する */
export function distPath(relative: string): string {
  return resolve(DIST_DIR, relative);
}

/** ファイルが存在するか。ディレクトリは false を返す */
export function fileExists(relativeToDist: string): boolean {
  const abs = distPath(relativeToDist);
  return existsSync(abs) && statSync(abs).isFile();
}

/** `dist/<relative>` を UTF-8 文字列として読み込む */
export function readDistFile(relativeToDist: string): string {
  return readFileSync(distPath(relativeToDist), "utf-8");
}

/**
 * `dist/` 自体が存在するかを返す（全テスト前提のガード）。
 * 存在しない場合はテスト側で `pnpm build` を促すメッセージを表示する。
 */
export function distExists(): boolean {
  return existsSync(DIST_DIR) && statSync(DIST_DIR).isDirectory();
}
