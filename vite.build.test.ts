import { build } from 'vite';
import monkey from 'vite-plugin-monkey';

build({
  configFile: false,
  build: {
    target: 'esnext',
    minify: false,
    emptyOutDir: false,
    outDir: 'dist/test',
    rollupOptions: {
      output: {
        format: 'esm',
      },
    },
  },
  plugins: [
    monkey({
      entry: 'src/userscripts/index.ts',
      userscript: {
        namespace: 'npm/vite-plugin-monkey',
        match: ['*://*/*'],
        'run-at': 'document-idle',
        grant: ['unsafeWindow', 'GM_addStyle', 'GM_addElement'],
      },
      build: {
        fileName: 'test.user.js',
        externalGlobals: {},
      },
    }),
  ],
});
