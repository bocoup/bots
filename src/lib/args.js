// Parse args from an array or string. Suitable for use with lines of chat.
//
// Example:
// parseArgs(`foo 'bar baz' a=123 b="x y z = 456" "can't wait"`, {aaa: Number, bbb: String})
// Returns:
// { options: { aaa: 123, bbb: 'x y z = 456' },
//   remain: [ 'foo', 'bar baz', 'can\'t wait' ],
//   errors: [] }
export function parseArgs(args, validProps = {}) {
  const options = {};
  const remain = [];
  const errors = [];

  if (typeof args === 'string') {
    args = args.split(' ');
  }
  // Use a copy so the originally passed args array isn't modified.
  else {
    args = [...args];
  }

  function setOption(arg) {
    // Anything before the first = is the prop name, the rest is the value.
    const [, prop, value] = arg.match(/([^=]+)=(.*)/) || [];
    if (!value) {
      return false;
    }
    // Matches are case insensitive, and can be an abbreviation of the actual
    // prop name.
    const matches = Object.keys(validProps).filter(p => p.toLowerCase().indexOf(prop.toLowerCase()) === 0);
    if (matches.length === 1) {
      const [match] = matches;
      // Sanitize/coerce value with the specified function.
      options[match] = validProps[match](value);
    }
    else if (matches.length > 1) {
      errors.push(`Ambiguous option "${prop}" specified (matches: ${matches.join(', ')}).`);
    }
    else {
      errors.push(`Unknown option "${prop}" specified.`);
    }
    return true;
  }

  while (args.length > 0) {
    // Match arg starting with ' or " or containing =' or ="
    const {1: equals, 2: quote, index: eqIndex} = args[0].match(/(^|=)(['"])/) || [];
    let arg;
    // Arg contained a quote.
    if (quote) {
      // Find arg ending with matching quote.
      const re = new RegExp(quote + '$');
      const endIndex = args.findIndex(a => re.test(a));
      // Matching arg was found.
      if (endIndex !== -1) {
        // Join all args between and including the start and end arg on space,
        // then remove trailing quote char.
        arg = args.splice(0, endIndex + 1).join(' ').slice(0, -1);
        // Remove starting quote char.
        arg = equals ? arg.slice(0, eqIndex + 1) + arg.slice(eqIndex + 2) : arg.slice(1);
      }
    }
    // If no quoted arg was found, use the next arg.
    if (!arg) {
      arg = args.shift();
    }
    // If arg is an a=b style option, parse it. Otherwise add
    if (!setOption(arg)) {
      remain.push(arg);
    }
  }

  return {
    options,
    remain,
    errors,
  };
}
