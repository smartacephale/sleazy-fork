import { readFileSync } from 'node:fs';
import { transformWithEsbuild } from 'vite';

export async function getScriptMetaData(filePath: string) {
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
