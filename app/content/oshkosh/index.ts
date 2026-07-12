/**
 * Canonical Oshkosh arrival content. Single source of truth for the UI.
 *
 * Procedural data is sourced from the released FAA/EAA 2026 AirVenture Notice.
 */
export * from './types'
export { sources, sourceList } from './sources'
export {
  notice,
  event,
  isNoticeContentCurrent,
  canUseFlightMode
} from './notice'
export { frequencies, frequencyById, headerFrequencyIds } from './frequencies'
export { waypoints, waypointById } from './waypoints'
export { transitions, transitionById } from './transitions'
export {
  holds,
  holdSpeedKt,
  holdAltitudeFtMsl,
  holdHighSpeedKt,
  holdHighAltitudeFtMsl,
  holdGeneralGuidance,
  holdSaturationGuidance
} from './holds'
export { runways, runwayById } from './runways'
export { departureRunways, departureSafetyNotes } from './departures'
export { alternates, alternateById } from './alternates'
export {
  arrivalSigns,
  departureSigns,
  signModifiers,
  signRules
} from './signs'
export { aircraftProfiles, profileById } from './profiles'
export { divertTriggers } from './divert'
export {
  phases,
  phaseById,
  phaseAtOrder,
  firstPhase,
  lastPhase,
  phaseIdAtOrder
} from './phases'
