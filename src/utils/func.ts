import { getFractionalPart, timestamp2jdDict } from '@lunisolar/utils'
import { JDDict } from '../../typings/types'

export function computeJdmsFromJdn(jdn: number) {
  return Math.round(getFractionalPart(jdn - 0.5) * 86400 * 1000)
}

export function date2JDDict(date: Date) {
  return timestamp2jdDict(date.valueOf())
}

export function toJDDict(jdd: JDDict | Date | number): Required<JDDict> {
  if (jdd instanceof Date) return date2JDDict(jdd)
  if (typeof jdd === 'number') {
    return {
      jdn: jdd,
      jdms: computeJdmsFromJdn(jdd)
    }
  }
  return {
    jdn: jdd.jdn,
    jdms: jdd?.jdms ?? computeJdmsFromJdn(jdd.jdn)
  }
}

export function getIsUTCFromString(str: string) {
  return /Z$/i.test(str)
}
