import { DateDict, JDConfig, GreUnit, JDDict, DateConfigType } from '../typings/types'
import { GRE_UNITS } from './constants'
import {
  gre2jdn,
  jdn2dateDict,
  dateDict2jdms,
  modDayMs,
  jdDict2timestamp,
  string2DateDict,
  prettyUnit,
  toInt,
  setReadonly,
  cache,
  timestamp2jdDict,
  date2DateDict
} from '@lunisolar/utils'

import { toJDDict } from './utils/func'

function changeIsUTC(inst: JD, isUTC: boolean) {
  const config = Object.assign({}, inst.config, {
    isUTC,
    offset: 0
  })
  return new JD(inst.jdn, config)
}

function getJDDictFromJD(jd: JD) {
  return {
    jdn: jd.jdn,
    jdms: jd.jdms
  }
}

export class JD {
  readonly jdn: number
  readonly jdms: number = 0
  readonly config: JDConfig
  readonly timezoneOffset: number
  readonly cache = new Map<string, any>()
  constructor(
    jdd?: DateConfigType | JD | { jd: JD; [key: string]: any },
    config?: Partial<JDConfig>
  ) {
    let jdDict = {
      jdn: 0,
      jdms: 0
    }
    let defaultConfig: JDConfig = {
      isUTC: false,
      offset: 0
    }
    if (jdd === null || jdd === void 0) {
      jdDict = timestamp2jdDict(new Date().valueOf())
    } else if (jdd instanceof JD) {
      jdDict = getJDDictFromJD(jdd)
      defaultConfig = jdd.config
    } else if (
      typeof jdd === 'object' &&
      jdd.hasOwnProperty('jd') &&
      (jdd as any).jd instanceof JD
    ) {
      jdDict = getJDDictFromJD((jdd as any).jd)
      if (jdd.hasOwnProperty('_config')) {
        defaultConfig.isUTC = (jdd as any)._config?.isUTC ?? false
        defaultConfig.offset = (jdd as any)._config?.offset ?? 0
      }
    } else if (
      (typeof jdd === 'object' && typeof (jdd as JDDict).jdn === 'number') ||
      typeof jdd === 'number' ||
      jdd instanceof Date
    ) {
      jdDict = toJDDict(jdd as JDDict | number | Date)
    } else if (typeof jdd !== 'number') {
      if (typeof jdd === 'string') jdd = string2DateDict(jdd)
      jdDict.jdn = JD.gre2jdn(jdd as DateDict, config?.isUTC)
      jdDict.jdms = dateDict2jdms(date2DateDict(jdd as DateDict), config?.isUTC)
    }
    this.config = setReadonly(Object.assign({}, defaultConfig, config))
    this.jdn = jdDict.jdn
    this.jdms = modDayMs(jdDict.jdms)
    this.timezoneOffset = this.config.isUTC ? 0 : new Date().getTimezoneOffset()
  }

  /**
   * Gregorian calendar to Julian Day Number
   * 公历转儒略日数
   *
   * @param date  Gregorian calendar date 公历
   * @param isUTC is UTC?
   * @returns Julian Day Number
   */
  static gre2jdn(date?: Date | Partial<DateDict> | string, isUTC = false) {
    if (typeof date === 'string') date = string2DateDict(date)
    return gre2jdn(date, isUTC)
  }

  /**
   * Create JD object from the Gregorian calendar
   *
   * @param dateDict Gregorian calendar date
   * @param config config
   * @returns JD Instance
   */
  static fromGre(dateDict?: Partial<DateDict> | string, config?: Partial<JDConfig>) {
    return new JD(dateDict, config)
  }

  /**
   * Create JD object from the Julian Day Number
   *
   * @param jdn Julian Day Number
   * @param config config
   * @returns JD Instance
   */
  static fromJdn(jdn: number, config?: Partial<JDConfig>): JD {
    return new JD(jdn, config)
  }

  static fromTimestamp(timestamp: number, config?: Partial<JDConfig>) {
    return new JD(timestamp2jdDict(timestamp), config)
  }

  /**
   * Julian Day Number to Gregorian calendar
   * 儒略日数转公历
   * @param jdn Julian Day Number 儒略日数
   * @param isUTC is UTC? defalut `false`
   * @returns DateDict
   */
  static jdn2gre(jdn: number, isUTC = false, jdms?: number): Required<DateDict> {
    return jdn2dateDict(jdn, isUTC, jdms)
  }

  @cache('jd:toGre')
  toGre(): Required<DateDict> {
    const jdn = this.jdn
    const dOffset = this.config.offset / (24 * 60)
    const jdms = modDayMs(this.jdms, this.config.offset * 60 * 1000)
    const res = JD.jdn2gre(jdn + dOffset, this.config.isUTC, jdms)
    return res
  }

  clone(): JD {
    return new JD({ jdn: this.jdn, jdms: this.jdms }, this.config)
  }

  local(): JD {
    return changeIsUTC(this, false)
  }

  utc(): JD {
    return changeIsUTC(this, true)
  }

  isUTC() {
    return this.config.isUTC
  }

  get year() {
    return this.toGre().year
  }

  get month() {
    return this.toGre().month
  }

  get day() {
    return this.toGre().day
  }

  get hour() {
    return this.toGre().hour
  }

  get minute() {
    return this.toGre().minute
  }

  get second() {
    return this.toGre().second
  }

  get millisecond() {
    return this.toGre().millisecond
  }

  get dayOfWeek() {
    let mOffset = this.config.isUTC ? 0 : -this.timezoneOffset / (24 * 60)
    mOffset += this.config.offset
    return toInt(this.jdn + 1.5 + 7000000 + mOffset) % 7
  }

  @cache('jd:timestamp')
  get timestamp() {
    return jdDict2timestamp({ jdn: this.jdn, jdms: this.jdms })
  }

  toDate() {
    return new Date(this.timestamp)
  }

  add(value: number, unit: GreUnit) {
    const pUnit = prettyUnit(unit)
    let diff = value
    let jdn = this.jdn
    let jdms = this.jdms
    if (pUnit === GRE_UNITS.h) {
      diff = value / 24
      jdms = jdms ? modDayMs(jdms, value * 60 * 60 * 1000) : 0
    } else if (pUnit === GRE_UNITS.m) {
      diff = value / (24 * 60)
      jdms = jdms ? modDayMs(jdms, value * 60 * 1000) : 0
    } else if (pUnit === GRE_UNITS.s) {
      diff = value / (24 * 60 * 60)
      jdms = jdms ? modDayMs(jdms, value * 1000) : 0
    } else if (unit === GRE_UNITS.M || unit === GRE_UNITS.y) {
      const gre = JD.jdn2gre(this.jdn, this.config.isUTC)
      diff = 0
      if (unit === GRE_UNITS.M) gre.month += 1
      if (unit === GRE_UNITS.y) gre.year += 1
      jdn = JD.gre2jdn(gre, this.config.isUTC)
    } else if (unit === GRE_UNITS.w) {
      diff = value / 7
    } else if (unit === GRE_UNITS.ms) {
      diff = value / (24 * 60 * 60 * 1000)
      jdms = jdms ? modDayMs(jdms, value) : 0
    }
    return new JD({ jdn: jdn + diff, jdms }, this.config)
  }

  format(formatStr?: string) {
    const FORMAT_DEFAULT = 'YYYY-MM-DD HH:mm:ss'
    const str = formatStr || FORMAT_DEFAULT
    const REGEX_FORMAT =
      /\[([^\]]+)]|J|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g
    const meridiemFunc = (hour: number, minute: number, isLowercase: boolean) => {
      const m = hour < 12 ? 'AM' : 'PM'
      return isLowercase ? m.toLowerCase() : m
    }
    const padZoneStr = (timezoneOffset: number) => {
      const minutes = Math.abs(timezoneOffset)
      const hourOffset = Math.floor(minutes / 60)
      const minuteOffset = minutes % 60
      return `${timezoneOffset <= 0 ? '+' : '-'}${String(hourOffset).padStart(2, '0')}:${String(
        minuteOffset
      ).padStart(2, '0')}`
    }

    const y = this.year
    const M = this.month
    const D = this.day
    const H = this.hour
    const m = this.minute
    const s = this.second
    const w = this.dayOfWeek
    const h = H % 12 || 12
    const tz = padZoneStr(this.timezoneOffset)
    const matches = {
      J: String(this.jdn),
      YY: String(y).slice(-2),
      YYYY: String(y),
      M: String(M),
      MM: String(M).padStart(2, '0'),
      D: String(D),
      DD: String(D).padStart(2, '0'),
      d: String(w),
      H: String(H),
      HH: String(H).padStart(2, '0'),
      h: String(h),
      hh: String(h).padStart(2, '0'),
      a: meridiemFunc(H, m, true),
      A: meridiemFunc(H, m, false),
      m: String(m),
      mm: String(m).padStart(2, '0'),
      s: String(s),
      ss: String(s).padStart(2, '0'),
      S: String(Math.floor(this.millisecond / 100)),
      SS: String(Math.floor(this.millisecond / 10)).padStart(2, '0'),
      SSS: String(Math.floor(this.millisecond)).padStart(3, '0'),
      Z: tz,
      ZZ: tz.replace(':', '')
    }

    return str.replace(REGEX_FORMAT, (match, $1) => {
      return $1 || matches[match as keyof typeof matches]
    })
  }
}
