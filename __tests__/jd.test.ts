import { JD } from '../src/jd'

// import { JD as JDX } from '../../src/utils/jd'

describe('test JD Class', () => {
  it('test JD 2023-04-14 12:00:00', () => {
    const jd = JD.fromGre({ year: 2023, month: 4, day: 14, hour: 12 }, { isUTC: true })
    expect(jd.jdn).toBe(2460049)
    expect(jd.format(`YYYY-MM-DD HH:mm:ss`)).toBe('2023-04-14 12:00:00')
  })

  it('test JD 2023-04-26 12:00:00', () => {
    const jd = JD.fromGre({ year: 2023, month: 4, day: 26, hour: 0 }, { isUTC: true })
    expect(jd.jdn).toBe(2460060.5)
    expect(jd.format(`YYYY-MM-DD HH:mm:ss`)).toBe('2023-04-26 00:00:00')
    expect(new JD(jd.jdn, { isUTC: true }).format('YYYY-MM-DD HH:mm:ss')).toBe(
      '2023-04-26 00:00:00'
    )
  })

  it('test JD parse and fromat 2023-05-06 00:00:00', () => {
    const jd = JD.fromGre('2023-05-06 00:00:00')
    expect(jd.format(`YYYY-MM-DD HH:mm:ss`)).toBe('2023-05-06 00:00:00')
    expect(jd.jdn).toBe(JD.fromGre({ year: 2023, month: 5, day: 6 }).jdn)
    expect(jd.jdn).toBe(JD.fromGre({ year: 2023, month: 5, day: 6 }).jdn)
    expect(JD.fromGre('2023-06-06 00:00:00').jdn).toBe(2460101.1666666665)
    expect(JD.fromJdn(2460101, { isUTC: true }).format('YYYY-MM-DD HH:mm:ss')).toBe(
      '2023-06-05 12:00:00'
    )
  })

  it('test JD toGre 2023-05-06 00:00:00', () => {
    const jd = JD.fromJdn(2460101)
    const gre = jd.toGre()
    expect(gre.year).toBe(2023)
    expect(gre.month).toBe(6)
  })

  it('test JD add', () => {
    const jd = JD.fromGre({ year: 2023, month: 5, day: 6, hour: 0 }, { isUTC: true })
    // const jd2 = JD.fromGre({ year: 2023, month: 5, day: 6, hour: 0 })
    expect(jd.add(1, 'day').format(`YYYY-MM-DD HH:mm:ss`)).toBe('2023-05-07 00:00:00')
    expect(
      JD.fromGre({
        year: 2023,
        month: 6,
        day: 6,
        hour: 0,
        minute: 0,
        second: 0,
        millis: 0
      }).jdn
    ).toBe(2460101.1666666665)
    expect(jd.add(1, 'month').format()).toBe('2023-06-06 00:00:00')
    expect(jd.add(1, 'year').format()).toBe('2024-05-06 00:00:00')
    expect(JD.fromGre('2023-12-01').add(1, 'month').format()).toBe('2024-01-01 00:00:00')
  })

  it('test JD utc local', () => {
    const jd = JD.fromJdn(2460101)
    const jd2 = jd.utc()
    const jd3 = jd2.local()
    expect(jd.format('YYYY-MM-DD HH:mm:ss')).toBe('2023-06-05 20:00:00')
    expect(jd2.format('YYYY-MM-DD HH:mm:ss')).toBe('2023-06-05 12:00:00')
    expect(jd3.format('YYYY-MM-DD HH:mm:ss')).toBe('2023-06-05 20:00:00')
  })
})
