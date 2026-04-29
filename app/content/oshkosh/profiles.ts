import type { AircraftProfile } from './types'

/**
 * Aircraft profiles drive UX branching: the standard Fisk Arrival vs the
 * specialty arrival paths described in section 9 of the OSH26 research.
 */
export const aircraftProfiles: AircraftProfile[] = [
  {
    id: 'standard',
    label: 'Standard piston (90 kt capable)',
    description: 'Most GA pilots. Default Fisk Arrival, 90 kt / 1,800 MSL.',
    arrivalRoute: 'fisk',
    recommendedSpeedAlt: { ias_kt: 90, altitude_ft_msl: 1800, label: 'Standard' },
    notes: [
      'Maintain 0.5 NM in-trail behind the aircraft you are following.',
      'No S-turning to slow down. Break off and restart at the transition start.'
    ]
  },
  {
    id: 'high-performance',
    label: 'High performance (135 kt floor)',
    description: 'Use when 90 kt is unsafe. 135 kt at 2,300 MSL.',
    arrivalRoute: 'fisk',
    recommendedSpeedAlt: { ias_kt: 135, altitude_ft_msl: 2300, label: 'High-performance' },
    notes: ['Stay above the standard layer. ATC will sequence you accordingly.']
  },
  {
    id: 'turbine-warbird',
    label: 'Turbine / Warbird (>=130 kt cruise)',
    description: 'Use Fond du Lac entry, NOT Ripon-Fisk.',
    arrivalRoute: 'fond-du-lac',
    recommendedSpeedAlt: { ias_kt: 150, altitude_ft_msl: 1800, label: 'Warbird' },
    notes: [
      'Avoid FLD airspace at/below 3,300 MSL within 4 NM.',
      'Descend to 2,800 MSL when 4 NM N of FLD, then direct Warbird Island.',
      'Report "city of Fond du Lac" then "Warbird Island" on 126.6 (RWY 36L/R) or 118.5.',
      'Heavy aircraft (>12,500 lb) advise on initial contact.',
      'Avoid the VFR Fisk arrival area SW of OSH at all costs.'
    ]
  },
  {
    id: 'helicopter',
    label: 'Helicopter (transient)',
    description: 'VFR from the west, north of Waukau Avenue at 1,300 MSL.',
    arrivalRoute: 'transient-helicopter',
    recommendedSpeedAlt: { ias_kt: 80, altitude_ft_msl: 1300, label: 'Helicopter' },
    notes: [
      'Stay south of RWY 9/27. Monitor 118.5.',
      'Helipad at Pioneer Airport (turf, white box around HELI).',
      'No arrivals/departures when OSH is IFR or closed (incl. airshow).',
      'Hazards: ultralights <=1,100 MSL, EAA helicopter ops, zeppelin mooring.'
    ]
  },
  {
    id: 'ultralight',
    label: 'Ultralight / Homebuilt rotorcraft',
    description: 'Prior approval required from EAA Ultralight Ops.',
    arrivalRoute: 'ultralight',
    recommendedSpeedAlt: { ias_kt: 55, altitude_ft_msl: 1100, label: 'Ultralight' },
    notes: [
      'Approval phone: 920-230-7759.',
      'Entry: Highway Z and Highway 26, ~5 NM SW of OSH.',
      'Arrival ATIS 125.9, then advisory 123.75.',
      'Pattern clockwise for SE landings, counter-clockwise for NW.',
      'Stay clear of OSH RWYs 18L/R and 36L/R.'
    ]
  },
  {
    id: 'seaplane',
    label: 'Seaplane / Amphibian',
    description: 'File VFR to 96WI on west shore of Lake Winnebago.',
    arrivalRoute: 'seaplane',
    recommendedSpeedAlt: { ias_kt: 80, altitude_ft_msl: 1350, label: 'Seaplane' },
    notes: [
      'Pattern over water, <=1,350 MSL, left turns. Freq 123.3.',
      'Do NOT use the Fisk arrival. Do NOT contact OSH Tower.',
      'Rough water alternate: Warbird Island. Phone 920-230-7829.',
      'Closed during airshows / TFRs.'
    ]
  },
  {
    id: 'nordo',
    label: 'NORDO (no-radio, vintage only)',
    description: 'Telephone OSH Tower at 920-424-8002 between 7 AM - 10 AM CDT.',
    arrivalRoute: 'nordo',
    recommendedSpeedAlt: { ias_kt: 90, altitude_ft_msl: 1800, label: 'NORDO' },
    notes: [
      'Land at an airport ~45 min from OSH first.',
      'ATC assigns route + runway per current conditions.',
      'Do not taxi across RWY 18R/36L without pink-shirt clearance.'
    ]
  }
]

export const profileById = (id: string): AircraftProfile | undefined =>
  aircraftProfiles.find((p) => p.id === id)
