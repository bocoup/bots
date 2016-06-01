import {query} from '../../../../lib/db';

// =============
// QUERY HELPERS
// =============

// Error-throwing helper function for bot promise chains.
export function abort(...args) {
  const error = new Error();
  error.abortData = args;
  return error;
}

// Find matching expertises for the given search term.
export function findExpertiseByName(search) {
  return query('expertise_by_name', search).then(matches => {
    let exact;
    if (matches.length > 0) {
      exact = matches.find(m => m.expertise.toLowerCase() === search.toLowerCase());
    }
    return {
      // All matches.
      matches,
      // The "best" match. Might not be exact.
      match: exact || matches[0],
      // An exact match. (case-insensitive)
      exact: exact || null,
    };
  });
}

// Find the best match for the given search term, and complain if necessary.
export function findExpertiseAndHandleErrors(search) {
  const output = [];
  return findExpertiseByName(search).then(({matches, match, exact}) => {
    if (matches.length === 0) {
      throw abort(`_No matches found for expertise "${search}"._`);
    }
    else if (matches.length === 1) {
      output.push(`_You specified "${search}", which matches: *${matches[0].expertise}*._`);
    }
    else {
      const expertiseList = matches.map(o => o.expertise).join(', ');
      output.push(`_Multiple matches were found: ${expertiseList}._`);
      if (exact) {
        output.push(`_You specified "${search}", which matches: *${exact.expertise}*._`);
      }
      else {
        throw abort(`_You specified "${search}", which is ambiguous. Please be more specific._`);
      }
    }
    return {
      matches,
      match,
      exact,
      output,
    };
  })
  .catch(error => {
    // If abort was used, re-throw with abort so the output propagates!
    if (error.abortData) {
      throw abort(...output, error.abortData);
    }
    throw error;
  });
}

export function getIntExpScales() {
  return query('expertise_scales')
  .then(results => results.reduce((memo, {type, id, name}) => {
    if (!memo[type]) {
      memo[type] = {};
    }
    memo[type][id] = name;
    return memo;
  }, {}));
}
