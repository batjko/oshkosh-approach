import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  consumeOnboardingHandoff,
  markOnboardingHandoff
} from '../onboardingHandoff'

const values = new Map<string, string>()
const sessionStorageMock: Storage = {
  get length() {
    return values.size
  },
  clear: () => values.clear(),
  getItem: (key) => values.get(key) ?? null,
  key: (index) => [...values.keys()][index] ?? null,
  removeItem: (key) => {
    values.delete(key)
  },
  setItem: (key, value) => {
    values.set(key, value)
  }
}

describe('onboarding handoff', () => {
  beforeEach(() => {
    values.clear()
    vi.stubGlobal('window', { sessionStorage: sessionStorageMock })
  })

  afterAll(() => vi.unstubAllGlobals())

  it('marks and consumes the handoff exactly once', () => {
    markOnboardingHandoff()

    expect(consumeOnboardingHandoff()).toBe(true)
    expect(consumeOnboardingHandoff()).toBe(false)
  })

  it('returns false when no guided handoff was marked', () => {
    expect(consumeOnboardingHandoff()).toBe(false)
  })
})
