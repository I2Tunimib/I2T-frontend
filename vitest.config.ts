import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [viteTsconfigPaths()],
  resolve: {
    // Load a single immer build. immer's ESM build mangles internal fields,
    // so mixing it with the CJS build that Node loads for @reduxjs/toolkit
    // makes original() return undefined for drafts created by the other one.
    // Point src/ at the CJS build RTK already uses (NODE_ENV !== production).
    alias: {
      immer: fileURLToPath(
        new URL("./node_modules/immer/dist/immer.cjs.development.js", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // the table store: slice, thunks, selectors, helpers and the undo enhancer
      include: ["src/store/slices/table/**/*.ts", "src/store/enhancers/undo.ts"],
      exclude: ["**/__tests__/**", "**/*.test.ts", "**/interfaces/**", "**/reducers/types.ts"],
      reporter: ["text"],
      all: true,
      // Enforce 100% coverage on the table store and the undo enhancer.
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
