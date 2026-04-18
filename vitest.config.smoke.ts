/**
 * スモークテスト専用 Vitest 設定
 *
 * - 対象: `tests/smoke/**` のみ（ビルド成果物 `dist/` を検証）
 * - 実行前提: `pnpm build` で `dist/` を生成済み（`pnpm test:smoke` が build を兼ねる）
 * - 既存の `pnpm test`（vitest.config.ts）には影響しない
 *
 * 参照: docs/requirements.md §7.2（ビルド後スモークテスト）
 */
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/smoke/**/*.test.ts"],
    environment: "node",
    globals: false,
    // HTML/XML パース + ファイル I/O を含むためタイムアウトを緩める
    testTimeout: 15_000,
  },
});
