﻿import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/typefs.ts"],
  outDir: "dist",
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true
});