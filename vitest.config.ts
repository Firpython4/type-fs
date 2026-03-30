import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json", "html", "lcov"],
      all: true,
      exclude: [
        "src/examples/**",
        "src/tests/**",
        "dist/**",
        "eslint.config.js",
        "tsup.config.ts",
        "vitest.config.ts",
        "stryker.conf.json",
        "src/typefs.ts",
        "src/schemas/index.ts",
        "src/schemas/markdown.ts",
        "src/schemas/image.ts",
        "src/fileManagement.ts",
      ],
    },
  },
});
