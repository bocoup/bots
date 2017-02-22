export const FILLED = '\u2588';
export const HALF = '\u258c';
export const EMPTY = ' ';

export function histogram(width, fill) {
  const fillLength = Math.min(width, fill);
  const filled = FILLED.repeat(fillLength);
  const empty = EMPTY.repeat(width - fillLength);
  return `${filled}${empty}`;
}

export function histogramByPercentage(width, percentage) {
  if (percentage > 0 && percentage < 0.05) {
    return HALF + EMPTY.repeat(width - 1);
  }
  return histogram(width, Math.min(width, Math.max(0, Math.round(width * percentage))));
}
