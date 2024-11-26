import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      exclude: ["src/examples/**", "dist/**", "eslint.config.js", "tsup.config.ts", "vitest.config.ts", "src/tests/**"],
    },
  }
})