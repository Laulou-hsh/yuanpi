/**
 * @example
 *    start('http://www', 'http://') => 'http://www'
 *    start('www', 'http://') => 'http://www'
 *
 * @param {string} value
 * @param {string} prefix
 * @return {string}
 */
export function start(value, prefix) {
  const prefixLen = prefix.length
  return value.slice(0, prefixLen) === prefix ? value : prefix + value
}

/**
 * @example
 *  cutStart('/abc', '/') => 'abc'
 *
 * @perf https://www.measurethat.net/Benchmarks/Show/4797/1/js-regex-vs-startswith-vs-indexof#latest_results_block
 *
 * @param {string} string
 * @param {string} needle
 * @return {*}
 */
export function cutStart(string, needle) {
  return string.indexOf(needle) === 0 ? string.substr(needle.length) : string
}

export function toCamelCase(name) {
  return name.replace(/[_-](\w)/g, (match, letter) => letter.toUpperCase())
}
