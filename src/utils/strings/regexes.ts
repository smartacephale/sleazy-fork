import { memoize } from '../objects';
import { splitWith } from '.';

export class RegexFilter {
  private regexes: RegExp[];

  constructor(str: string, flags: string = 'gi') {
    this.regexes = memoize(this.compileSearchRegex)(str, flags);
  }

  // 'dog,bog,f:girl' or r:dog|bog... => [r/dog/i, r/bog/i, r/(^|\ )girl($|\ )/i]
  private compileSearchRegex(str: string, flags: string): RegExp[] {
    try {
      if (str.startsWith('r:')) return [new RegExp(str.slice(2), flags)];

      const regexes = splitWith(str)
        .map(
          (s) => s.replace(/f:(\w+)/g, (_, w) => `(^|\\ |,)${w}($|\\ |,)`), // full word
        )
        .map((_) => new RegExp(_, flags));

      return regexes;
    } catch (_) {
      return [];
    }
  }

  public hasEvery(str: string) {
    return this.regexes.every((r) => r.test(str));
  }

  public hasNone(str: string) {
    return this.regexes.every((r) => !r.test(str));
  }
}
