import posthogJs from 'posthog-js'
import type { PhaseId } from '~/content/oshkosh'
import type { AppMode, SectionId, SheetId } from '~/store/useAppStore'

/**
 * Client-only PostHog wrapper. The browser SDK is hydration-only - the
 * provider in `app/provider.tsx` calls `initAnalytics` once, after which
 * components/store actions can call `trackAppEvent` to capture typed
 * product events.
 *
 * Privacy guardrails:
 * - We never pass live geolocation, aircraft identity, call sign, or
 *   raw NOTAM text into properties. Property types below are
 *   intentionally narrow to enforce this at compile time.
 * - person_profiles defaults to 'identified_only', and the app does
 *   not call `identify()` anywhere - all events stay anonymous.
 */

const DEFAULT_TOKEN = 'phc_Fdzlm8xerItmC8dlIam0qQ59QdCDWfdC7aBUw5aReqa'
const DEFAULT_HOST = 'https://eu.i.posthog.com'

const readEnv = (key: string): string | undefined => {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env
  return env?.[key]
}

const resolveToken = (): string =>
  readEnv('VITE_PUBLIC_POSTHOG_TOKEN') ?? DEFAULT_TOKEN

const resolveHost = (): string =>
  readEnv('VITE_PUBLIC_POSTHOG_HOST') ?? DEFAULT_HOST

let initialized = false

type QueuedEvent = {
  [Name in AppEventName]: {
    name: Name
    properties: AppEventMap[Name]
  }
}[AppEventName]

const MAX_QUEUED_EVENTS = 20
const queuedEvents: QueuedEvent[] = []

const flushQueuedEvents = (): void => {
  while (queuedEvents.length > 0) {
    const event = queuedEvents.shift()
    if (!event) return
    posthogJs.capture(event.name, event.properties)
  }
}

/**
 * Initialize PostHog. Idempotent - safe to call from a provider's
 * post-hydration `useEffect`. Skips entirely on the server and when
 * the token is empty (allows opting out via env in dev/CI).
 */
export const initAnalytics = (): void => {
  if (typeof window === 'undefined') return
  if (initialized) return

  const token = resolveToken()
  if (!token) return

  posthogJs.init(token, {
    api_host: resolveHost(),
    defaults: '2026-01-30',
    person_profiles: 'identified_only',
    // Explicit pageview behavior: the app is a single-route SPA where
    // navigation happens via in-app state changes (phase, section, sheet).
    // `history_change` matches the `defaults: '2026-01-30'` snapshot and
    // captures the initial pageview only - additional in-app navigation
    // is tracked via the typed product events below.
    capture_pageview: 'history_change',
    capture_pageleave: 'if_capture_pageview'
  })
  initialized = true
  flushQueuedEvents()
}

export const isAnalyticsReady = (): boolean => initialized

/**
 * Typed product event catalog. New events should be added here so that
 * call sites stay type-safe and the property surface remains auditable.
 */
type PhaseChangeSource =
  | 'spine'
  | 'hero_next'
  | 'hero_prev'
  | 'gps_suggestion'
  | 'onboarding'

type ModeChangeReason = 'allowed' | 'blocked_notice'

type NotamFetchStatus = 'success' | 'error'

export type AppEventMap = {
  'phase changed': {
    from: PhaseId
    to: PhaseId
    source: PhaseChangeSource
  }
  'mode changed': {
    mode: AppMode
    reason: ModeChangeReason
  }
  'section viewed': {
    phase: PhaseId
    section: SectionId
    mode: AppMode
  }
  'sheet opened': {
    sheet: SheetId
  }
  'gps toggled': {
    enabled: boolean
  }
  'map toggled': {
    enabled: boolean
  }
  'theme toggled': {
    theme: 'chart' | 'cockpit'
  }
  'onboarding completed': {
    notice_acknowledged: boolean
    profile_id: string | null
  }
  'profile selected': {
    profile_id: string | null
  }
  'runway assigned': {
    runway_id: string | null
  }
  'notams loaded': {
    status: NotamFetchStatus
    total: number
    critical: number
    high: number
    medium: number
    low: number
  }
  'pwa install prompted': {
    /** User-facing trigger that opened the native install prompt. */
    surface: 'overflow_menu'
    outcome: 'accepted' | 'dismissed' | 'unavailable'
  }
  'pwa installed': {
    /** Captured from the `appinstalled` event - user has installed. */
    display_mode: 'standalone' | 'minimal-ui' | 'browser' | 'unknown'
  }
}

export type AppEventName = keyof AppEventMap

/**
 * Capture a typed product event. No-ops on the server and before
 * `initAnalytics` has run.
 */
export const trackAppEvent = <Name extends AppEventName>(
  name: Name,
  properties: AppEventMap[Name]
): void => {
  if (typeof window === 'undefined') return
  if (!initialized) {
    queuedEvents.push({ name, properties } as QueuedEvent)
    if (queuedEvents.length > MAX_QUEUED_EVENTS) queuedEvents.shift()
    return
  }
  posthogJs.capture(name, properties)
}
