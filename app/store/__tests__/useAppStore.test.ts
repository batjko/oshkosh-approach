import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

type StoreModule = typeof import('../useAppStore')

const values = new Map<string, string>()
const localStorageMock: Storage = {
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

let storeModule: StoreModule

describe('app store safety guards', () => {
  beforeAll(async () => {
    vi.stubGlobal('localStorage', localStorageMock)
    storeModule = await import('../useAppStore')
  })

  beforeEach(() => {
    values.clear()
    storeModule.useAppStore.setState({
      currentPhase: 'preflight',
      mode: 'pre-flight',
      noticeYearAcknowledged: null,
      activeSection: 'briefing',
      hasHydrated: false
    })
  })

  afterAll(() => vi.unstubAllGlobals())

  it('rejects flight mode without a current Notice acknowledgement', () => {
    storeModule.useAppStore.getState().setMode('in-flight')

    expect(storeModule.useAppStore.getState().mode).toBe('pre-flight')
  })

  it('leaves flight mode when the acknowledgement is revoked', () => {
    storeModule.useAppStore.setState({
      mode: 'in-flight',
      noticeYearAcknowledged: 2026
    })

    storeModule.useAppStore.getState().setNoticeYearAcknowledged(null)

    expect(storeModule.useAppStore.getState().mode).toBe('pre-flight')
  })

  it('restores the phase default section and preserves valid flight mode', async () => {
    localStorageMock.setItem('oshkosh-app-storage-v2', JSON.stringify({
      state: {
        currentPhase: 'at-fisk',
        mode: 'in-flight',
        noticeYearAcknowledged: 2026
      },
      version: 0
    }))

    await storeModule.useAppStore.persist.rehydrate()

    expect(storeModule.useAppStore.getState()).toMatchObject({
      currentPhase: 'at-fisk',
      mode: 'in-flight',
      activeSection: 'runway',
      hasHydrated: true
    })
  })

  it('repairs invalid persisted flight mode during hydration', async () => {
    localStorageMock.setItem('oshkosh-app-storage-v2', JSON.stringify({
      state: {
        currentPhase: 'at-fisk',
        mode: 'in-flight',
        noticeYearAcknowledged: null
      },
      version: 0
    }))

    await storeModule.useAppStore.persist.rehydrate()

    expect(storeModule.useAppStore.getState()).toMatchObject({
      mode: 'pre-flight',
      activeSection: 'runway',
      hasHydrated: true
    })
  })
})
