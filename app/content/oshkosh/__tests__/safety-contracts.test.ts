import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  aircraftProfiles,
  divertTriggers,
  phases,
  transitions
} from '..'

const root = process.cwd()
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8')

describe('safety copy contracts', () => {
  const operationalCopy = JSON.stringify({
    aircraftProfiles,
    divertTriggers,
    phases,
    transitions
  })

  it.each([
    '0.5 NM',
    'COM1',
    'COM2',
    '135 kt floor',
    'next exit',
    'stop on grass',
    'FISK arrival loaded',
    'Ripon (default)',
    'Always available unless ATC assigns another'
  ])('does not contain forbidden operational phrase %s', (phrase) => {
    expect(operationalCopy).not.toContain(phrase)
  })

  it('keeps the map free of inferred route geometry', () => {
    const source = read('app/components/map/ApproachMap.tsx')
    expect(source).not.toContain('Polyline')
    expect(source).not.toContain('finalApproachRoute')
    expect(source).not.toContain('railroadRoute')
    expect(source).toContain('Orientation only — not an FAA chart')
  })

  it('keeps GPS display-only', () => {
    const source = read('app/hooks/useGeolocation.ts')
    expect(source).not.toContain('setCurrentPhase')
    expect(source).not.toContain('getLocationSuggestedPhase')
    expect(source).toContain('GPS is display-only')
  })

  it('keeps raw NOTAM text primary and translation explicit', () => {
    const source = read('app/components/notams/NotamTextBox.tsx')
    expect(source).not.toContain('IntersectionObserver')
    expect(source).toContain('useState(false)')
    expect(source).toContain('AI-generated explanation — verify against the raw FAA NOTAM.')
    expect(source).toContain('Show raw FAA NOTAM text')
  })

  it('qualifies keyword priority and stale NOTAM states', () => {
    const list = read('app/components/notams/NotamList.tsx')
    const banner = read('app/components/shell/CriticalNotamBanner.tsx')
    expect(list).not.toContain("'Current NOTAMs'")
    expect(list).toContain("'NOTAMs not current'")
    expect(list).toContain('keyword-based scan aid')
    expect(banner).toContain('Potentially critical — keyword match')
  })
})
