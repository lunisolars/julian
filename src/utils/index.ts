import { GRE_UNITS, REGEX_PARSE } from '../constants'
import { DateDict, GreUnit, GreUnitFullName } from '../../typings/types'

//==================================================================================
export function int2(v: number) {
  return Math.floor(v)
}

export function date2DateDict(date?: Date | Partial<DateDict> | number): DateDict {
  if (typeof date === 'number') {
    date = new Date(date)
  }
  if (date instanceof Date) {
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
      second: date.getUTCSeconds(),
      millis: date.getUTCMilliseconds()
    }
  }
  const now = new Date()
  return {
    year: date?.year ?? now.getUTCFullYear(),
    month: date?.month ?? now.getUTCMonth() + 1,
    day: date?.day ?? now.getUTCDate(),
    hour: typeof date === 'undefined' ? now.getUTCHours() : date.hour ?? 0,
    minute: typeof date === 'undefined' ? now.getUTCMinutes() : date.minute ?? 0,
    second: typeof date === 'undefined' ? now.getUTCSeconds() : date.second ?? 0,
    millis: typeof date === 'undefined' ? now.getUTCSeconds() : date.millis ?? 0
  }
}

/**
 * Gregorian calendar to Julian Day Number
 * 公历转儒略日数
 *
 * @param date Gregorian calendar date
 * @param isUTC is UTC
 * @returns Julian Day Number
 */
export function gre2jdn(date?: Date | Partial<DateDict>, isUTC = false): number {
  const dateDict = date2DateDict(date) as DateDict
  const now = new Date()
  let year = dateDict?.year ?? now.getFullYear()
  let month = dateDict?.month ?? now.getMonth() + 1
  let day = dateDict?.day ?? now.getDate()
  const hour = dateDict?.hour ?? 0
  const m = dateDict?.minute ?? 0
  const s = dateDict?.second ?? 0
  const ms = dateDict?.millis ?? 0
  const tzOffset = now.getTimezoneOffset() // -480
  let dig = hour / 24 + m / (24 * 60) + s / (24 * 60 * 60) + ms / (24 * 60 * 60 * 1000)
  // 减去时区差
  if (date && !(date instanceof Date) && !isUTC) {
    dig += tzOffset / (24 * 60)
  }

  //公历转儒略日
  let n = 0,
    G = 0
  if (year * 372 + month * 31 + int2(day) >= 588829) G = 1 //判断是否为格里高利历日1582*372+10*31+15
  if (month <= 2) (month += 12), year--
  if (G) (n = int2(year / 100)), (n = 2 - n + int2(n / 4)) //加百年闰
  return int2(365.25 * (year + 4716)) + int2(30.6001 * (month + 1)) + day + n - 1524.5 + dig
}

/**
 * Juilan Day Number to Gregorian calendar
 * @param jdn Julian Day Number
 * @param isUTC is UTC
 * @returns  Gregorian calendar date dict
 */
export function jdn2gre(jdn: number, isUTC = false): Required<DateDict> {
  if (!isUTC) {
    const timezoneOffset = -new Date().getTimezoneOffset()
    jdn += timezoneOffset / (24 * 60)
  }
  //儒略日数转公历
  const r: Required<DateDict> = {
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
    millis: 0
  }
  let D = int2(jdn + 0.5),
    F = jdn + 0.5 - D,
    c //取得日数的整数部份A及小数部分F
  if (D >= 2299161) {
    c = int2((D - 1867216.25) / 36524.25)
    D += 1 + c - int2(c / 4)
  }
  D += 1524
  r.year = int2((D - 122.1) / 365.25) //年数
  D -= int2(365.25 * r.year)
  r.month = int2(D / 30.601) //月数
  D -= int2(30.601 * r.month)
  r.day = D //日数
  if (r.month > 13) {
    r.month -= 13
    r.year -= 4715
  } else {
    r.month -= 1
    r.year -= 4716
  }
  //日的小数转为时分秒
  F *= 24
  r.hour = int2(F)
  F -= r.hour
  F *= 60
  r.minute = int2(F)
  F -= r.minute
  F *= 60
  r.second = int2(F)
  F -= r.second
  r.millis = F * 1000
  return r
}

/**
 * 处理日期单位
 * @param unit
 */
export const prettyUnit = (unit?: GreUnit): GreUnitFullName | '' => {
  if (!unit) return ''
  unit = unit.trim() as GreUnit
  return (
    (GRE_UNITS as { [prop: string]: GreUnitFullName })[unit] ||
    (unit || '').toLowerCase().replace(/s$/, '')
  )
}

export const parseDateString = (str: string): DateDict => {
  const now = new Date()
  const res: DateDict = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millis: 0
  }
  const d = str.match(REGEX_PARSE) as any
  if (d) {
    const ms = (d[7] || '0').substring(0, 3)
    res.year = Number(d[1] || res.year)
    res.month = Number(d[2] || 0)
    res.day = Number(d[3] || 1)
    res.hour = Number(d[4] || 0)
    res.minute = Number(d[5] || 0)
    res.second = Number(d[6] || 0)
    res.millis = Number(ms)
  }
  return res
}
