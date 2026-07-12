import type { NoticeMetadata, EventFacts } from './types'

/**
 * Notice metadata for the FAA/EAA 2026 AirVenture Notice.
 * Flight-day mode is gated on the user confirming they have read this
 * released Notice for the current year.
 */
export const notice: NoticeMetadata = {
  baselineYear: 2026,
  requiredYear: 2026,
  status: 'released',
  baselineUrl: 'https://www.faa.gov/AIR_TRAFFIC/PUBLICATIONS/domesticnotices/dom26020_sp.html',
  landingPageUrl: 'https://www.eaa.org/airventure/eaa-fly-in-flying-to-oshkosh/eaa-airventure-oshkosh-notam',
  faaIndexUrl: 'https://www.faa.gov/air_traffic/publications/domesticnotices/',
  publishedAt: '2026-05-21',
  notes:
    'Procedural data is embedded from the released 2026 FAA/EAA AirVenture Notice. ' +
    'Keep the official Notice available for in-flight reference.'
}

export const event: EventFacts = {
  eventStartDate: '2026-07-20',
  eventEndDate: '2026-07-26',
  procedureStart: '2026-07-16T12:00:00-05:00',
  procedureEnd: '2026-07-27T12:00:00-05:00',
  procedureEffectiveWindow: 'Noon CDT Jul 16 - Noon CDT Jul 27, 2026',
  airportIcao: 'KOSH',
  airportName: 'Wittman Regional',
  fieldElevationFt: 808,
  dailyAirportClosure: 'Arrivals closed 20:00 - 07:00 CDT daily; departures closed 20:00 - 06:00 CDT daily.',
  airshowWindows: [
    'Mon Jul 20 - Sat Jul 25: 14:15 - 18:30 CDT',
    'Wed Jul 22: 20:00 - 22:30 CDT night show',
    'Sat Jul 25: 20:00 - 22:30 CDT night show',
    'Sun Jul 26: 13:00 - 17:00 CDT'
  ],
  notes: [
    'Arrivals normally resume ~30 min after each daytime airshow.',
    'Thursday Jul 23: no Fisk arrivals before 08:00 CDT.',
    'Some aircraft camping and parking areas changed for 2026; follow ground marshal signals.'
  ]
}

/**
 * Whether the embedded Notice can be used for flight-day mode.
 */
export const isNoticeContentCurrent = (
  metadata: NoticeMetadata = notice
): boolean =>
  metadata.status === 'released' && metadata.baselineYear === metadata.requiredYear

export const canUseFlightMode = (
  acknowledgedYear: number | null,
  metadata: NoticeMetadata = notice
): boolean =>
  isNoticeContentCurrent(metadata) && acknowledgedYear === metadata.requiredYear
