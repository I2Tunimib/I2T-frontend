import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "build",
  },
  server: {
    port: 3000,
    strictPort: true,
    open: false,
    host: true,
    headers: {
      // Prevent the browser from caching Vite's pre-bundled dep chunks.
      // Without this, a Vite restart changes the ?v=HASH fingerprint while
      // the browser still holds the old URL, causing "error loading dynamically
      // imported module" on every page reload.
      "Cache-Control": "no-store",
    },
  },
  plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern",
        // To silent temporarly the warning about Dart Sass 2.0.0:
        silenceDeprecations: ["legacy-js-api"],
      },
    },
  },
});
