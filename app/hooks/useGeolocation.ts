import { useEffect } from 'react'
import { useAppStore } from '~/store/useAppStore'
import { showNotification } from '~/components/ui/ErrorNotification'

/**
 * Watches geolocation when the user has explicitly opted in via the
 * StatusBar `Use GPS` pill (`gpsEnabled` flag in the app store). Does
 * nothing on first paint - no toast, no permission prompt - until the
 * user asks for it.
 *
 * GPS is display-only. It never changes phases or issues procedural prompts.
 */
export const useGeolocation = () => {
  const setCurrentLocation = useAppStore((s) => s.setCurrentLocation)
  const setGpsEnabled = useAppStore((s) => s.setGpsEnabled)
  const gpsEnabled = useAppStore((s) => s.gpsEnabled)

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
      },
      (error) => {
        setCurrentLocation(null)
        if (error.code === error.PERMISSION_DENIED) {
          showNotification({
            type: 'warning',
            title: 'GPS permission denied',
            message:
              'Enable location access in your browser settings to display your position on the orientation map.',
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
    setGpsEnabled
  ])
}
