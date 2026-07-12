import type { LatLng } from '~/content/oshkosh'
import { waypoints, waypointById } from '~/content/oshkosh'

/**
 * Distance and proximity utilities for optional orientation features.
 * These helpers never change flight phases or issue procedural guidance.
 */

export interface GeofenceZone {
  id: string
  name: string
  center: LatLng
  /** Radius in meters. */
  radius: number
  description: string
}

const meters = (nm: number) => nm * 1852

const zoneFromWaypoint = (
  id: string,
  override: Partial<Omit<GeofenceZone, 'id' | 'center' | 'name'>>
): GeofenceZone | null => {
  const wp = waypointById(id)
  if (!wp) return null
  return {
    id: wp.id,
    name: wp.name,
    center: wp.position,
    radius: override.radius ?? meters(1),
    description: override.description ?? wp.description
  }
}

export const geofenceZones: GeofenceZone[] = [
  zoneFromWaypoint('vpenv', {
    radius: meters(1),
    description: 'Endeavor Bridge transition start.'
  }),
  zoneFromWaypoint('vpplk', {
    radius: meters(1),
    description: 'Puckaway Lake transition start. Shoreline OFF YOUR LEFT.'
  }),
  zoneFromWaypoint('vpgrn', {
    radius: meters(1),
    description: 'Green Lake transition start.'
  }),
  zoneFromWaypoint('vprip', {
    radius: meters(1),
    description: 'Ripon. Begin railroad-track leg NE.'
  }),
  zoneFromWaypoint('vpfis', {
    radius: meters(0.65),
    description: 'Fisk. Listen for ATC runway + tower assignment.'
  }),
  zoneFromWaypoint('kosh', {
    radius: meters(1),
    description: 'Wittman Regional traffic pattern.'
  }),
  zoneFromWaypoint('rush-lake', {
    radius: meters(2),
    description: 'Rush Lake hold (ATC-discretionary).'
  }),
  zoneFromWaypoint('warbird-island', {
    radius: meters(1.5),
    description: 'Warbird Island report point.'
  })
].filter((z): z is GeofenceZone => z !== null)

const EARTH_RADIUS_M = 6371e3

export const calculateDistance = (a: LatLng, b: LatLng): number => {
  const [lat1, lon1] = a
  const [lat2, lon2] = b
  const phi1 = (lat1 * Math.PI) / 180
  const phi2 = (lat2 * Math.PI) / 180
  const dPhi = ((lat2 - lat1) * Math.PI) / 180
  const dLam = ((lon2 - lon1) * Math.PI) / 180
  const h =
    Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLam / 2) * Math.sin(dLam / 2)
  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export const isPointInZone = (point: LatLng, zone: GeofenceZone): boolean =>
  calculateDistance(point, zone.center) <= zone.radius

export const getActiveZones = (point: LatLng): GeofenceZone[] =>
  geofenceZones.filter((z) => isPointInZone(point, z))

export const getNearestWaypoint = (
  point: LatLng
): { zone: GeofenceZone; distance: number } | null => {
  let best: { zone: GeofenceZone; distance: number } | null = null
  for (const zone of geofenceZones) {
    const distance = calculateDistance(point, zone.center)
    if (best === null || distance < best.distance) {
      best = { zone, distance }
    }
  }
  return best
}

export const formatDistance = (meterValue: number): string => {
  const nm = meterValue / 1852
  if (nm < 0.1) return `${Math.round(meterValue)} m`
  if (nm < 10) return `${nm.toFixed(1)} nm`
  return `${Math.round(nm)} nm`
}

export const allWaypoints = waypoints
