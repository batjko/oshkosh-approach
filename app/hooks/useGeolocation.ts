import { useEffect, useRef } from 'react'
import { useAppStore } from '~/store/useAppStore'
import {
  formatDistance,
  getActiveZones,
  getLocationSuggestedPhase,
  getNearestWaypoint
} from '~/utils/geofencing'
import { showNotification } from '~/components/ui/ErrorNotification'

/**
 * Watches geolocation when the user has explicitly opted in via the
 * StatusBar `Use GPS` pill (`gpsEnabled` flag in the app store). Does
 * nothing on first paint - no toast, no permission prompt - until the
 * user asks for it.
 *
 * Auto-advance never overrides the pilot during high-workload phases:
 * during 'ripon-to-fisk' and 'at-fisk' we suppress automatic phase
 * changes to avoid changing the briefing under the pilot's hands.
 */
export const useGeolocation = () => {
  const setCurrentLocation = useAppStore((s) => s.setCurrentLocation)
  const setCurrentPhase = useAppStore((s) => s.setCurrentPhase)
  const setGpsEnabled = useAppStore((s) => s.setGpsEnabled)
  const currentPhase = useAppStore((s) => s.currentPhase)
  const mode = useAppStore((s) => s.mode)
  const gpsEnabled = useAppStore((s) => s.gpsEnabled)
  const previousZonesRef = useRef<string[]>([])

  useEffect(() => {
    if (!gpsEnabled) return

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      showNotification({
        type: 'warning',
        title: 'GPS not supported',
        message: 'This browser does not expose geolocation. Map features will be limited.',
        autoClose: true
      })
      setGpsEnabled(false)
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        setCurrentLocation(next)

        const here: [number, number] = [next.lat, next.lng]
        const active = getActiveZones(here)
        const activeIds = active.map((z) => z.id)

        active
          .filter((z) => !previousZonesRef.current.includes(z.id))
          .forEach((zone) => {
            showNotification({
              type: 'info',
              title: `Entering ${zone.name}`,
              message: zone.description,
              autoClose: true
            })
          })
        previousZonesRef.current = activeIds

        if (mode === 'in-flight') {
          const suppressedPhases = new Set(['ripon-to-fisk', 'at-fisk'])
          if (!suppressedPhases.has(currentPhase)) {
            const suggested = getLocationSuggestedPhase(here, currentPhase)
            if (suggested) {
              setCurrentPhase(suggested)
              showNotification({
                type: 'success',
                title: 'Phase advanced',
                message: `Auto-advanced to ${suggested.replace('-', ' ')}.`,
                autoClose: true
              })
            }
          }
        }

        if (active.length === 0) {
          const nearest = getNearestWaypoint(here)
          if (nearest) {
            console.debug(
              `Distance to ${nearest.zone.name}: ${formatDistance(nearest.distance)}`
            )
          }
        }
      },
      (error) => {
        setCurrentLocation(null)
        if (error.code === error.PERMISSION_DENIED) {
          showNotification({
            type: 'warning',
            title: 'GPS permission denied',
            message:
              'Enable location access in your browser settings to use moving-map features.',
            autoClose: true
          })
          setGpsEnabled(false)
          return
        }
        let message = 'Unable to get your location.'
        if (error.code === error.POSITION_UNAVAILABLE)
          message = 'Location information unavailable.'
        if (error.code === error.TIMEOUT)
          message = 'Location request timed out.'
        showNotification({
          type: 'warning',
          title: 'GPS unavailable',
          message,
          autoClose: true
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [
    gpsEnabled,
    setCurrentLocation,
    setCurrentPhase,
    setGpsEnabled,
    currentPhase,
    mode
  ])
}
