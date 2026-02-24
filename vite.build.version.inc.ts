import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const FOLDER: string = 'src/userscripts/scripts';

function incrementVersion(major: string, minor: string, patch: string): string {
  let maj: number = parseInt(major, 10);
  let min: number = parseInt(minor, 10);
  let pat: number = parseInt(patch, 10);

  pat++;
  if (pat > 99) {
    pat = 0;
    min++;
  }
  if (min > 99) {
    min = 0;
    maj++;
  }

  return `${maj}.${min}.${pat}`;
}

function processDirectory(dir: string): void {
  if (!existsSync(dir)) return;

  const files: string[] = readdirSync(dir);

  for (const file of files) {
    const fullPath: string = join(dir, file);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && fullPath.endsWith('.ts')) {
      const content: string = readFileSync(fullPath, 'utf8');

      const versionRegex: RegExp = /(version\s*:\s*['"`]?)(\d+)\.(\d+)\.(\d+)(['"`]?)/g;
      let hasChanges: boolean = false;

      const newContent: string = content.replace(
        versionRegex,
        (match, prefix, major, minor, patch, suffix) => {
          hasChanges = true;
          const newVersion = incrementVersion(major, minor, patch);
          return `${prefix}${newVersion}${suffix}`;
        },
      );

      if (hasChanges) {
        writeFileSync(fullPath, newContent, 'utf8');
      }
    }
  }
}

processDirectory(FOLDER);
