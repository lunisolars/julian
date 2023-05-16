export type DateDict = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  millisecond?: number
}

export type JDConfig = {
  isUTC: boolean
  offset: number
}

export interface JDDict {
  jdn: number
  jdms?: number
}

export type GreUnitFullName =
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'year'

export type GreUnitShortName = 'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y'

export type GreUnit = GreUnitFullName | GreUnitShortName
