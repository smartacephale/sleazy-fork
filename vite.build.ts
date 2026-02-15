import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, transformWithEsbuild } from 'vite';
import monkey, { cdn, type MonkeyUserScript } from 'vite-plugin-monkey';
import defaultMeta from './src/userscripts/meta.json' with { type: 'json' };

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

      // console.lswog(userscript)

      await build({
        configFile: false,
        build: {
          target: 'esnext',
          minify: false,
          emptyOutDir: false,
          outDir: 'dist/userscripts',
          cssCodeSplit: false,
          rollupOptions: {
            output: {
              format: 'esm',
              globals: {
                'jabroni-outfit': 'jabronioutfit',
              },
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
                // 'urlpattern-polyfill': cdn.jsdelivr('urlpattern-polyfill', 'dist/urlpattern.js'),
                'jabroni-outfit': cdn.jsdelivr(
                  'jabronioutfit',
                  'dist/jabroni-outfit.umd.js',
                ),
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
