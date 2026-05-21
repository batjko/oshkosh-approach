import type { ParkingSign } from './types'

/**
 * Windshield signs for arrival/departure. Print physical signs from
 * eaa.org/signs - tablet-displayed signs are NOT accepted.
 */
export const arrivalSigns: ParkingSign[] = [
  { code: 'HBC', meaning: 'Homebuilt Camping', category: 'arrival' },
  { code: 'HBP', meaning: 'Homebuilt Parking', category: 'arrival' },
  { code: 'VAC', meaning: 'Vintage Aircraft Camping', category: 'arrival' },
  { code: 'VAP', meaning: 'Vintage Aircraft Parking', category: 'arrival' },
  { code: 'GAC', meaning: 'General Aviation Camping', category: 'arrival' },
  { code: 'GAP', meaning: 'General Aviation Parking', category: 'arrival' },
  { code: 'WB', meaning: 'Warbird Area', category: 'arrival' },
  { code: 'FBO', meaning: 'Basler FBO (hard surface, fueling)', category: 'arrival' },
  { code: 'SP', meaning: 'Seaplane / Amphibian', category: 'arrival' },
  { code: 'IAC', meaning: 'International Aerobatic Club', category: 'arrival' },
  { code: 'EXP', meaning: 'Camp Scholler Express', category: 'arrival' }
]

export const departureSigns: ParkingSign[] = [
  { code: 'VFR', meaning: 'VFR departure', category: 'departure' },
  { code: 'IFR', meaning: 'IFR departure', category: 'departure' }
]

export const signModifiers: ParkingSign[] = [
  { code: 'N', meaning: 'Request North 40 (GAC/GAP only - not guaranteed)', category: 'modifier' },
  { code: 'S', meaning: 'Request South 40 (GAC/GAP only - not guaranteed)', category: 'modifier' }
]

export const signRules = [
  'Dark block letters, readable at 50 ft.',
  'Display in LEFT side of windshield after landing.',
  'Tablet-displayed signs are NOT accepted - print physical signs.',
  'Print signs from eaa.org/signs.'
]
