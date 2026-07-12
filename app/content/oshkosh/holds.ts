import type { HoldDefinition } from './types'

export const holds: HoldDefinition[] = [
  {
    id: 'rush-lake',
    name: 'Rush Lake',
    whenUsed: 'Aircraft at or beyond Ripon when ATC calls hold.',
    pattern: 'Standard left turns as depicted in the Notice.',
    exit: 'Rejoin tracks at SE corner of Rush Lake, then NE to Fisk.',
    altitudeFtMsl: 1800,
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Fisk Holding - Rush Lake' }]
  },
  {
    id: 'green-lake',
    name: 'Green Lake',
    whenUsed: 'Aircraft on the Green Lake transition.',
    pattern: 'As depicted in the Notice.',
    exit: 'From SE corner Green Lake, direct Ripon, tracks NE to Fisk.',
    altitudeFtMsl: 1800,
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Fisk Holding - Green Lake' }]
  },
  {
    id: 'puckaway-lake',
    name: 'Puckaway Lake',
    whenUsed: 'Aircraft on the Puckaway transition.',
    pattern: 'Counter-clockwise starting at the SW corner.',
    exit: 'From SW corner, published transition toward Green Lake.',
    altitudeFtMsl: 1800,
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Fisk Holding - Puckaway Lake' }]
  }
]

export const holdSpeedKt = 90
export const holdAltitudeFtMsl = 1800
export const holdHighSpeedKt = 135
export const holdHighAltitudeFtMsl = 2300
export const holdGeneralGuidance =
  'If holding is called while over Fisk, turn due westbound, remain single file north of the lakes, and return to the ATC-designated starting point.'
export const holdSaturationGuidance =
  'If holds are observed or reported nearing capacity, stay clear, proceed no further, make left turns over a ground point, and await ATC.'
