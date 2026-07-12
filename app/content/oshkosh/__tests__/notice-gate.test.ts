import { describe, expect, it } from 'vitest'

import { canUseFlightMode, isNoticeContentCurrent, notice } from '..'

describe('Flight mode Notice gate', () => {
  it('requires current released content and explicit acknowledgement', () => {
    expect(canUseFlightMode(null)).toBe(false)
    expect(canUseFlightMode(2025)).toBe(false)
    expect(canUseFlightMode(2026)).toBe(true)
  })

  it('blocks an unreleased or wrong-year Notice even if acknowledged', () => {
    expect(canUseFlightMode(2026, { ...notice, status: 'baseline' })).toBe(false)
    expect(canUseFlightMode(2026, { ...notice, baselineYear: 2025 })).toBe(false)
    expect(isNoticeContentCurrent({ ...notice, requiredYear: 2027 })).toBe(false)
  })
})
