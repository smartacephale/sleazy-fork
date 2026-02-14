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
      entry: path.resolve(__dirname, './src/index.ts'),
      name: 'pervertmonkey.core',
      fileName: (format) => `pervertmonkey.core.${format}.js`,
    },
    rollupOptions: {
      external: ['$'],
      output: {
        globals: {
          $: '$',
        },
      },
    },
  },
  plugins: [dts({ rollupTypes: true })],
};

const devConfig: UserConfig = {
  plugins: [
    monkey({
      entry: 'src/userscripts/index.ts',
      userscript: {
        namespace: 'npm/vite-plugin-monkey',
        match: ['*://*/*'],
        'run-at': 'document-idle',
        grant: ['unsafeWindow', 'GM_addStyle'],
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
