import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/typefs.ts",
    schemas: "src/schemas/index.ts",
  },
  outDir: "dist",
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
