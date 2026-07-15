import { useSyncExternalStore } from 'react'

let originReachable = true
let monitoring = false
let probeInFlight: Promise<void> | null = null
const subscribers = new Set<() => void>()

const publish = (reachable: boolean): void => {
  if (originReachable === reachable) return
  originReachable = reachable
  subscribers.forEach((subscriber) => subscriber())
}

const probeOrigin = async (): Promise<boolean> => {
  if (!navigator.onLine) return false

  try {
    const response = await fetch('/manifest.json', {
      method: 'HEAD',
      cache: 'no-store'
    })
    return response.ok
  } catch {
    return false
  }
}

export const refreshOriginReachability = (): Promise<void> => {
  if (typeof navigator === 'undefined') return Promise.resolve()
  if (probeInFlight) return probeInFlight

  probeInFlight = probeOrigin()
    .then(publish)
    .finally(() => {
      probeInFlight = null
    })
  return probeInFlight
}

const handleOffline = (): void => publish(false)
const handleOnline = (): void => {
  void refreshOriginReachability()
}
const handleVisibilityChange = (): void => {
  if (document.visibilityState === 'visible') {
    void refreshOriginReachability()
  }
}

const startMonitoring = (): void => {
  if (monitoring || typeof window === 'undefined') return
  monitoring = true
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  window.addEventListener('focus', handleOnline)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  void refreshOriginReachability()
}

const stopMonitoring = (): void => {
  if (!monitoring || typeof window === 'undefined') return
  monitoring = false
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  window.removeEventListener('focus', handleOnline)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
}

const subscribe = (subscriber: () => void): (() => void) => {
  subscribers.add(subscriber)
  startMonitoring()
  return () => {
    subscribers.delete(subscriber)
    if (subscribers.size === 0) stopMonitoring()
  }
}

const getSnapshot = (): boolean => originReachable
const getServerSnapshot = (): boolean => true

/**
 * Reports whether this app's origin is reachable, not merely whether the
 * browser has a network interface. A HEAD request bypasses the service
 * worker's GET cache so stale offline HTML cannot be presented as current.
 */
export const useOriginReachability = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
