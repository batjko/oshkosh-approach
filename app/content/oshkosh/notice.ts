import type { NoticeMetadata, EventFacts } from './types'

/**
 * Notice metadata. Until the FAA 2026 Notice is released, the embedded
 * procedural data is based on the 2025 Notice. Flight-day mode is gated
 * on the user confirming they have read the released 2026 Notice.
 */
export const notice: NoticeMetadata = {
  baselineYear: 2025,
  requiredYear: 2026,
  status: 'baseline',
  baselineUrl: 'https://www.faa.gov/air_traffic/publications/domesticnotices/dom25014_sp.html',
  landingPageUrl: 'https://www.eaa.org/airventure/eaa-fly-in-flying-to-oshkosh/eaa-airventure-oshkosh-notam',
  faaIndexUrl: 'https://www.faa.gov/air_traffic/publications/domesticnotices/',
  publishedAt: '2025-05-20',
  notes:
    'The 2026 Notice publishes mid-May (historical: 2025 = 20 May). Procedural ' +
    'data here is based on the 2025 Notice. Confirm against the 2026 Notice on release.'
}

export const event: EventFacts = {
  startDate: '2026-07-20',
  endDate: '2026-07-26',
  airportIcao: 'KOSH',
  airportName: 'Wittman Regional',
  fieldElevationFt: 808,
  dailyAirportClosure: '20:00 - 07:00 CDT (no arrivals)',
  airshowWindows: [
    'Mon - Sat 14:15 - 18:30 CDT (airport closed during show + TFR)',
    'Sun 13:00 - 16:30 CDT',
    'Two night airshows 20:00 - 22:00 CDT (dates TBC in 2026 Notice)'
  ],
  smsStatusInstructions: 'Text OSHARRIVAL to 64600 (alt: 1-855-485-5674) for live arrival status.',
  notes: [
    'Arrivals normally resume ~30 min after each daytime airshow.',
    'Vertical Lift Center new for 2026 - affects rotorcraft static display, not arrival routing.',
    'Featured service: U.S. Pacific Air Forces (PACAF).'
  ]
}

/**
 * Whether the embedded baseline can be used for flight-day mode.
 * False until the 2026 Notice has been released and embedded.
 */
export const isFlightDayUnlocked = (): boolean =>
  notice.status === 'released' && notice.baselineYear === notice.requiredYear
