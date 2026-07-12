import { describe, expect, it } from 'vitest'

import {
  aircraftProfiles,
  alternates,
  arrivalSigns,
  departureRunways,
  departureSigns,
  event,
  frequencies,
  headerFrequencyIds,
  holds,
  notice,
  phases,
  runways,
  sources,
  transitions,
  waypoints
} from '..'

describe('2026 content invariants', () => {
  it('separates event dates from the procedure window', () => {
    expect(event.eventStartDate).toBe('2026-07-20')
    expect(event.eventEndDate).toBe('2026-07-26')
    expect(event.procedureStart).toBe('2026-07-16T12:00:00-05:00')
    expect(event.procedureEnd).toBe('2026-07-27T12:00:00-05:00')
  })

  it('uses the released FAA 2026 Notice', () => {
    expect(notice.status).toBe('released')
    expect(notice.requiredYear).toBe(2026)
    expect(notice.baselineYear).toBe(2026)
    expect(notice.baselineUrl).toContain('faa.gov/')
  })

  it('keeps phases ordered and source-backed', () => {
    expect(phases.map((phase) => phase.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    for (const phase of phases) {
      expect(phase.sourceRefs.length).toBeGreaterThan(0)
      for (const ref of phase.sourceRefs) expect(sources[ref.sourceId]).toBeDefined()
    }
  })

  it('resolves header frequencies and preserves published values', () => {
    for (const id of headerFrequencyIds) {
      expect(frequencies.find((frequency) => frequency.id === id)).toBeDefined()
    }
    expect(frequencies.find((frequency) => frequency.id === 'arrival-atis')?.freq).toBe('125.9')
    expect(frequencies.find((frequency) => frequency.id === 'fisk-approach')?.freq).toBe('120.7')
    expect(frequencies.find((frequency) => frequency.id === 'osh-tower-north')?.freq).toBe('118.5')
    expect(frequencies.find((frequency) => frequency.id === 'osh-tower-south')?.freq).toBe('126.6')
  })

  it('keeps transition and operational records source-backed', () => {
    for (const transition of transitions) {
      expect(waypoints.some((waypoint) => waypoint.id === transition.startWaypointId)).toBe(true)
      expect(transition.sourceRefs.length).toBeGreaterThan(0)
    }
    for (const record of [...holds, ...runways, ...departureRunways, ...alternates]) {
      expect(record.sourceRefs.length).toBeGreaterThan(0)
    }
  })

  it('preserves the published runway touchdown references', () => {
    expect(runways.find((runway) => runway.id === 'rwy-9')?.aimPoints[0]?.feetRemaining).toBe(4400)
    expect(runways.find((runway) => runway.id === 'rwy-27')?.aimPoints.map((point) => point.feetRemaining)).toEqual([4600, 3100])
    expect(runways.find((runway) => runway.id === 'rwy-18r')?.aimPoints.map((point) => point.feetRemaining)).toEqual([6350, 4850])
    expect(runways.find((runway) => runway.id === 'rwy-36r')?.aimPoints.map((point) => point.shape)).toEqual(['square', 'square'])
  })

  it('keeps specialty profiles distinct without invented speed defaults', () => {
    const byId = new Map(aircraftProfiles.map((profile) => [profile.id, profile]))
    expect(byId.get('standard')?.recommendedSpeedAlt).toMatchObject({ ias_kt: 90, altitude_ft_msl: 1800 })
    expect(byId.get('high-performance')?.recommendedSpeedAlt).toMatchObject({ ias_kt: 135, altitude_ft_msl: 2300 })
    expect(byId.get('turbine-warbird')?.recommendedSpeedAlt).toBeUndefined()
    expect(byId.get('helicopter')?.recommendedSpeedAlt).toBeUndefined()
    expect(byId.get('ultralight')?.recommendedSpeedAlt).toBeUndefined()
    expect(byId.get('seaplane')?.recommendedSpeedAlt).toBeUndefined()
    expect(byId.get('nordo')?.recommendedSpeedAlt).toBeUndefined()
    expect(byId.get('amphibian-kosh')?.arrivalRoute).toBe('amphibian-fisk')
    expect(byId.get('seaplane')?.arrivalRoute).toBe('seaplane')
  })

  it('keeps sign codes uppercase and unique', () => {
    const signs = [...arrivalSigns, ...departureSigns]
    expect(new Set(signs.map((sign) => sign.code)).size).toBe(signs.length)
    for (const sign of signs) expect(sign.code).toBe(sign.code.toUpperCase())
  })
})
