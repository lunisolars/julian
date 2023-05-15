import { JD } from '../src/jd'

describe('test JD Class', () => {
  it('test JD 2023-04-14 12:00:00', () => {
    const jd = JD.fromGre({ year: 2023, month: 4, day: 14, hour: 12 }, { isUTC: true })
    expect(jd.jdn).toBe(2460049)
    expect(jd.jdms).toBe(43200000)
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
    expect(jd.add(1, 'day').format(`YYYY-MM-DD HH:mm:ss`)).toBe('2023-05-07 00:00:00')
    expect(
      JD.fromGre({
        year: 2023,
        month: 6,
        day: 6,
        hour: 0,
        minute: 0,
        second: 0
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
    expect(JD.fromGre('2023-05-10 00:00:00').utc().format('YYYY-MM-DD HH:mm:ss')).toBe(
      '2023-05-09 16:00:00'
    )
  })

  it('test JD utc local 2', () => {
    const jd = new JD('2023-05-10', { isUTC: true, offset: 420 }).local()
    expect(jd.format('YYYY-MM-DD HH:mm:ss')).toBe('2023-05-10 08:00:00')
  })

  it('test JD parse', () => {
    const jd = JD.fromGre('2023-05-14 13:00')
    expect(jd.format('YYYY-MM-DD HH:mm:ss')).toBe('2023-05-14 13:00:00')
    expect(jd.jdn).toBe(2460078.7083333335)
    expect(jd.timestamp).toBe(1684040400000)
    const date = new Date(jd.timestamp)
    expect(date.getFullYear()).toBe(2023)
    expect(date.getMonth() + 1).toBe(5)
    expect(date.getDate()).toBe(14)
    expect(date.getHours()).toBe(13)
  })

  it('test JD parse utc', () => {
    const jd = JD.fromGre('2023-05-15 16:30', { isUTC: true })
    expect(jd.format('YYYY-MM-DD HH:mm:ss')).toBe('2023-05-15 16:30:00')
    expect(jd.jdn).toBe(2460080.1875)
    expect(jd.timestamp).toBe(1684168200000)
    const date = new Date(jd.timestamp)
    expect(date.getFullYear()).toBe(2023)
    expect(date.getMonth() + 1).toBe(5)
    expect(date.getDate()).toBe(16)
    expect(date.getHours()).toBe(0)
    expect(date.getMinutes()).toBe(30)
  })

  it('test JD parse by jdDict', () => {
    const jd = new JD({ jdn: 2460101.1666666665, jdms: 57600000 })
    expect(jd.format('YYYY-MM-DD HH:mm:ss')).toBe('2023-06-06 00:00:00')
  })
})
