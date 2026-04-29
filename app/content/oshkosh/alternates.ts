import type { AlternateAirport } from './types'

export const alternates: AlternateAirport[] = [
  {
    id: 'kfld',
    icao: 'KFLD',
    name: 'Fond du Lac',
    description: 'Closest alternate. Temporary FAA tower active during event week.',
    hasTower: true,
    notes: [
      'ATIS 121.1, Tower 120.4, Ground 121.85.',
      'Bus / shuttle service to OSH typically available.'
    ],
    contactPhone: '920-922-6000'
  },
  {
    id: 'katw',
    icao: 'KATW',
    name: 'Appleton International',
    description: 'Full-time tower. Primary airline alternate.',
    hasTower: true,
    notes: ['ATIS 127.15, Tower 119.6, EAA Parking 129.05.'],
    contactPhone: '920-738-3034'
  },
  {
    id: 'kgrb',
    icao: 'KGRB',
    name: 'Green Bay - Austin Straubel',
    description: 'Full-time tower. Use when KFLD/KATW saturated.',
    hasTower: true
  }
]

export const alternateById = (id: string): AlternateAirport | undefined =>
  alternates.find((a) => a.id === id)
