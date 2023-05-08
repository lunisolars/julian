import { DateDict, JDConfig, GreUnit } from '../typings/types'
import { int2, gre2jdn, jdn2gre, prettyUnit, parseDateString, setReadonly } from './utils'
import { GRE_UNITS } from './constants'
import { cache } from '@lunisolar/utils'

export class JD {
  readonly jdn: number
  readonly config: JDConfig
  readonly timezoneOffset: number
  readonly cache = new Map<string, any>()
  constructor(
    jdnOrDateDict?: number | Date | Partial<DateDict> | string,
    config?: Partial<JDConfig>
  ) {
    const defaultConfig = {
      isUTC: false,
      offset: 0
    }
    let jdn
    if (typeof jdnOrDateDict !== 'number') {
      if (typeof jdnOrDateDict === 'string') jdnOrDateDict = parseDateString(jdnOrDateDict)
      jdn = JD.gre2jdn(jdnOrDateDict, config?.isUTC)
    } else {
      jdn = jdnOrDateDict
    }
    this.config = setReadonly(Object.assign({}, defaultConfig, config))
    this.jdn = jdn
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
    if (typeof date === 'string') date = parseDateString(date)
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

  /**
   * 儒略日数转公历
   * @param jdn 儒略日数
   * @returns DateDict
   */
  static jdn2gre(jdn: number, isUTC = false): Required<DateDict> {
    return jdn2gre(jdn, isUTC)
  }

  @cache('jd:toGre')
  toGre(): Required<DateDict> {
    const jdn = this.jdn
    const mOffset = this.config.offset / (24 * 60)
    const res = JD.jdn2gre(jdn + mOffset, this.config.isUTC)
    return res
  }

  clone(): JD {
    return new JD(this.jdn, this.config)
  }

  local(): JD {
    const config = Object.assign({}, this.config, {
      isUTC: false
    })
    return new JD(this.jdn, config)
  }

  utc(): JD {
    const config = Object.assign({}, this.config, {
      isUTC: true
    })
    return new JD(this.jdn, config)
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

  get millis() {
    return this.toGre().millis
  }

  get dayOfWeek() {
    let mOffset = this.config.isUTC ? 0 : -this.timezoneOffset / (24 * 60)
    mOffset += this.config.offset
    return int2(this.jdn + 1.5 + 7000000 + mOffset) % 7
  }

  add(value: number, unit: GreUnit) {
    const pUnit = prettyUnit(unit)
    let diff = value
    let jdn = this.jdn
    if (pUnit === GRE_UNITS.h) {
      diff = value / 24
    } else if (pUnit === GRE_UNITS.m) {
      diff = value / (24 * 60)
    } else if (pUnit === GRE_UNITS.s) {
      diff = value / (24 * 60 * 60)
    } else if (unit === GRE_UNITS.M || unit === GRE_UNITS.y) {
      const gre = JD.jdn2gre(this.jdn, this.config.isUTC)
      diff = 0
      if (unit === GRE_UNITS.M) gre.month += 1
      if (unit === GRE_UNITS.y) gre.year += 1

      jdn = JD.gre2jdn(gre, this.config.isUTC)
    } else if (unit === GRE_UNITS.w) {
      diff = value / 7
    }
    return new JD(jdn + diff, this.config)
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
      SSS: String(this.millis).padStart(3, '0'),
      Z: tz,
      ZZ: tz.replace(':', '')
    }

    return str.replace(REGEX_FORMAT, (match, $1) => {
      return $1 || matches[match as keyof typeof matches]
    })
  }
}
