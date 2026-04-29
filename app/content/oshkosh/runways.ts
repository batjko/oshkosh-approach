import type { RunwayDefinition } from './types'

export const runways: RunwayDefinition[] = [
  {
    id: 'rwy-9',
    label: 'Runway 9',
    towerFreq: '118.5',
    widthFt: 150,
    thresholdFtRemaining: 6179,
    aimPoints: [
      { id: 'white-dot-9', label: 'White dot', colorHex: '#f8fafc', feetRemaining: 4400, shape: 'dot' }
    ],
    rules: [
      'If aircraft <6,250 lb, exit to sod L or R when speed permits.',
      'Do NOT turn back onto the runway.'
    ]
  },
  {
    id: 'rwy-27',
    label: 'Runway 27',
    towerFreq: '118.5',
    displacedThresholdFtRemaining: 5647,
    shortApproach: true,
    aimPoints: [
      { id: 'orange-dot-27', label: 'Orange dot', colorHex: '#fb923c', feetRemaining: 4600, shape: 'dot' },
      { id: 'green-dot-27', label: 'Green dot', colorHex: '#22c55e', feetRemaining: 3100, shape: 'dot' }
    ],
    rules: [
      'Turn base BEFORE the shoreline (Lake Winnebago).',
      'Do not cross the shoreline unless cleared.',
      'If <6,250 lb, exit to sod when speed permits.'
    ]
  },
  {
    id: 'rwy-18r',
    label: 'Runway 18R',
    towerFreq: '126.6',
    shortApproach: true,
    longLanding: true,
    aimPoints: [
      { id: 'blue-dot-18r', label: 'Blue dot', colorHex: '#3b82f6', feetRemaining: 6350, shape: 'dot' },
      { id: 'pink-dot-18r', label: 'Pink dot', colorHex: '#ec4899', feetRemaining: 4850, shape: 'dot' }
    ],
    rules: [
      'Turn base abeam the Blue Dot.',
      'If unable, immediate right turn SE for resequencing.',
      'Relocated threshold beyond concrete edge - REIL + white lines.',
      'Do not land short of the relocated threshold without tower OK.'
    ]
  },
  {
    id: 'rwy-36l',
    label: 'Runway 36L',
    towerFreq: '126.6',
    widthFt: 150,
    thresholdFtRemaining: 6700,
    aimPoints: [
      { id: 'yellow-dot-36l', label: 'Yellow dot', colorHex: '#fde047', feetRemaining: 3400, shape: 'dot' },
      { id: 'purple-dot-36l', label: 'Purple dot', colorHex: '#a855f7', feetRemaining: 4950, shape: 'dot' }
    ],
    rules: [
      'Do NOT roll past the Blue Dot without tower authorization.'
    ]
  },
  {
    id: 'rwy-36r',
    label: 'Runway 36R',
    towerFreq: '126.6',
    widthFt: 60,
    thresholdFtRemaining: 6300,
    aimPoints: [
      { id: 'red-square-36r', label: 'Red square', colorHex: '#ef4444', feetRemaining: 3150, shape: 'square' },
      { id: 'green-square-36r', label: 'Green square', colorHex: '#16a34a', feetRemaining: 4700, shape: 'square' }
    ],
    rules: [
      'Expect to land long, roll to end.',
      'Do not turn left unless advised.',
      'If turning left, hold short of 36L until cleared via 126.6 or pink-shirt.'
    ]
  }
]

export const runwayById = (id: string): RunwayDefinition | undefined =>
  runways.find((r) => r.id === id)
