/**
 * Canonical Oshkosh arrival content. Single source of truth for the UI.
 *
 * Procedural data is currently sourced from the FAA 2025 Notice. The 2026
 * Notice is expected mid-May 2026; flip `notice.status` to `'released'` and
 * update the procedural constants once the 2026 Notice is published.
 */
export * from './types'
export { sources, sourceList } from './sources'
export { notice, event, isFlightDayUnlocked } from './notice'
export { frequencies, frequencyById, headerFrequencyIds } from './frequencies'
export { waypoints, waypointById } from './waypoints'
export { transitions, transitionById } from './transitions'
export { holds, holdSpeedKt, holdAltitudeFtMsl, holdSaturationGuidance } from './holds'
export { runways, runwayById } from './runways'
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
