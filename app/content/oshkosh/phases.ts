import type { PhaseDefinition, PhaseId } from './types'

/**
 * Named flight phases. Replaces the legacy numeric `stages[]` and provides
 * a stable ID surface for state, geofencing, and URL persistence.
 */
export const phases: PhaseDefinition[] = [
  {
    id: 'preflight',
    order: 0,
    title: 'Preflight & briefing',
    cockpitTitle: 'Preflight',
    summary: 'Read the Notice. Ready charts, signs, and EFB. Review personal minimums.',
    briefing:
      'The FAA AirVenture Notice is the only authoritative source for arrival procedures. ' +
      'Read it cover-to-cover. Confirm your EFB has the FISK arrival loaded in the current database. ' +
      'Print physical arrival/parking signs - tablet signs are NOT accepted.',
    primaryActions: [
      { id: 'read-notice', text: 'Read current FAA AirVenture Notice cover-to-cover.', required: true },
      { id: 'load-charts', text: 'Load Chicago Sectional, VFR Flyway, KOSH + alternate diagrams.' },
      { id: 'verify-efb', text: 'Confirm EFB has FISK arrival in current database.' },
      { id: 'load-waypoints', text: 'Load VFR waypoints VPENV, VPPLK, VPGRN, VPRIP, VPFIS in GPS/EFB.' },
      { id: 'check-tfr', text: 'Check tfr.faa.gov for the AirVenture TFR and any en-route TFRs.' },
      { id: 'check-moas', text: 'Check NOTAMs for large MOAs in west-central Wisconsin.' },
      { id: 'print-signs', text: 'Print arrival/parking signs from eaa.org/signs.', required: true }
    ],
    secondaryActions: [
      { id: 'fuel-plan', text: 'Plan fuel for 1+ hour holding plus go-arounds plus alternate.' },
      { id: 'large-formations', text: 'Check large formation arrival schedule; expect Fisk delays Sat Jul 18 and Sun Jul 19.' },
      { id: 'parking-status', text: 'Check eaa.org/aircraftparking for parking saturation.' },
      { id: 'brief-navigator', text: 'Brief right-seat / navigator on role split.' }
    ],
    warnings: [
      'Tablet-displayed parking signs are NOT accepted - print physical signs.',
      'Canadian EAB/basic/advanced ultralight pilots need FAA Special Flight Authorization before U.S. operations.'
    ],
    sources: ['faa-2026-notice', 'eaa-tips', 'eaa-signs', 'osh26-research']
  },
  {
    id: 'enroute',
    order: 1,
    title: 'En route to the transition',
    cockpitTitle: 'En route',
    summary: 'Tune Arrival ATIS at 60 NM. Lights ON at 50 NM. Listen for transition assignment.',
    briefing:
      'Inside 70 NM you will not get VFR flight following from Milwaukee. ' +
      'At 60 NM tune Arrival ATIS 125.9 in COM2 - note runway, transition, and parking saturation. ' +
      'At 50 NM all exterior lights ON, transponder ON. Approaching the transition, tune Fisk Approach 120.7 in COM1.',
    primaryActions: [
      { id: 'atis-125-9', text: 'Tune Arrival ATIS 125.9 in COM2 at 60 NM.' },
      { id: 'note-runway', text: 'Note active runway, transition starting point, holding status.' },
      { id: 'lights-on', text: 'All exterior lights ON at 50 NM. Transponder ON.' },
      { id: 'fisk-120-7', text: 'Tune Fisk Approach 120.7 in COM1 approaching the transition.' }
    ],
    secondaryActions: [
      { id: 'chicago-flyway', text: 'If transiting Chicago, use the VFR Flyway Planning Chart.' },
      { id: 'chicago-freqs', text: 'Chicago VFR services at/above 5,500: 128.57 north of ORD, 126.62 south of ORD.' },
      { id: 'mdw-shoreline', text: 'Shoreline transit: monitor MDW ATIS 132.75 and remain below MDW Class C.' }
    ],
    warnings: [
      'No VFR flight following within 70 NM of OSH.',
      'Chicago Class Bravo clearances for VFR aircraft are not available.',
      'Use caution for west-side Chicago Class Bravo jet traffic at 4,000 ft and parachute activity near 8N2, RPJ, and 44C.'
    ],
    sources: ['faa-2026-notice', 'osh26-research']
  },
  {
    id: 'transition',
    order: 2,
    title: 'Active transition',
    cockpitTitle: 'Transition',
    summary: 'Pick the transition assigned on ATIS. Do not freelance. Maintain speed/altitude regime.',
    briefing:
      'ATC announces the active transition starting point on the Arrival ATIS. ' +
      'Real-time changes are announced on Fisk Approach 120.7. Pick the announced transition. ' +
      'Standard 90 kt / 1,800 MSL or high-performance 135 kt / 2,300 MSL.',
    primaryActions: [
      { id: 'cross-start', text: 'Cross the assigned transition start waypoint.' },
      { id: 'speed-alt', text: 'Set 90 kt / 1,800 MSL (or 135 / 2,300).' },
      { id: 'in-trail', text: 'Find a similar-speed aircraft ahead, sit 0.5 NM in-trail.' }
    ],
    speedAltitude: [
      { ias_kt: 90, altitude_ft_msl: 1800, label: 'Standard' },
      { ias_kt: 135, altitude_ft_msl: 2300, label: 'High-performance' }
    ],
    warnings: [
      'No side-by-side except declared flights.',
      'No overtaking unless ATC-authorized.',
      'No S-turning - if too fast, break off and restart at the transition start.',
      'Flights should advise Fisk on 120.7 as a flight of number and type when traffic permits.'
    ],
    sources: ['faa-2026-notice', 'osh26-research']
  },
  {
    id: 'ripon-to-fisk',
    order: 3,
    title: 'Ripon to Fisk (the conga line)',
    cockpitTitle: 'Tracks NE',
    summary: 'Fly directly over the railroad tracks NE. Sterile cockpit. No verbal acknowledgement required.',
    briefing:
      'Fly directly over the railroad tracks heading NE. Hold 90 kt / 1,800 MSL ' +
      '(or 135 / 2,300). Sit 0.5 NM in-trail. Lower the gear before Fisk if retract. ' +
      'Listen continuously to Fisk Approach 120.7 - silent unless ATC speaks to you.',
    primaryActions: [
      { id: 'follow-tracks', text: 'Fly DIRECTLY over the tracks - no S-turning.', required: true },
      { id: 'maintain-speed', text: 'Hold 90 kt / 1,800 MSL.', required: true },
      { id: 'gear-down', text: 'Gear down before Fisk (if retractable).' },
      { id: 'sterile', text: 'Sterile cockpit. Volume up on radio, low on intercom.' }
    ],
    secondaryActions: [
      { id: 'navigator-traffic', text: 'Navigator: scan 11 and 1 o clock for traffic on the tracks.' },
      { id: 'pickett-plume', text: 'Look for the Pickett grain-dryer plume ~4 NM SW of Fisk.' }
    ],
    speedAltitude: [
      { ias_kt: 90, altitude_ft_msl: 1800, label: 'Standard' },
      { ias_kt: 135, altitude_ft_msl: 2300, label: 'High-performance' }
    ],
    warnings: [
      'No verbal acknowledgement required; request clarification on frequency if needed.',
      'Cat 1/2 separation reduced under FAA waiver - expect VERY close traffic.'
    ],
    sources: ['faa-2026-notice', 'osh26-research']
  },
  {
    id: 'at-fisk',
    order: 4,
    title: 'At Fisk - capture assignment',
    cockpitTitle: 'Fisk',
    summary: 'ATC issues runway + transition method + tower frequency. Do not pass Fisk until called.',
    briefing:
      'Within ~2 NM of Fisk, ATC will identify you by colour and type, then issue: ' +
      'a runway, a transition method (railroad tracks NE, OR Fisk Avenue east), ' +
      'and a tower frequency. Do NOT pass Fisk and do NOT change to tower until called.',
    primaryActions: [
      { id: 'capture-call', text: 'Capture: runway, transition method, tower frequency.', required: true },
      { id: 'switch-tower', text: 'Switch to assigned tower frequency only after the call.' }
    ],
    warnings: [
      'For Fisk Ave, navigate close to the road on the south side while remaining NORTH of the microwave tower.',
      'Do not confuse Fisk Avenue with Highway 44.'
    ],
    sources: ['faa-2026-notice', 'osh26-research']
  },
  {
    id: 'inbound-runway',
    order: 5,
    title: 'Inbound to runway',
    cockpitTitle: 'Inbound',
    summary: 'Maintain 90 kt to pattern. Land on the assigned colored dot. Expect short approach.',
    briefing:
      'Hold 90 kt until pattern entry. Be ready for a short approach with descending turns ' +
      'and a touchdown well down the runway. Cat 1/2 separation reduced - expect very close traffic. ' +
      '"Line up and wait" may be issued on both sides of the runway centerline simultaneously.',
    primaryActions: [
      { id: 'land-dot', text: 'Land on the colored dot ATC assigned.', required: true },
      { id: 'short-approach', text: 'Be ready for a short approach with descending turns.' },
      { id: 'eyes-out', text: 'Eyes outside - departure traffic is on a separate frequency.' }
    ],
    warnings: [
      'Do not land before the relocated threshold (RWY 18R) without tower OK.',
      'Notify ATC IMMEDIATELY for go-around resequencing.'
    ],
    sources: ['faa-2026-notice', 'osh26-research']
  },
  {
    id: 'ground',
    order: 6,
    title: 'Rollout, exit, taxi, parking',
    cockpitTitle: 'Ground',
    summary: 'Clear runway as directed. Display printed sign. Follow flag-person hand signals only.',
    briefing:
      'Decelerate, clear to the side directed by the pink-shirt or hand signal. ' +
      'Stop on the grass after exit - do NOT turn back onto the runway. ' +
      'Place the printed parking sign on the LEFT side of the windshield. ' +
      'Follow EAA flag-person hand signals exclusively - no ground-control radio calls.',
    primaryActions: [
      { id: 'exit-clear', text: 'Exit at the next exit; stop on grass after exit.', required: true },
      { id: 'sign-windshield', text: 'Place printed sign on LEFT side of windshield.', required: true },
      { id: 'follow-flagperson', text: 'Follow flag-person hand signals exclusively.' },
      { id: 'tiedown', text: 'Tie down (grass) or chock (paved). Bring your own tiedowns.' }
    ],
    warnings: [
      'Tablet-displayed signs are NOT accepted.',
      'No bicycles/motorcycles on movement areas.',
      'Do not cross taxiways/runways on foot.'
    ],
    sources: ['faa-2026-notice', 'eaa-aircraft-parking', 'eaa-signs']
  },
  {
    id: 'depart',
    order: 7,
    title: 'Departure',
    cockpitTitle: 'Depart',
    summary: 'Departure ATIS 121.75, runway-specific monitor frequencies, then published route after takeoff.',
    briefing:
      'Tune Departure ATIS 121.75. Use VFR/IFR sign on departure day. ' +
      'Do not start engines or move aircraft until the Departure ATIS says the airport is open. ' +
      'Monitor the runway departure point controller frequency, then after takeoff fly the published departure route.',
    primaryActions: [
      { id: 'departure-atis', text: 'Tune Departure ATIS 121.75 before engine start.' },
      { id: 'departure-sign', text: 'Display VFR or IFR departure sign.' },
      { id: 'vfr-taxi', text: 'VFR: taxi toward assigned runway without calling Ground; follow EAA flagpersons.' },
      { id: 'ifr-clearance', text: 'IFR: request Clearance Delivery 119.05 before engine start; stay there until told to contact Ground 132.3.' },
      { id: 'ifr-taxi', text: 'IFR: taxi as instructed by Ground Control and EAA flagpersons.' },
      { id: 'monitor-freq', text: 'Monitor the runway departure point controller frequency before takeoff.' }
    ],
    warnings: [
      'Do not depart on RWYs 13/31 or 5/23; they are closed.',
      'RWY 36L departures: turn right to heading 150 deg prior to the ATC Tower.',
      'When OSH is IFR, taxiing is prohibited except for aircraft with an IFR clearance.'
    ],
    sources: ['faa-2026-notice']
  }
]

export const phaseById = (id: PhaseId): PhaseDefinition | undefined =>
  phases.find((p) => p.id === id)

export const phaseAtOrder = (order: number): PhaseDefinition | undefined =>
  phases.find((p) => p.order === order)

export const firstPhase: PhaseDefinition = phases[0]
export const lastPhase: PhaseDefinition = phases[phases.length - 1]

export const phaseIdAtOrder = (order: number): PhaseId =>
  (phaseAtOrder(order) ?? firstPhase).id
