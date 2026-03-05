import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

import { playwright } from '@vitest/browser-playwright';

import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr()
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.jsx'),
      formats: [ 'es' ]
    },
    rollupOptions: {
      external: [ ...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies) ],
    },
    sourcemap: true,
  },
  test: {
    globals: true,
    browser: {
      enabled: true,
      provider: playwright(),

      // browsers must be installed via `npx playwright install <browser_name>`
      instances: [
        { browser: 'chromium' }
      ]
    }
  }
});
