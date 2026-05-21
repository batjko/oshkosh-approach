import type { FrequencyEntry } from './types'

export const frequencies: FrequencyEntry[] = [
  { id: 'arrival-atis', label: 'Arrival ATIS', freq: '125.9', category: 'arrival', notes: 'Tune at 60 NM in COM2.' },
  { id: 'fisk-approach', label: 'Fisk Approach', freq: '120.7', category: 'arrival', notes: 'Listen-only unless ATC speaks to you.' },
  { id: 'osh-tower-north', label: 'OSH Tower (RWY 9/27)', freq: '118.5', category: 'tower' },
  { id: 'osh-tower-south', label: 'OSH Tower (RWY 18/36)', freq: '126.6', category: 'tower' },
  { id: 'departure-atis', label: 'Departure ATIS', freq: '121.75', category: 'departure' },
  { id: 'clearance-delivery', label: 'Clearance Delivery', freq: '119.05', category: 'departure' },
  { id: 'ground-control', label: 'Ground Control', freq: '132.3', category: 'ground' },
  { id: 'departure-monitor-9-27', label: 'RWY 9/27 Departures', freq: '128.75', category: 'departure' },
  { id: 'departure-monitor-18-36', label: 'RWY 18/36 Departures', freq: '118.9', category: 'departure' },
  { id: 'osh-vortac', label: 'OSH VORTAC', freq: '116.75', category: 'support' },
  { id: 'unicom-basler', label: 'Unicom (Basler FBO)', freq: '122.95', category: 'support' },
  { id: 'milwaukee-approach', label: 'Milwaukee Approach', freq: '127.0', category: 'support' },
  { id: 'green-bay-radio', label: 'Green Bay Radio', freq: '122.3', category: 'support' },
  { id: 'osh-uhf', label: 'Oshkosh UHF', freq: '290.9', category: 'support' },
  { id: 'warbird-ground', label: 'Warbird Ground', freq: '123.9', category: 'specialty' },
  { id: 'ultralight-advisory', label: 'Ultralight/Rotorcraft', freq: '123.75', category: 'specialty' },
  { id: 'seaplane-base', label: 'Seaplane Base', freq: '123.3', category: 'specialty' }
]

export const frequencyById = (id: string): FrequencyEntry | undefined =>
  frequencies.find((f) => f.id === id)

/** Frequencies pinned to the persistent header strip. */
export const headerFrequencyIds = [
  'arrival-atis',
  'fisk-approach',
  'osh-tower-north',
  'osh-tower-south'
] as const
