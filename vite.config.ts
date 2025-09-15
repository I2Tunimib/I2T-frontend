import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build'
  },
  server: {
    port: 3000
  },
  plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        // To silent temporarly the warning about Dart Sass 2.0.0:
        silenceDeprecations: ['legacy-js-api']
      }
    }
  }
});
