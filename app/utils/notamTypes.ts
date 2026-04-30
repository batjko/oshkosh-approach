/**
 * FAA Order JO 7930.2 keyword vocabulary for domestic NOTAM text:
 * RWY, TWY, APRON, AD, OBST, NAV, COM, SVC, AIRSPACE, ODP, SID, STAR,
 * CHART, DATA, DVA, IAP, VFP, ROUTE, SPECIAL, and SECURITY.
 */
export const NOTAM_TYPES = [
  'Airport',
  'Runway',
  'Taxiway',
  'Apron',
  'Obstruction',
  'Navigation',
  'Communications',
  'Services',
  'Airspace',
  'Departure',
  'SID',
  'STAR',
  'Chart',
  'Data',
  'DVA',
  'Approach',
  'VFP',
  'Route',
  'Special',
  'Security',
  'Other'
] as const

export type NotamType = typeof NOTAM_TYPES[number]

export const NOTAM_TYPE_FILTERS = ['All', ...NOTAM_TYPES] as const

const KEYWORD_TYPE_MAP: Record<string, NotamType> = {
  AD: 'Airport',
  AERODROME: 'Airport',
  RWY: 'Runway',
  RUNWAY: 'Runway',
  TWY: 'Taxiway',
  TAXIWAY: 'Taxiway',
  APRON: 'Apron',
  APN: 'Apron',
  RAMP: 'Apron',
  PARKING: 'Apron',
  OBST: 'Obstruction',
  NAV: 'Navigation',
  NAVAID: 'Navigation',
  GPS: 'Navigation',
  COM: 'Communications',
  COMMUNICATIONS: 'Communications',
  SVC: 'Services',
  SER: 'Services',
  WX: 'Services',
  ATC: 'Services',
  AIRSPACE: 'Airspace',
  TFR: 'Airspace',
  SAA: 'Airspace',
  PJE: 'Airspace',
  ODP: 'Departure',
  SID: 'SID',
  STAR: 'STAR',
  CHART: 'Chart',
  DATA: 'Data',
  DVA: 'DVA',
  IAP: 'Approach',
  IFP: 'Approach',
  VFP: 'VFP',
  ROUTE: 'Route',
  SPECIAL: 'Special',
  SECURITY: 'Security',
  FDC: 'Security',
  CARF: 'Security'
}

export const keywordToType = (keyword?: string): NotamType => {
  const normalized = keyword?.trim().toUpperCase()
  if (!normalized) return 'Other'

  const primaryKeyword = normalized.match(/^[A-Z]+/)?.[0]
  if (!primaryKeyword) return 'Other'

  return KEYWORD_TYPE_MAP[primaryKeyword] ?? 'Other'
}
