import { describe, expect, it } from 'vitest'

import {
  canShowPwaInstallCard,
  getPwaInstallMethod,
  isIosInstallCapable,
  type PwaInstallMethod
} from '../pwaInstall'

const visibleContext = (overrides: Partial<{
  storageChecked: boolean
  hasHydrated: boolean
  onboardingComplete: boolean
  mode: 'pre-flight' | 'in-flight'
  isStandalone: boolean
  dismissed: boolean
  method: PwaInstallMethod | null
}> = {}) => ({
  storageChecked: true,
  hasHydrated: true,
  onboardingComplete: true,
  mode: 'pre-flight' as const,
  isStandalone: false,
  dismissed: false,
  method: 'native_prompt' as const,
  ...overrides
})

describe('PWA installation eligibility', () => {
  it('detects iPhone, iPad, and desktop-class iPad Safari', () => {
    expect(isIosInstallCapable({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
      platform: 'iPhone',
      maxTouchPoints: 5
    })).toBe(true)
    expect(isIosInstallCapable({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)',
      platform: 'MacIntel',
      maxTouchPoints: 5
    })).toBe(true)
    expect(isIosInstallCapable({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)',
      platform: 'MacIntel',
      maxTouchPoints: 0
    })).toBe(false)
  })

  it('prefers the native prompt and otherwise uses iOS instructions', () => {
    expect(getPwaInstallMethod({ canInstall: true, canShowIosInstructions: true }))
      .toBe('native_prompt')
    expect(getPwaInstallMethod({ canInstall: false, canShowIosInstructions: true }))
      .toBe('ios_instructions')
    expect(getPwaInstallMethod({ canInstall: false, canShowIosInstructions: false }))
      .toBeNull()
  })

  it('shows only after onboarding in pre-flight browser mode', () => {
    expect(canShowPwaInstallCard(visibleContext())).toBe(true)
    expect(canShowPwaInstallCard(visibleContext({ onboardingComplete: false })))
      .toBe(false)
    expect(canShowPwaInstallCard(visibleContext({ mode: 'in-flight' })))
      .toBe(false)
    expect(canShowPwaInstallCard(visibleContext({ isStandalone: true })))
      .toBe(false)
    expect(canShowPwaInstallCard(visibleContext({ dismissed: true })))
      .toBe(false)
    expect(canShowPwaInstallCard(visibleContext({ method: null })))
      .toBe(false)
  })
})
