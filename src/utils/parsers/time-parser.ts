/**
 * Converts a duration string (e.g., "1h 22min 3sec") to HH:MM:SS format.
 * @param timeStr - The duration string to format.
 * @returns A string in the format HH:MM:SS.
 */
export function formatTimeToHHMMSS(timeStr: string): string {
  const pad = (num: number): string => num.toString().padStart(2, '0');

  const h = timeStr.match(/(\d+)\s*h/)?.[1] || '0';
  const m = timeStr.match(/(\d+)\s*mi?n?/)?.[1] || '0';
  const s = timeStr.match(/(\d+)\s*se?c?/)?.[1] || '0';

  return `${pad(+h)}:${pad(+m)}:${pad(+s)}`;
}

/**
 * Converts a time string (HH:MM:SS or duration format) to total seconds.
 * @param timeStr - The time string to convert.
 * @returns The total number of seconds.
 */
export function timeToSeconds(timeStr: string): number {
  const normalized = /[a-zA-Z]/.test(timeStr) ? formatTimeToHHMMSS(timeStr) : timeStr;

  return normalized
    .split(':')
    .reverse()
    .reduce((total, unit, index) => total + parseInt(unit, 10) * 60 ** index, 0);
}
