import { readFileSync, writeFileSync } from 'node:fs';

export function injectCodeIntoUserscript(filePath: string, code: string) {
  const content = readFileSync(filePath, 'utf-8');
  const metadataEndMarker = '// ==/UserScript==';

  const modifiedContent = content.replace(metadataEndMarker, metadataEndMarker + code);

  writeFileSync(filePath, modifiedContent);
}
