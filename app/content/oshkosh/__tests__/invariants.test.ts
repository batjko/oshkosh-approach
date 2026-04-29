/**
 * Lightweight content invariants. Run as a plain node script:
 *   node --experimental-vm-modules ... (or via vitest if added).
 *
 * The assertions are intentionally framework-free so they can run from
 * `tsx`, `node`, or any future test runner without binding to a specific
 * one. They guard against drift in the canonical content layer.
 */
import {
  arrivalSigns,
  departureSigns,
  frequencies,
  headerFrequencyIds,
  notice,
  phases,
  runways,
  transitions,
  waypoints
} from '..'

const assert = (cond: unknown, msg: string) => {
  if (!cond) throw new Error(`Invariant failed: ${msg}`)
}

const assertions: Array<[string, () => void]> = [
  ['phases ordered uniquely', () => {
    const orders = phases.map((p) => p.order)
    assert(new Set(orders).size === orders.length, 'phase order collision')
    const sorted = [...orders].sort((a, b) => a - b)
    sorted.forEach((o, i) => assert(o === i, `phase order gap at ${i}`))
  }],
  ['header frequencies resolve', () => {
    headerFrequencyIds.forEach((id) =>
      assert(frequencies.find((f) => f.id === id), `missing frequency ${id}`)
    )
  }],
  ['runway tower freqs known', () => {
    const towerFreqs = new Set(['118.5', '126.6'])
    runways.forEach((r) =>
      assert(towerFreqs.has(r.towerFreq), `runway ${r.id} bad tower freq`)
    )
  }],
  ['transitions point to known waypoints', () => {
    transitions.forEach((t) =>
      assert(
        waypoints.find((w) => w.id === t.startWaypointId),
        `transition ${t.id} unknown waypoint`
      )
    )
  }],
  ['notice gate requires 2026', () => {
    assert(notice.requiredYear === 2026, 'requiredYear must be 2026')
  }],
  ['arrival/departure sign codes are uppercase', () => {
    [...arrivalSigns, ...departureSigns].forEach((s) =>
      assert(s.code === s.code.toUpperCase(), `sign ${s.code} not uppercase`)
    )
  }]
]

let failed = 0
for (const [name, run] of assertions) {
  try {
    run()
    console.log(`ok - ${name}`)
  } catch (err) {
    failed += 1
    console.error(`fail - ${name}: ${(err as Error).message}`)
  }
}

if (failed > 0) {
  console.error(`${failed} invariant(s) failed`)
  process.exitCode = 1
} else {
  console.log(`all ${assertions.length} invariants passed`)
}
