const MILLIS_IN_MIN = 60 * 1000;
const MILLIS_IN_HOUR = 3600 * 1000;
const MILLIS_IN_DAY = 24 * MILLIS_IN_HOUR;
const MILLIS_IN_WEEK = MILLIS_IN_DAY * 7;

module.exports = {
  indent(str, spaces = 2) {
    const indent = ' '.repeat(spaces); // Create indentation (default: 2 spaces)
    return str
      .split('\n')
      .map(line => indent + line)
      .join('\n');
  },
};
