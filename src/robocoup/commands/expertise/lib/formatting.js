import heredoc from 'heredoc-tag';

// ==================
// FORMATTING HELPERS
// ==================

// Fancy "graphics"
export const CIRCLE_FILLED = '\u25CF';
export const CIRCLE_EMPTY = '\u25CB';

// Formating helper - formats a value into a small bar graph like this: ●●●○○ (3)
export function formatStatusBar(value) {
  return `${CIRCLE_FILLED.repeat(value)}${CIRCLE_EMPTY.repeat(5 - value)}`;
}

// Data-formatting helper.
export function formatByInterestAndExperience(rows, fn) {
  if (rows.length === 0) { return null; }
  return [
    `> *Interest*     |  *Experience*`,
    ...rows.map(row => {
      const [interest, experience] = row.interest_experience;
      return heredoc.oneline.trim`
        > ${formatStatusBar(interest)} (${interest}) | ${formatStatusBar(experience)}
        (${experience}): ${fn(row)}
      `;
    }),
  ];
}

// Produces a histogram for a specific expertise for experience and interest.
// provide 0 for interest, and 1 for experience for @interestOrExperiencetypeIdx
export function histogramByIndex(rows, fn) {
  const dist = rows.reduce((memo, {interest_experience, employees}) => {
    const level = fn(interest_experience);
    const count = employees.split(',').length;
    memo[level - 1] += count;
    return memo;
  }, [0, 0, 0, 0, 0]);

  return dist.map((count, idx) => `> (${idx + 1}) : ${CIRCLE_FILLED.repeat(count)}`);
}

// Data formatting for expertise statistics
export function formatExpertiseStats(expertise) {
  return [
    '*Interest Distribution:*',
    histogramByIndex(expertise, arr => arr[0]),
    '*Experience Distribution:*',
    histogramByIndex(expertise, arr => arr[1]),
  ];
}
