import { describe, expect, it } from 'vitest'

import {
  GPS_FIX_STALE_AFTER_MS,
  gpsFixExpiresIn,
  isGpsFixLowAccuracy
} from '../gps'

describe('GPS fix quality', () => {
  it('expires a fix based on its source timestamp', () => {
    expect(gpsFixExpiresIn(10_000, 10_000)).toBe(GPS_FIX_STALE_AFTER_MS)
    expect(gpsFixExpiresIn(10_000, 25_000)).toBe(15_000)
    expect(gpsFixExpiresIn(10_000, 40_001)).toBe(0)
  })

  it('flags only coarse fixes as low accuracy', () => {
    const fix = {
      lat: 43.98,
      lng: -88.56,
      timestamp: 10_000
    }

    expect(isGpsFixLowAccuracy({ ...fix, accuracy: 500 })).toBe(false)
    expect(isGpsFixLowAccuracy({ ...fix, accuracy: 501 })).toBe(true)
  })
})
