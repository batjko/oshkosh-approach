import type { LatLng, PhaseId } from '~/content/oshkosh'
import { waypoints, waypointById } from '~/content/oshkosh'

/**
 * Geofencing utilities for the Oshkosh approach.
 *
 * Zones are derived from canonical waypoints and are tied to named phase IDs
 * rather than fragile numeric indices. Auto-advance is opt-in and never
 * skips backwards.
 */

export interface GeofenceZone {
  id: string
  name: string
  center: LatLng
  /** Radius in meters. */
  radius: number
  triggerPhase?: PhaseId
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
    triggerPhase: override.triggerPhase,
    description: override.description ?? wp.description
  }
}

export const geofenceZones: GeofenceZone[] = [
  zoneFromWaypoint('vpenv', {
    radius: meters(1),
    triggerPhase: 'transition',
    description: 'Endeavor Bridge transition start.'
  }),
  zoneFromWaypoint('vpplk', {
    radius: meters(1),
    triggerPhase: 'transition',
    description: 'Puckaway Lake transition start. Shoreline OFF YOUR LEFT.'
  }),
  zoneFromWaypoint('vpgrn', {
    radius: meters(1),
    triggerPhase: 'transition',
    description: 'Green Lake transition start.'
  }),
  zoneFromWaypoint('vprip', {
    radius: meters(1),
    triggerPhase: 'ripon-to-fisk',
    description: 'Ripon. Begin railroad-track leg NE.'
  }),
  zoneFromWaypoint('vpfis', {
    radius: meters(0.65),
    triggerPhase: 'at-fisk',
    description: 'Fisk. Listen for ATC runway + tower assignment.'
  }),
  zoneFromWaypoint('kosh', {
    radius: meters(1),
    triggerPhase: 'inbound-runway',
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

/** Phase order map for monotonic advancement. */
const phaseOrder: Record<PhaseId, number> = {
  preflight: 0,
  enroute: 1,
  transition: 2,
  'ripon-to-fisk': 3,
  'at-fisk': 4,
  'inbound-runway': 5,
  ground: 6,
  depart: 7
}

/**
 * Returns the suggested phase to advance to based on active zones, or null
 * if no advancement is suggested. Never advances backwards.
 */
export const getLocationSuggestedPhase = (
  point: LatLng,
  current: PhaseId
): PhaseId | null => {
  const candidates = getActiveZones(point)
    .map((z) => z.triggerPhase)
    .filter((p): p is PhaseId => Boolean(p))
    .filter((p) => phaseOrder[p] > phaseOrder[current])
  if (candidates.length === 0) return null
  return candidates.sort((a, b) => phaseOrder[a] - phaseOrder[b])[0]
}

export const formatDistance = (meterValue: number): string => {
  const nm = meterValue / 1852
  if (nm < 0.1) return `${Math.round(meterValue)} m`
  if (nm < 10) return `${nm.toFixed(1)} nm`
  return `${Math.round(nm)} nm`
}

export const allWaypoints = waypoints
