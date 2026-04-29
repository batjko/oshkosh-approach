import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  firstPhase,
  lastPhase,
  phases,
  phaseAtOrder,
  phaseById
} from '~/content/oshkosh'
import type { PhaseId } from '~/content/oshkosh'

export type AppMode = 'pre-flight' | 'in-flight'
export type Theme = 'chart' | 'cockpit'

export type SectionId =
  | 'briefing'
  | 'map'
  | 'transitions'
  | 'notams'
  | 'runway'

export type SheetId =
  | 'notice'
  | 'profile'
  | 'signs'
  | 'alternates'
  | 'divert'

export interface CurrentLocation {
  lat: number
  lng: number
  accuracy: number
}

export interface AircraftIdentity {
  type: string
  color: string
  callSign: string
}

/** Default section to land on for a given phase. */
export const defaultSectionForPhase = (phase: PhaseId): SectionId => {
  switch (phase) {
    case 'preflight':
    case 'enroute':
      return 'briefing'
    case 'transition':
    case 'ripon-to-fisk':
      return 'briefing'
    case 'at-fisk':
    case 'inbound-runway':
    case 'ground':
    case 'depart':
      return 'runway'
  }
}

interface AppState {
  /** Stable named phase ID. */
  currentPhase: PhaseId

  /** UI mode - planning on the ground vs cockpit/in-flight. */
  mode: AppMode

  /** Visual theme - 'chart' is daylight sectional warm, 'cockpit' is night. */
  theme: Theme

  /** Map enabled / fallback. */
  enableMap: boolean

  /** User-confirmed loaded Notice year. Required for in-flight unlock. */
  noticeYearAcknowledged: number | null

  /** Optional aircraft profile (drives specialty branching). */
  aircraftProfileId: string | null

  /** Pilot-provided aircraft identity for ATC self-description. */
  aircraftIdentity: AircraftIdentity | null

  /** Last assigned runway (set at Fisk). */
  assignedRunwayId: string | null

  /** Live geolocation. */
  currentLocation: CurrentLocation | null

  /** Whether the user has opted into geolocation. */
  gpsEnabled: boolean

  /** Whether the first-launch onboarding has been dismissed/completed. */
  onboardingComplete: boolean

  /** Which section tab is active for the current phase. Not persisted. */
  activeSection: SectionId

  /** Which sheet is open, if any. Session-only. */
  openSheet: SheetId | null

  // Actions
  setCurrentPhase: (id: PhaseId) => void
  nextPhase: () => void
  prevPhase: () => void
  setMode: (mode: AppMode) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setEnableMap: (enable: boolean) => void
  setNoticeYearAcknowledged: (year: number | null) => void
  setAircraftProfileId: (id: string | null) => void
  setAircraftIdentity: (identity: AircraftIdentity | null) => void
  setAssignedRunwayId: (id: string | null) => void
  setCurrentLocation: (location: CurrentLocation | null) => void
  setGpsEnabled: (enabled: boolean) => void
  completeOnboarding: () => void
  resetOnboarding: () => void
  setActiveSection: (section: SectionId) => void
  openSheetAction: (sheet: SheetId) => void
  closeSheet: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentPhase: firstPhase.id,
      mode: 'pre-flight',
      theme: 'chart',
      enableMap: true,
      noticeYearAcknowledged: null,
      aircraftProfileId: 'standard',
      aircraftIdentity: null,
      assignedRunwayId: null,
      currentLocation: null,
      gpsEnabled: false,
      onboardingComplete: false,
      activeSection: defaultSectionForPhase(firstPhase.id),
      openSheet: null,

      setCurrentPhase: (id) => {
        if (phaseById(id)) {
          set({ currentPhase: id, activeSection: defaultSectionForPhase(id) })
        }
      },

      nextPhase: () =>
        set((state) => {
          const current = phaseById(state.currentPhase) ?? firstPhase
          const next = phaseAtOrder(current.order + 1)
          const nextId = (next ?? lastPhase).id
          return {
            currentPhase: nextId,
            activeSection: defaultSectionForPhase(nextId)
          }
        }),

      prevPhase: () =>
        set((state) => {
          const current = phaseById(state.currentPhase) ?? firstPhase
          const prev = phaseAtOrder(current.order - 1)
          const prevId = (prev ?? firstPhase).id
          return {
            currentPhase: prevId,
            activeSection: defaultSectionForPhase(prevId)
          }
        }),

      setMode: (mode) => set({ mode }),

      setTheme: (theme) => {
        set({ theme })
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme)
        }
      },

      toggleTheme: () => {
        const { theme } = get()
        const next = theme === 'chart' ? 'cockpit' : 'chart'
        get().setTheme(next)
      },

      setEnableMap: (enable) => set({ enableMap: enable }),

      setNoticeYearAcknowledged: (year) => set({ noticeYearAcknowledged: year }),

      setAircraftProfileId: (id) => set({ aircraftProfileId: id }),

      setAircraftIdentity: (identity) => set({ aircraftIdentity: identity }),

      setAssignedRunwayId: (id) => set({ assignedRunwayId: id }),

      setCurrentLocation: (location) => set({ currentLocation: location }),

      setGpsEnabled: (enabled) =>
        set((state) => ({
          gpsEnabled: enabled,
          currentLocation: enabled ? state.currentLocation : null
        })),

      completeOnboarding: () => set({ onboardingComplete: true }),

      resetOnboarding: () =>
        set({
          onboardingComplete: false,
          noticeYearAcknowledged: null
        }),

      setActiveSection: (section) => set({ activeSection: section }),

      openSheetAction: (sheet) => set({ openSheet: sheet }),

      closeSheet: () => set({ openSheet: null })
    }),
    {
      name: 'oshkosh-app-storage-v2',
      partialize: (state) => ({
        currentPhase: state.currentPhase,
        mode: state.mode,
        theme: state.theme,
        enableMap: state.enableMap,
        noticeYearAcknowledged: state.noticeYearAcknowledged,
        aircraftProfileId: state.aircraftProfileId,
        aircraftIdentity: state.aircraftIdentity,
        assignedRunwayId: state.assignedRunwayId,
        gpsEnabled: state.gpsEnabled,
        onboardingComplete: state.onboardingComplete
      })
    }
  )
)

export const phaseOrderOf = (id: PhaseId): number =>
  phaseById(id)?.order ?? 0

export const phaseList = phases
