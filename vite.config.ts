import { existsSync, readdirSync, rmSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, type UserConfig } from 'vite';
import dts from 'vite-plugin-dts';
import monkey from 'vite-plugin-monkey';

const buildCoreConfig: UserConfig = {
  define: {
    'process.env': {},
  },
  build: {
    sourcemap: true,
    minify: false,
    outDir: 'dist/core',
    lib: {
      entry: path.resolve(import.meta.dirname, './src/index.ts'),
      name: 'pervertmonkey.core',
      fileName: (format) => `pervertmonkey.core.${format}.js`,
    },
    rollupOptions: {
      external: ['vite-plugin-monkey/dist/client'],
      output: {
        globals: {
          'vite-plugin-monkey/dist/client': 'window',
        },
      },
    },
  },
  plugins: [
    dts({
      bundleTypes: false,
      afterBuild: () => {
        const distCore = path.resolve(import.meta.dirname, 'dist/core');
        if (!existsSync(distCore)) return;

        const entries = readdirSync(distCore, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            rmSync(path.join(distCore, entry.name), { recursive: true, force: true });
          } else if (
            entry.isFile() &&
            entry.name.endsWith('.d.ts') &&
            entry.name !== 'pervertmonkey.core.es.d.ts'
          ) {
            unlinkSync(path.join(distCore, entry.name));
          }
        }
      },
    }),
  ],
};

const devConfig: UserConfig = {
  plugins: [
    monkey({
      entry: 'src/userscripts/index.ts',
      userscript: {
        namespace: 'npm/vite-plugin-monkey',
        match: ['*://*/*'],
        'run-at': 'document-idle',
        grant: ['unsafeWindow', 'GM_addStyle', 'GM_addElement'],
      },
    }),
  ],
};

export default defineConfig(({ mode }) => {
  if (mode === 'development') {
    return devConfig;
  }
  return buildCoreConfig;
});
