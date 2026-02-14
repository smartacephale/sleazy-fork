export function splitWith(s: string, c: string = ','): Array<string> {
  return s
    .split(c)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function sanitizeStr(s: string) {
  return s?.replace(/\n|\t/g, ' ').replace(/ {2,}/g, ' ').trim() || '';
}
