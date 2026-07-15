import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  canUseFlightMode,
  firstPhase,
  lastPhase,
  phases,
  phaseAtOrder,
  phaseById
} from '~/content/oshkosh'
import type { PhaseId } from '~/content/oshkosh'
import {
  trackAppEvent,
  type OnboardingCompletionMethod,
  type SheetCloseMethod,
  type SheetOpenSurface
} from '~/utils/analytics'

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
  timestamp: number
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

interface OpenSheetOptions {
  surface?: SheetOpenSurface
}

interface CloseSheetOptions {
  method?: SheetCloseMethod
}

const trackSectionViewed = (
  phase: PhaseId,
  section: SectionId,
  mode: AppMode
): void => {
  trackAppEvent('section viewed', { phase, section, mode })
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

  /** Timestamp used to measure sheet/panel dwell time. Session-only. */
  openSheetOpenedAt: number | null

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
  completeOnboarding: (method: OnboardingCompletionMethod) => void
  resetOnboarding: () => void
  setActiveSection: (section: SectionId) => void
  openSheetAction: (sheet: SheetId, options?: OpenSheetOptions) => void
  closeSheet: (options?: CloseSheetOptions) => void
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
      openSheetOpenedAt: null,
      hasHydrated: false,

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      setCurrentPhase: (id, source = 'spine') => {
        if (!phaseById(id)) return
        const state = get()
        const prev = state.currentPhase
        if (prev === id) return
        const activeSection = defaultSectionForPhase(id)
        set({ currentPhase: id, activeSection })
        trackAppEvent('phase changed', { from: prev, to: id, source })
        trackSectionViewed(id, activeSection, state.mode)
      },

      nextPhase: () => {
        const state = get()
        const current = phaseById(state.currentPhase) ?? firstPhase
        const next = phaseAtOrder(current.order + 1)
        const nextId = (next ?? lastPhase).id
        if (nextId === state.currentPhase) return
        const activeSection = defaultSectionForPhase(nextId)
        set({
          currentPhase: nextId,
          activeSection
        })
        trackAppEvent('phase changed', {
          from: state.currentPhase,
          to: nextId,
          source: 'hero_next'
        })
        trackSectionViewed(nextId, activeSection, state.mode)
      },

      prevPhase: () => {
        const state = get()
        const current = phaseById(state.currentPhase) ?? firstPhase
        const prev = phaseAtOrder(current.order - 1)
        const prevId = (prev ?? firstPhase).id
        if (prevId === state.currentPhase) return
        const activeSection = defaultSectionForPhase(prevId)
        set({
          currentPhase: prevId,
          activeSection
        })
        trackAppEvent('phase changed', {
          from: state.currentPhase,
          to: prevId,
          source: 'hero_prev'
        })
        trackSectionViewed(prevId, activeSection, state.mode)
      },

      setMode: (mode) => {
        const state = get()
        if (mode === 'in-flight' && !canUseFlightMode(state.noticeYearAcknowledged)) {
          trackAppEvent('mode changed', { mode, reason: 'blocked_notice' })
          return
        }
        if (state.mode === mode) return
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

      setNoticeYearAcknowledged: (year) => {
        const state = get()
        const mode = canUseFlightMode(year) ? state.mode : 'pre-flight'
        set({ noticeYearAcknowledged: year, mode })
        if (mode !== state.mode) {
          trackAppEvent('mode changed', {
            mode,
            reason: 'blocked_notice'
          })
        }
      },

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

      completeOnboarding: (method) => {
        if (get().onboardingComplete) return
        set({ onboardingComplete: true })
        const state = get()
        trackAppEvent('onboarding completed', {
          notice_acknowledged: state.noticeYearAcknowledged !== null,
          profile_id: state.aircraftProfileId,
          completion_method: method
        })
      },

      resetOnboarding: () =>
        set({
          onboardingComplete: false,
          noticeYearAcknowledged: null,
          mode: 'pre-flight'
        }),

      setActiveSection: (section) => {
        if (get().activeSection === section) return
        set({ activeSection: section })
        const state = get()
        trackSectionViewed(state.currentPhase, section, state.mode)
      },

      openSheetAction: (sheet, options = {}) => {
        const state = get()
        if (state.openSheet === sheet) return

        if (state.openSheet && state.openSheetOpenedAt) {
          trackAppEvent('sheet closed', {
            sheet: state.openSheet,
            close_method: 'programmatic',
            duration_ms: Date.now() - state.openSheetOpenedAt,
            phase: state.currentPhase,
            mode: state.mode
          })
        }

        set({ openSheet: sheet, openSheetOpenedAt: Date.now() })
        trackAppEvent('sheet opened', {
          sheet,
          surface: options.surface ?? 'programmatic',
          phase: state.currentPhase,
          mode: state.mode
        })
      },

      closeSheet: (options = {}) => {
        const state = get()
        if (!state.openSheet) return

        trackAppEvent('sheet closed', {
          sheet: state.openSheet,
          close_method: options.method ?? 'programmatic',
          duration_ms: state.openSheetOpenedAt ? Date.now() - state.openSheetOpenedAt : 0,
          phase: state.currentPhase,
          mode: state.mode
        })
        set({ openSheet: null, openSheetOpenedAt: null })
      }
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
        if (!state) return
        const currentPhase = phaseById(state.currentPhase)?.id ?? firstPhase.id
        useAppStore.setState({
          currentPhase,
          mode: canUseFlightMode(state.noticeYearAcknowledged)
            ? state.mode
            : 'pre-flight',
          activeSection: defaultSectionForPhase(currentPhase),
          hasHydrated: true
        })
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
