import type { TransitionDefinition } from './types'

export const transitions: TransitionDefinition[] = [
  {
    id: 'endeavor-bridge',
    name: 'Endeavor Bridge',
    startWaypointId: 'vpenv',
    description: 'Used only in extremely high traffic. ~47 NM SW of OSH.',
    whenAssigned: 'ATC announces on 125.9 when activated.',
    steps: [
      'Cross VPENV (jct I-39 + tracks).',
      'Track 095 deg for ~11 NM (few visual references).',
      'Continue to SW corner Puckaway Lake.',
      'Continue to SW corner Green Lake, then Ripon.'
    ],
    highVolumeOnly: true
  },
  {
    id: 'puckaway-lake',
    name: 'Puckaway Lake',
    startWaypointId: 'vpplk',
    description: '36 NM SW of OSH. Keep shoreline off your LEFT.',
    whenAssigned: 'ATC may activate during heavier flows.',
    steps: [
      'Cross VPPLK at SW corner Puckaway Lake.',
      'Keep Puckaway shoreline OFF YOUR LEFT.',
      'Continue to SW corner Green Lake.',
      'Then to Ripon, then Fisk via tracks.'
    ]
  },
  {
    id: 'green-lake',
    name: 'Green Lake',
    startWaypointId: 'vpgrn',
    description: '26 NM SW of OSH.',
    whenAssigned: 'ATC may activate during heavier flows.',
    steps: [
      'Cross VPGRN at SW corner Green Lake.',
      'Single file to Ripon (VPRIP).',
      'Then Fisk via railroad tracks.'
    ]
  },
  {
    id: 'ripon',
    name: 'Ripon (default)',
    startWaypointId: 'vprip',
    description: 'Default single starting point if no transition assigned. Ripon is about 15 NM SW of OSH.',
    whenAssigned: 'Always available unless ATC assigns another.',
    steps: [
      'Cross VPRIP at NE corner of Ripon.',
      'Speed/altitude: 90 kt / 1,800 MSL (or 135 / 2,300).',
      'Find an aircraft of similar speed ahead, sit 0.5 NM in-trail.',
      'Follow railroad tracks NE to Fisk.'
    ]
  }
]

export const transitionById = (id: string): TransitionDefinition | undefined =>
  transitions.find((t) => t.id === id)
