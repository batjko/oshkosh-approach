import type { CurrentLocation } from '~/store/useAppStore'

export const GPS_FIX_STALE_AFTER_MS = 30_000
export const GPS_POOR_ACCURACY_METRES = 500

export const gpsFixExpiresIn = (
  timestamp: number,
  now: number = Date.now()
): number =>
  Math.max(0, GPS_FIX_STALE_AFTER_MS - Math.max(0, now - timestamp))

export const isGpsFixLowAccuracy = (location: CurrentLocation): boolean =>
  location.accuracy > GPS_POOR_ACCURACY_METRES
