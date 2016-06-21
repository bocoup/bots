export const FILLED = '\u2588';
export const EMPTY = ' ';

export function histogram(width, fill) {
  const fillLength = Math.min(width, fill);
  const filled = FILLED.repeat(fillLength);
  const empty = EMPTY.repeat(width - fillLength);
  return `${filled}${empty}`;
}

export function histogramByPercentage(width, percentage) {
  return histogram(width, Math.round(width * percentage));
}
