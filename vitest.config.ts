import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // スモークテスト（tests/smoke/**）は `pnpm test:smoke` で実行するため除外。
    // ビルド成果物 `dist/` への依存が既存ユニットテストのフィードバック高速性を損なうのを避ける。
    exclude: ["tests/smoke/**", "node_modules/**"],
    environment: "node",
    globals: false,
  },
});

