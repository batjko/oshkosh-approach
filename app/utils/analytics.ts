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
let disabled = false

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

const isLocalAnalyticsExplicitlyEnabled = (): boolean =>
  readEnv('VITE_ENABLE_LOCAL_ANALYTICS') === 'true'

const isLocalHost = (): boolean => {
  const hostname = globalThis.window.location.hostname
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '[::1]'
  )
}

const disableAnalytics = (): void => {
  disabled = true
  queuedEvents.length = 0
}

/**
 * Initialize PostHog. Idempotent - safe to call from a provider's
 * post-hydration `useEffect`. Skips entirely on the server and when
 * the token is empty (allows opting out via env in dev/CI).
 */
export const initAnalytics = (): void => {
  if (globalThis.window === undefined) return
  if (initialized || disabled) return

  const token = resolveToken()
  if (!token) {
    disableAnalytics()
    return
  }
  if (isLocalHost() && !isLocalAnalyticsExplicitlyEnabled()) {
    disableAnalytics()
    return
  }

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
    capture_pageleave: 'if_capture_pageview',
    // Surveys stay available, but automatic popovers are suppressed. The
    // app displays surveys only from the first-party FeedbackPrompt so
    // cockpit UI is never covered by unsolicited feedback UI.
    disable_surveys_automatic_display: true
  })
  initialized = true
  flushQueuedEvents()
}

export const isAnalyticsReady = (): boolean => initialized

export const isAnalyticsDisabled = (): boolean => disabled

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

export type AnalyticsStatusLabel = 'loading' | 'ready' | 'disabled'

export type SheetOpenSurface =
  | 'app_bar'
  | 'overflow_menu'
  | 'news_ribbon'
  | 'status_bar'
  | 'divert_fab'
  | 'programmatic'

export type SheetCloseMethod =
  | 'button'
  | 'backdrop'
  | 'escape'
  | 'swipe'
  | 'native'
  | 'programmatic'

export type ContactUnavailableReason =
  | 'offline'
  | 'analytics_disabled'
  | 'survey_unconfigured'
  | 'load_failed'

export type ContactRequestType =
  | 'bug'
  | 'inaccurate_information'
  | 'feature_request'
  | 'partnership'
  | 'other'

type NewsFeedStatus = 'success' | 'error'
type NewsFeedTrigger = 'initial' | 'refresh' | 'retry' | 'load_more'
export type NewsLoadMoreTrigger = 'intersection' | 'button'

export type ExternalLinkSurface =
  | 'global_footer'
  | 'news_panel'
  | 'news_source_chip'

export type ExternalLinkDestination =
  | 'phase_source'
  | 'attribution'
  | 'official_eaa_news'
  | 'official_notice'
  | 'news_source_homepage'

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
    surface: SheetOpenSurface
    phase: PhaseId
    mode: AppMode
  }
  'sheet closed': {
    sheet: SheetId
    close_method: SheetCloseMethod
    duration_ms: number
    phase: PhaseId
    mode: AppMode
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
  'contact form loaded': {
    status: 'ready' | 'unavailable'
    reason: ContactUnavailableReason | null
    online: boolean
    analytics_status: AnalyticsStatusLabel
  }
  'contact submitted': {
    request_type: ContactRequestType
    has_email: boolean
    diagnostic_context_included: boolean
  }
  'contact fallback used': {
    reason: ContactUnavailableReason
    has_fallback_email: boolean
  }
  'news feed loaded': {
    status: NewsFeedStatus
    trigger: NewsFeedTrigger
    offset: number
    item_count: number
    total: number
    source_ok_count: number
    source_error_count: number
    elapsed_ms: number
  }
  'news feed refreshed': {
    item_count: number
  }
  'news load more': {
    trigger: NewsLoadMoreTrigger
    offset: number
    items_added: number
  }
  'news article opened': {
    source_id: string
    item_id: string
    has_image: boolean
  }
  'external link opened': {
    surface: ExternalLinkSurface
    destination: ExternalLinkDestination
    phase: PhaseId | null
    source_id: string | null
  }
  'checklist item toggled': {
    phase: PhaseId
    checklist: 'primary' | 'secondary'
    item_id: string
    checked: boolean
    variant: 'default' | 'cockpit'
    required: boolean
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
  if (globalThis.window === undefined) return
  if (disabled) return
  if (!initialized) {
    queuedEvents.push({ name, properties } as QueuedEvent)
    if (queuedEvents.length > MAX_QUEUED_EVENTS) queuedEvents.shift()
    return
  }
  posthogJs.capture(name, properties)
}
