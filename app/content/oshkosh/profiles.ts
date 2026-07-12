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
      'Remain at least ½ NM in trail behind the aircraft you are following.',
      'No S-turning to slow down. Break off and restart at the transition start.',
      'If unable to comfortably operate at 90 kt, use maximum cruising speed; ATC recommends arriving at Fisk 7:00-7:30 AM if practicable.'
    ],
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Fisk VFR Arrival to OSH' }]
  },
  {
    id: 'high-performance',
    label: 'Faster Fisk option',
    description: 'Use 135 kt at 2,300 MSL when needed for safety of flight.',
    arrivalRoute: 'fisk',
    recommendedSpeedAlt: { ias_kt: 135, altitude_ft_msl: 2300, label: 'High-performance' },
    notes: ['Expect descent at or after Fisk.'],
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Fisk VFR Arrival - Approaching Transition Starting Point' }]
  },
  {
    id: 'turbine-warbird',
    label: 'Turbine / Warbird (>=130 kt cruise)',
    description: 'Restricted Notice procedure via Fond du Lac for eligible aircraft capable of at least 130 kt cruise.',
    arrivalRoute: 'fond-du-lac',
    notes: [
      'FLD temporary tower operates Sat Jul 18-Sun Jul 26, 7:00 AM-8:30 PM CDT, closing 2:00 PM Sun Jul 26.',
      'Avoid FLD airspace at/below 3,300 MSL within 4 NM.',
      'Descend to 2,800 MSL when 4 NM N of FLD, then direct Warbird Island.',
      'Report "city of Fond du Lac" then "Warbird Island" on 126.6 (RWY 36L/R) or 118.5.',
      'When cleared at Warbird Island, reduce to 150 kt or less and descend to 1,800 MSL (2,300 MSL for overhead).',
      'Overhead approaches may be requested to RWY 36L/R or RWY 27; break altitude 2,300 MSL.',
      'Warbird helicopters wishing to land in the warbird area require advanced approval; if needed, land short of OSH and call Tower 920-424-8002.',
      'Heavy aircraft (>12,500 lb) advise on initial contact.',
      'Avoid the VFR Fisk arrival area SW of OSH.'
    ],
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Turbine/Warbird Arrival' }]
  },
  {
    id: 'helicopter',
    label: 'Helicopter (transient)',
    description: 'VFR from the west, north of Waukau Avenue at 1,300 MSL.',
    arrivalRoute: 'transient-helicopter',
    notes: [
      'The 2026 Notice specifies 1,300 MSL but does not publish a helicopter speed.',
      'Stay south of RWY 9/27. Monitor 118.5.',
      'Helipad at Pioneer Airport (turf, white box around HELI).',
      'Transient helicopter flights are limited to arrivals and departures; no local flights.',
      'No arrivals/departures when OSH is IFR or closed (incl. airshow).',
      'Depart with Departure ATIS 121.75, then monitor Tower 118.5.',
      'Depart north of the AirVenture Museum, remain well south of the RWY 9/27 extended centerline, and remain south of Waukau Ave at 1,300 MSL until clear west.',
      'Hazards: ultralights <=1,100 MSL, EAA helicopter ops, zeppelin mooring.'
    ],
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Transient Helicopter VFR Arrival/Departure' }]
  },
  {
    id: 'ultralight',
    label: 'Ultralight / Homebuilt rotorcraft',
    description: 'Prior approval required from EAA Ultralight Ops.',
    arrivalRoute: 'ultralight',
    notes: [
      'The 2026 Notice does not publish a general ultralight speed/altitude pair.',
      'Procedure hours: Jul 18-19 7:00 AM-8:00 PM; Jul 20-26 7:00 AM-2:15 PM and 6:30-8:00 PM CDT.',
      'Approval phone: 920-230-7759.',
      'Helicopters and gyroplanes should arrive Noon-2:00 PM unless arranged; large helicopters use the transient helicopter procedure.',
      'Entry: Highway Z and Highway 26, ~5 NM SW of OSH.',
      'Arrival ATIS 125.9, then advisory 123.75.',
      'Pattern clockwise for SE landings, counter-clockwise for NW.',
      'Stay clear of OSH RWYs 18L/R and 36L/R.',
      'Runway closure is marked with a yellow X; be prepared to divert.',
      'Departing traffic has right of way; obtain Departure ATIS 121.75 before departure if radio equipped.',
      'Do not fly over people, houses, livestock, parked aircraft, etc. lower than 300 ft AGL.'
    ],
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Ultralight/Homebuilt Rotorcraft Arrival/Departure' }]
  },
  {
    id: 'seaplane',
    label: 'Seaplane Base (96WI)',
    description: 'Use the AirVenture Seaplane Base on the west shore of Lake Winnebago.',
    arrivalRoute: 'seaplane',
    notes: [
      'Operational Sat Jul 18-Sun Jul 26; Mon-Sat 8:00 AM-6:00 PM, Sun 8:00 AM-5:00 PM.',
      'The Notice specifies 1,350 MSL or below but does not publish a seaplane speed.',
      'Pattern over water, <=1,350 MSL, left turns. Freq 123.3.',
      'Do NOT use the Fisk arrival. Do NOT contact OSH Tower.',
      'Rough water alternate: Warbird Island. Phone 920-230-7829.',
      'Helicopter operations require prior approval via 920-230-7829.',
      'Pilot briefings are mandatory before local flights or departures.',
      'No takeoffs or landings in the lagoon; no takeoffs directly over shoreline or crowds.',
      'During OSH airshows, land outside the Airshow Demonstration Area and taxi to the Seaplane Base; no operations during TFRs.'
    ],
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'AirVenture Seaplane Base - VFR Arrival' }]
  },
  {
    id: 'amphibian-kosh',
    label: 'Amphibian landing at KOSH',
    description: 'Use the ATC-designated Fisk transition and display parking sign SP.',
    arrivalRoute: 'amphibian-fisk',
    recommendedSpeedAlt: { ias_kt: 90, altitude_ft_msl: 1800, label: 'Standard Fisk' },
    notes: [
      'Amphibians may land at OSH and park in the designated Vintage Aircraft area.',
      'Use the Fisk VFR Arrival and follow the standard slower/faster-aircraft provisions as applicable.',
      'Display windshield sign code SP after landing.'
    ],
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'AirVenture Seaplane Base - Amphibian Aircraft at OSH' }]
  },
  {
    id: 'nordo',
    label: 'NORDO (no-radio, vintage only)',
    description: 'Telephone OSH Tower at 920-424-8002 between 7 AM - 10 AM CDT.',
    arrivalRoute: 'nordo',
    notes: [
      'Land at an airport ~45 min from OSH first.',
      'ATC assigns route + runway per current conditions.',
      'Do not taxi across RWY 18R/36L without pink-shirt clearance.'
    ],
    guidanceType: 'faa-procedure',
    sourceRefs: [{ sourceId: 'faa-2026-notice', section: 'Oshkosh No-Radio Arrival' }]
  }
]

export const profileById = (id: string): AircraftProfile | undefined =>
  aircraftProfiles.find((p) => p.id === id)
