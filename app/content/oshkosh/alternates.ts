import type { AlternateAirport } from './types'

export const alternates: AlternateAirport[] = [
  {
    id: 'kfld',
    icao: 'KFLD',
    name: 'Fond du Lac',
    description: 'Closest alternate. Temporary FAA tower active Jul 18-26.',
    hasTower: true,
    notes: [
      'ATIS 121.1, Tower 120.4, Ground 121.85.',
      'Tower operates 7:00 AM-8:30 PM CDT, except closes 2:00 PM Sun Jul 26.',
      'Communication with FLD Tower required at or below 3,300 MSL within 4 NM.',
      'If diverting on a VFR flight plan, change your destination with Flight Service.',
      'Bus / shuttle service to OSH typically available.'
    ],
    contactPhone: '920-922-6000',
    contactPurpose: 'Fond du Lac Skyport hard-surface parking arrangements',
    referenceUrl: 'https://www.faa.gov/air_traffic/flight_info/aeronav/digital_products/dafd/',
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Fond du Lac Arrival/Departure' }]
  },
  {
    id: 'katw',
    icao: 'KATW',
    name: 'Appleton International',
    description: 'Tower 5:30 AM-11:00 PM CDT daily; CTAF 119.6 when closed.',
    hasTower: true,
    notes: [
      'ATIS 127.15, Tower/CTAF 119.6, Ground 121.7, Show Parking 129.05.',
      'Grass and hard-surface EAA operations closed 8:00 PM-6:00 AM CDT Jul 18-26.',
      'Camping not allowed; parking brakes must remain OFF while parked.',
      'Self-service fuel unavailable during AirVenture.'
    ],
    referenceUrl: 'https://www.faa.gov/air_traffic/flight_info/aeronav/digital_products/dafd/',
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Appleton Arrival/Departure' }]
  },
  {
    id: 'kgrb',
    icao: 'KGRB',
    name: 'Green Bay - Austin Straubel',
    description: 'One of the alternate airports listed in the Notice. Brief current weather, NOTAMs, airport information, fuel, and onward transportation.',
    hasTower: true,
    referenceUrl: 'https://www.faa.gov/air_traffic/flight_info/aeronav/digital_products/dafd/',
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Preflight Planning - Planning Your Alternate Airport' }]
  }
]

export const alternateById = (id: string): AlternateAirport | undefined =>
  alternates.find((a) => a.id === id)
