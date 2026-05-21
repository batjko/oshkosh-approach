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
import { trackAppEvent } from '~/utils/analytics'

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
  | 'news'
  | 'signs'
  | 'alternates'
  | 'divert'
  | 'contact'

/**
 * Where a phase change originated from. Helps us tell pilot-driven
 * navigation (chip / hero buttons) apart from automatic suggestions
 * (geolocation, onboarding completion).
 */
export type PhaseChangeSource =
  | 'spine'
  | 'hero_next'
  | 'hero_prev'
  | 'gps_suggestion'
  | 'onboarding'

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

  /** Whether persisted browser state has been loaded after hydration. */
  hasHydrated: boolean

  // Actions
  setHasHydrated: (hasHydrated: boolean) => void
  setCurrentPhase: (id: PhaseId, source?: PhaseChangeSource) => void
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
      hasHydrated: false,

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      setCurrentPhase: (id, source = 'spine') => {
        if (!phaseById(id)) return
        const prev = get().currentPhase
        if (prev === id) return
        set({ currentPhase: id, activeSection: defaultSectionForPhase(id) })
        trackAppEvent('phase changed', { from: prev, to: id, source })
      },

      nextPhase: () => {
        const state = get()
        const current = phaseById(state.currentPhase) ?? firstPhase
        const next = phaseAtOrder(current.order + 1)
        const nextId = (next ?? lastPhase).id
        if (nextId === state.currentPhase) return
        set({
          currentPhase: nextId,
          activeSection: defaultSectionForPhase(nextId)
        })
        trackAppEvent('phase changed', {
          from: state.currentPhase,
          to: nextId,
          source: 'hero_next'
        })
      },

      prevPhase: () => {
        const state = get()
        const current = phaseById(state.currentPhase) ?? firstPhase
        const prev = phaseAtOrder(current.order - 1)
        const prevId = (prev ?? firstPhase).id
        if (prevId === state.currentPhase) return
        set({
          currentPhase: prevId,
          activeSection: defaultSectionForPhase(prevId)
        })
        trackAppEvent('phase changed', {
          from: state.currentPhase,
          to: prevId,
          source: 'hero_prev'
        })
      },

      setMode: (mode) => {
        if (get().mode === mode) return
        set({ mode })
        trackAppEvent('mode changed', { mode, reason: 'allowed' })
      },

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
        trackAppEvent('theme toggled', { theme: next })
      },

      setEnableMap: (enable) => {
        if (get().enableMap === enable) return
        set({ enableMap: enable })
        trackAppEvent('map toggled', { enabled: enable })
      },

      setNoticeYearAcknowledged: (year) => set({ noticeYearAcknowledged: year }),

      setAircraftProfileId: (id) => {
        if (get().aircraftProfileId === id) return
        set({ aircraftProfileId: id })
        trackAppEvent('profile selected', { profile_id: id })
      },

      setAircraftIdentity: (identity) => set({ aircraftIdentity: identity }),

      setAssignedRunwayId: (id) => {
        if (get().assignedRunwayId === id) return
        set({ assignedRunwayId: id })
        trackAppEvent('runway assigned', { runway_id: id })
      },

      setCurrentLocation: (location) => set({ currentLocation: location }),

      setGpsEnabled: (enabled) => {
        const prev = get().gpsEnabled
        set((state) => ({
          gpsEnabled: enabled,
          currentLocation: enabled ? state.currentLocation : null
        }))
        if (prev !== enabled) {
          trackAppEvent('gps toggled', { enabled })
        }
      },

      completeOnboarding: () => {
        if (get().onboardingComplete) return
        set({ onboardingComplete: true })
        const state = get()
        trackAppEvent('onboarding completed', {
          notice_acknowledged: state.noticeYearAcknowledged !== null,
          profile_id: state.aircraftProfileId
        })
      },

      resetOnboarding: () =>
        set({
          onboardingComplete: false,
          noticeYearAcknowledged: null
        }),

      setActiveSection: (section) => {
        if (get().activeSection === section) return
        set({ activeSection: section })
        const state = get()
        trackAppEvent('section viewed', {
          phase: state.currentPhase,
          section,
          mode: state.mode
        })
      },

      openSheetAction: (sheet) => {
        set({ openSheet: sheet })
        trackAppEvent('sheet opened', { sheet })
      },

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
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
)

export const hydrateAppStore = (): void => {
  if (useAppStore.persist.hasHydrated()) return
  void useAppStore.persist.rehydrate()
}

export const phaseOrderOf = (id: PhaseId): number =>
  phaseById(id)?.order ?? 0

export const phaseList = phases
