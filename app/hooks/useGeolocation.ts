import { useEffect, useRef } from 'react'
import { useAppStore } from '~/store/useAppStore'
import { getLocationBasedStage, getActiveZones, getNearestWaypoint, formatDistance } from '~/utils/geofencing'
import { showNotification } from '~/components/ui/ErrorNotification'

export const useGeolocation = () => {
  const { setCurrentLocation, currentStage, setCurrentStage, mode } = useAppStore()
  const previousZonesRef = useRef<string[]>([])

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.')
      showNotification({
        type: 'warning',
        title: 'GPS not available',
        message: 'Your browser does not support geolocation. Map features will be limited.',
        autoClose: false
      })
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }
        
        setCurrentLocation(newLocation)
        
        // Get current active zones
        const currentZones = getActiveZones([newLocation.lat, newLocation.lng])
        const currentZoneIds = currentZones.map(z => z.id)
        
        // Check for newly entered zones
        const newlyEnteredZones = currentZones.filter(
          zone => !previousZonesRef.current.includes(zone.id)
        )
        
        // Show notifications for newly entered zones
        newlyEnteredZones.forEach(zone => {
          showNotification({
            type: 'info',
            title: `Entering ${zone.name}`,
            message: zone.description,
            autoClose: true
          })
        })
        
        // Update previous zones
        previousZonesRef.current = currentZoneIds

        // Auto-advance stages based on location (only in in-flight mode)
        if (mode === 'in-flight') {
          const suggestedStage = getLocationBasedStage(
            [newLocation.lat, newLocation.lng],
            currentStage
          )
          
          if (suggestedStage !== null) {
            console.log(`Geofencing: Auto-advancing to stage ${suggestedStage}`)
            setCurrentStage(suggestedStage)
            showNotification({
              type: 'success',
              title: 'Stage Advanced',
              message: `Automatically advanced to stage ${suggestedStage + 1}`,
              autoClose: true
            })
          }
        }
        
        // Show distance to nearest waypoint if not in any zone
        if (currentZones.length === 0) {
          const nearest = getNearestWaypoint([newLocation.lat, newLocation.lng])
          if (nearest) {
            console.log(`Distance to ${nearest.zone.name}: ${formatDistance(nearest.distance)}`)
          }
        }
      },
      (error) => {
        console.error('Error getting location:', error)
        setCurrentLocation(null)
        
        let message = 'Unable to get your location.'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable location access in your browser settings.'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable. Make sure GPS is enabled.'
            break
          case error.TIMEOUT:
            message = 'Location request timed out. Please try again.'
            break
        }
        
        showNotification({
          type: 'error',
          title: 'GPS Error',
          message,
          autoClose: false
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000, // Cache position for 15 seconds for more responsive updates
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [setCurrentLocation, currentStage, setCurrentStage, mode])
}