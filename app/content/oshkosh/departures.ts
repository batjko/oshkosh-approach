import type { DepartureRunway } from './types'

const departureSource = [{ sourceId: 'faa-2026-notice', section: 'VFR Departure from Oshkosh' }] as const

export const departureRunways: DepartureRunway[] = [
  { id: 'rwy-9-b1', label: 'RWY 9 at TWY B1', remainingFt: 6150, monitorFreq: '128.75', guidanceType: 'faa-procedure', sourceRefs: [...departureSource] },
  { id: 'rwy-9-b2', label: 'RWY 9 at TWY B2', remainingFt: 4600, monitorFreq: '128.75', guidanceType: 'faa-procedure', sourceRefs: [...departureSource] },
  { id: 'rwy-18l', label: 'RWY 18L', remainingFt: 6300, monitorFreq: '126.6', guidanceType: 'faa-procedure', sourceRefs: [...departureSource] },
  { id: 'rwy-18r-tower-road', label: 'RWY 18R at Tower Road', remainingFt: 6300, monitorFreq: '118.9', guidanceType: 'faa-procedure', sourceRefs: [...departureSource] },
  { id: 'rwy-27-a', label: 'RWY 27 at TWY A', remainingFt: 4600, monitorFreq: '128.75', guidanceType: 'faa-procedure', sourceRefs: [...departureSource] },
  {
    id: 'rwy-36l-p5',
    label: 'RWY 36L at TWY P5',
    remainingFt: 5050,
    monitorFreq: '118.9',
    notes: ['Turn right to heading 150 deg prior to the ATC Tower.'],
    guidanceType: 'faa-procedure',
    sourceRefs: [...departureSource]
  }
]

export const departureSafetyNotes = [
  'Monitor Departure ATIS 121.75 before engine start; no engine operation or aircraft movement until ATIS says the airport is open.',
  'When the airport is IFR, taxiing is prohibited except for aircraft with an IFR clearance.',
  'Do not depart on RWYs 13/31 or 5/23; they are closed.'
]
