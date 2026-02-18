import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, transformWithEsbuild } from 'vite';
import monkey, { type MonkeyUserScript } from 'vite-plugin-monkey';
import pkg from './package.json' with { type: 'json' };
import defaultMeta from './src/userscripts/meta.json' with { type: 'json' };

const { version } = pkg;

function setIcon(meta: MonkeyUserScript) {
  if ('icon' in meta) return;
  if (!meta.match) return;

  const url: string =
    Array.isArray(meta.match) && typeof meta.match[0] === 'string'
      ? meta.match[0]
      : typeof meta.match === 'string'
        ? meta.match
        : '';

  const res = url.match(/([^./?#]+\.[a-z0-9]+)(?:[/?#]|$)/i);

  if (res?.[1]) {
    const icon = `https://www.google.com/s2/favicons?sz=64&domain=${res[1]}`;
    Object.assign(meta, { icon });
  }
}

async function getScriptMetaData(filePath: string) {
  const code = readFileSync(filePath, 'utf-8');

  const transformed = await transformWithEsbuild(code, filePath, {
    loader: 'ts',
    format: 'esm',
  });

  const metaMatch = transformed.code.match(
    /(?:const|var|let)\s+meta\s*=\s*(\{[\s\S]*?\});/,
  );

  let metaStr = '';
  if (!metaMatch) {
    const fallbackMatch = transformed.code.match(/meta\s*=\s*(\{[\s\S]*?\});/);
    if (!fallbackMatch) throw Error('No metadata');
    metaStr = fallbackMatch[1];
  } else {
    metaStr = metaMatch[1];
  }

  const meta = new Function(`return ${metaStr}`)();

  return meta;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runBuild = async () => {
  const dir = resolve(__dirname, 'src/userscripts/scripts');
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = resolve(dir, file);
    if (statSync(filePath).isDirectory() || !file.endsWith('.ts')) continue;

    const fileName = basename(file, extname(file));

    try {
      const meta = await getScriptMetaData(filePath);
      const userscript = {
        ...(defaultMeta as MonkeyUserScript),
        ...meta,
      };

      setIcon(userscript);

      Object.assign(userscript, {
        require: [
          `https://cdn.jsdelivr.net/npm/pervert-monkey@${version}/dist/core/pervertmonkey.core.umd.js`,
          'data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;',
        ],
      });

      // console.log(userscript)

      await build({
        configFile: false,
        build: {
          target: 'esnext',
          minify: false,
          emptyOutDir: false,
          outDir: 'dist/userscripts',
          rollupOptions: {
            output: {
              format: 'esm',
            },
          },
        },
        plugins: [
          monkey({
            entry: filePath,
            userscript,
            build: {
              fileName: `${fileName}.user.js`,
              externalGlobals: {
                '../../utils': ['', ''],
                '../../core': ['', ''],
              },
            },
          }),
        ],
      });
    } catch (err) {
      console.error(`❌ Failed to build ${file}:`, err);
    }
  }
};

runBuild();
