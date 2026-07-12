import type { SourceRef } from './types'

/**
 * Canonical source references. Every procedural value in the UI should be
 * traceable to one of these entries via `sources: ['source-id', ...]`.
 */
export const sources: Record<string, SourceRef> = {
  'faa-2026-notice': {
    id: 'faa-2026-notice',
    label: 'FAA/EAA 2026 AirVenture Notice',
    url: 'https://www.faa.gov/AIR_TRAFFIC/PUBLICATIONS/domesticnotices/dom26020_sp.html',
    publishedAt: '2026-05-21'
  },
  'eaa-notam-page': {
    id: 'eaa-notam-page',
    label: 'EAA AirVenture Notice landing page',
    url: 'https://www.eaa.org/airventure/eaa-fly-in-flying-to-oshkosh/eaa-airventure-oshkosh-notam'
  },
  'eaa-flying-hub': {
    id: 'eaa-flying-hub',
    label: 'EAA "Flying to Oshkosh" hub',
    url: 'https://www.eaa.org/airventure/eaa-fly-in-flying-to-oshkosh'
  },
  'eaa-tips': {
    id: 'eaa-tips',
    label: 'EAA Tips for Flying In',
    url: 'https://www.eaa.org/airventure/eaa-fly-in-flying-to-oshkosh/tips-for-flying-in'
  },
  'eaa-aircraft-parking': {
    id: 'eaa-aircraft-parking',
    label: 'EAA Aircraft Parking',
    url: 'https://www.eaa.org/airventure/plan-your-eaa-airventure-trip/aircraft-parking'
  },
  'eaa-signs': {
    id: 'eaa-signs',
    label: 'EAA Arrival/Parking Signs',
    url: 'https://www.eaa.org/signs'
  },
  'eaa-parking-status': {
    id: 'eaa-parking-status',
    label: 'EAA live parking status',
    url: 'https://www.eaa.org/aircraftparking'
  },
  'eaa-mass-arrivals': {
    id: 'eaa-mass-arrivals',
    label: 'EAA live mass-arrival schedule',
    url: 'https://www.eaa.org/airventure/features-and-attractions/mass-arrivals'
  },
  'faa-chart-supplement': {
    id: 'faa-chart-supplement',
    label: 'FAA Chart Supplement downloads',
    url: 'https://www.faa.gov/air_traffic/flight_info/aeronav/digital_products/dafd/'
  },
  'faa-tfr': {
    id: 'faa-tfr',
    label: 'FAA TFR display',
    url: 'https://tfr.faa.gov/'
  },
  'faa-domestic-notices': {
    id: 'faa-domestic-notices',
    label: 'FAA Domestic Notices index',
    url: 'https://www.faa.gov/air_traffic/publications/domesticnotices/'
  },
  'eaa-seaplane': {
    id: 'eaa-seaplane',
    label: 'EAA Seaplane Base info',
    url: 'https://www.eaa.org/seaplanebase'
  },
  'eaa-helicopter': {
    id: 'eaa-helicopter',
    label: 'EAA Transient Helicopter info',
    url: 'https://www.eaa.org/transienthelicopter'
  },
  'eaa-ultralight': {
    id: 'eaa-ultralight',
    label: 'EAA Ultralight arrivals',
    url: 'https://www.eaa.org/ultralightarrivals'
  }
}

export const sourceList = (ids: string[]): SourceRef[] =>
  ids.map((id) => sources[id]).filter((s): s is SourceRef => Boolean(s))
