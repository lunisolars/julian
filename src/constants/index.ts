/**
 * 2000-01-01 UT12:00 is Julian Day 2451545
 */
export const J2000 = 2451545

/**
 * 一天的总毫秒数
 */
export const DAY_MS = 24 * 60 * 60 * 1000

export const GRE_UNITS = {
  ms: 'millisecond',
  s: 'second',
  m: 'minute',
  h: 'hour',
  d: 'day',
  w: 'week',
  M: 'month',
  y: 'year'
}

export const REGEX_PARSE =
  /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/
