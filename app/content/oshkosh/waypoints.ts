import type { VfrWaypoint } from './types'

/**
 * FAA-published VFR waypoints used for the Fisk Arrival.
 * All coordinates verified against the OSH26 research package.
 * Fisk position uses the existing app value (FAA-published; verify before release).
 */
export const waypoints: VfrWaypoint[] = [
  {
    id: 'vpenv',
    faaId: 'VPENV',
    name: 'Endeavor Bridge',
    position: [43.7508, -89.4822],
    description:
      'Jct I-39 + railroad tracks N of Endeavor, WI. ATC-assigned only in extremely high traffic.',
    distanceNmFromOsh: 47
  },
  {
    id: 'vpplk',
    faaId: 'VPPLK',
    name: 'Puckaway Lake (SW)',
    position: [43.7403, -89.2247],
    description: 'Keep Puckaway shoreline OFF YOUR LEFT. 36 NM SW of OSH.',
    distanceNmFromOsh: 36
  },
  {
    id: 'vpgrn',
    faaId: 'VPGRN',
    name: 'Green Lake (SW)',
    position: [43.7689, -89.0472],
    description: 'Single file SW corner Green Lake to Ripon. 26 NM SW of OSH.',
    distanceNmFromOsh: 26
  },
  {
    id: 'vprip',
    faaId: 'VPRIP',
    name: 'Ripon',
    position: [43.8381, -88.8444],
    description: 'NE corner of town. OSH 232 / 15.5 DME. Begin railroad-track leg to Fisk.',
    distanceNmFromOsh: 15.5
  },
  {
    id: 'vpfis',
    faaId: 'VPFIS',
    name: 'Fisk',
    position: [43.7702, -88.5494],
    description:
      'ATC issues runway + tower frequency at Fisk. Sit silent on 120.7 until called.',
    distanceNmFromOsh: 5
  },
  {
    id: 'kosh',
    name: 'Wittman Regional (KOSH)',
    position: [43.984444, -88.557222],
    description: 'Field elevation 808 ft MSL.',
    distanceNmFromOsh: 0
  },
  {
    id: 'rush-lake',
    name: 'Rush Lake (Hold)',
    position: [43.86, -88.78],
    description: 'ATC-discretionary hold for traffic at/beyond Ripon.',
    distanceNmFromOsh: 13
  },
  {
    id: 'warbird-island',
    name: 'Warbird Island',
    position: [43.92, -88.49],
    description: 'Turbine/Warbird arrival report point. 6 NM SE of OSH.',
    distanceNmFromOsh: 6
  }
]

export const waypointById = (id: string): VfrWaypoint | undefined =>
  waypoints.find((w) => w.id === id)
