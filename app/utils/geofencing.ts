// Geofencing utilities for the Oshkosh approach

export interface GeofenceZone {
  id: string
  name: string
  center: [number, number] // [lat, lng]
  radius: number // in meters
  triggerStage?: number
  description: string
}

// Define geofenced zones for the Oshkosh approach with improved accuracy
export const geofenceZones: GeofenceZone[] = [
  {
    id: 'ripon',
    name: 'Ripon Entry Point',
    center: [43.8433, -88.8167],
    radius: 1850, // ~1 nautical mile
    triggerStage: 1,
    description: 'Initial contact point for Fisk approach - Follow railroad tracks'
  },
  {
    id: 'pickett',
    name: 'Pickett',
    center: [43.8108, -88.7183], // Midpoint between Ripon and Fisk
    radius: 1850,
    triggerStage: 2,
    description: 'Midpoint along railroad tracks - Maintain 1,800 ft & 90 kts'
  },
  {
    id: 'fisk',
    name: 'Fisk Water Tower',
    center: [43.7702, -88.5494],
    radius: 1200, // Slightly tighter radius for more accurate detection
    triggerStage: 5,
    description: 'Key reporting point - Rock wings when over tower'
  },
  {
    id: 'railroad-bridge',
    name: 'Railroad Bridge',
    center: [43.8844, -88.5544], // Between Fisk and airport
    radius: 1000,
    triggerStage: 6,
    description: 'Transition point for runway assignment'
  },
  {
    id: 'final-approach',
    name: 'Final Approach',
    center: [43.9844, -88.5569],
    radius: 1850, // ~1 nautical mile from airport
    triggerStage: 7,
    description: 'Final approach to Wittman Regional'
  },
  {
    id: 'green-lake-holding',
    name: 'Green Lake Holding',
    center: [43.8442, -88.9567],
    radius: 3700, // ~2 nautical miles for holding pattern
    description: 'Holding area at 2,300 ft for traffic management'
  },
  {
    id: 'puckaway-holding',
    name: 'Puckaway Lake Holding',
    center: [43.6167, -89.1833],
    radius: 3700, // ~2 nautical miles for holding pattern
    description: 'Alternative holding area at 1,800 ft'
  },
  {
    id: 'endeavor-bridge',
    name: 'Endeavor Bridge',
    center: [43.7133, -89.0833], // Alternative entry point
    radius: 1850,
    description: 'Alternative entry point from the southwest'
  }
]

/**
 * Calculate distance between two points using Haversine formula
 */
export const calculateDistance = (
  point1: [number, number],
  point2: [number, number]
): number => {
  const [lat1, lon1] = point1
  const [lat2, lon2] = point2
  
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = 
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c
}

/**
 * Check if a point is within a geofence zone
 */
export const isPointInZone = (
  point: [number, number],
  zone: GeofenceZone
): boolean => {
  const distance = calculateDistance(point, zone.center)
  return distance <= zone.radius
}

/**
 * Get all zones that contain the given point
 */
export const getActiveZones = (
  point: [number, number]
): GeofenceZone[] => {
  return geofenceZones.filter(zone => isPointInZone(point, zone))
}

/**
 * Get the appropriate stage trigger based on current location
 */
export const getLocationBasedStage = (
  currentLocation: [number, number],
  currentStage: number
): number | null => {
  const activeZones = getActiveZones(currentLocation)
  
  // Find the highest stage trigger among active zones
  const triggerStages = activeZones
    .map(zone => zone.triggerStage)
    .filter((stage): stage is number => stage !== undefined)
    .filter(stage => stage > currentStage) // Only advance, never go backwards
  
  return triggerStages.length > 0 ? Math.min(...triggerStages) : null
}

/**
 * Get distance to nearest waypoint
 */
export const getNearestWaypoint = (
  currentLocation: [number, number]
): { zone: GeofenceZone; distance: number } | null => {
  let nearest: { zone: GeofenceZone; distance: number } | null = null
  let minDistance = Infinity
  
  geofenceZones.forEach(zone => {
    const distance = calculateDistance(currentLocation, zone.center)
    if (distance < minDistance) {
      minDistance = distance
      nearest = { zone, distance }
    }
  })
  
  return nearest
}

/**
 * Format distance for display
 */
export const formatDistance = (meters: number): string => {
  const nm = meters / 1852 // Convert to nautical miles
  if (nm < 0.1) {
    return `${Math.round(meters)} m`
  } else if (nm < 10) {
    return `${nm.toFixed(1)} nm`
  } else {
    return `${Math.round(nm)} nm`
  }
}