/**
 * Canonical domain types for the EAA AirVenture Oshkosh arrival.
 *
 * Source of truth: the FAA AirVenture Notice ("Oshkosh NOTAM").
 * Year-specific changes (dates, transitions, runway dot updates) MUST be
 * reviewed against the official Notice before flight-day use.
 */

export type LatLng = [lat: number, lng: number]

export interface SourceRef {
  id: string
  label: string
  url?: string
  publishedAt?: string
}

/** A named flight phase. Phase IDs are stable; ordering is by `order`. */
export type PhaseId =
  | 'preflight'
  | 'enroute'
  | 'transition'
  | 'ripon-to-fisk'
  | 'at-fisk'
  | 'inbound-runway'
  | 'ground'
  | 'depart'

export interface ChecklistItem {
  id: string
  text: string
  detail?: string
  required?: boolean
}

export interface PhaseSpeedAltitude {
  ias_kt: number
  altitude_ft_msl: number
  label?: string
}

export interface PhaseDefinition {
  id: PhaseId
  order: number
  title: string
  cockpitTitle: string
  summary: string
  briefing: string
  primaryActions: ChecklistItem[]
  secondaryActions?: ChecklistItem[]
  warnings?: string[]
  speedAltitude?: PhaseSpeedAltitude[]
  sources: SourceRef['id'][]
}

export interface FrequencyEntry {
  id: string
  label: string
  freq: string
  category: 'arrival' | 'tower' | 'ground' | 'departure' | 'support' | 'specialty'
  notes?: string
}

export interface VfrWaypoint {
  id: string
  faaId?: string
  name: string
  position: LatLng
  description: string
  distanceNmFromOsh?: number
}

export interface TransitionDefinition {
  id: string
  name: string
  startWaypointId: string
  description: string
  whenAssigned: string
  steps: string[]
  highVolumeOnly?: boolean
}

export interface HoldDefinition {
  id: string
  name: string
  whenUsed: string
  pattern: string
  exit: string
  altitudeFtMsl?: number
}

export interface AimPoint {
  id: string
  label: string
  colorHex: string
  feetRemaining: number
  shape?: 'dot' | 'square'
}

export interface RunwayDefinition {
  id: string
  label: string
  towerFreq: string
  widthFt?: number
  thresholdFtRemaining?: number
  displacedThresholdFtRemaining?: number
  shortApproach?: boolean
  longLanding?: boolean
  aimPoints: AimPoint[]
  rules: string[]
}

export interface DepartureRunway {
  id: string
  label: string
  remainingFt: number
  monitorFreq: string
  notes?: string[]
}

export interface AlternateAirport {
  id: string
  icao: string
  name: string
  description: string
  hasTower: boolean
  notes?: string[]
  contactPhone?: string
}

export interface ParkingSign {
  code: string
  meaning: string
  category: 'arrival' | 'departure' | 'modifier'
}

export interface AircraftProfile {
  id: string
  label: string
  description: string
  arrivalRoute: 'fisk' | 'fond-du-lac' | 'transient-helicopter' | 'ultralight' | 'seaplane' | 'nordo'
  recommendedSpeedAlt: PhaseSpeedAltitude
  notes: string[]
}

export interface DivertTrigger {
  id: string
  trigger: string
  action: string
  severity: 'caution' | 'critical'
}

export interface NoticeMetadata {
  /** Year of the Notice currently embedded as procedural guidance. */
  baselineYear: number
  /** Year users must confirm before in-flight mode is allowed. */
  requiredYear: number
  status: 'baseline' | 'released'
  baselineUrl: string
  landingPageUrl: string
  faaIndexUrl: string
  publishedAt?: string
  notes: string
}

export interface EventFacts {
  startDate: string
  endDate: string
  procedureEffectiveWindow: string
  airportIcao: string
  airportName: string
  fieldElevationFt: number
  dailyAirportClosure: string
  airshowWindows: string[]
  smsStatusInstructions: string
  notes: string[]
}
