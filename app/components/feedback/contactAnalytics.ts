import {
  trackAppEvent,
  type AnalyticsStatusLabel,
  type ContactRequestType,
  type ContactUnavailableReason
} from '~/utils/analytics'

export const CONTACT_REQUEST_TYPES = [
  'Bug or technical issue',
  'Inaccurate information',
  'Feature request',
  'Partnership or affiliation',
  'Other'
] as const

export type ContactRequestLabel = (typeof CONTACT_REQUEST_TYPES)[number]
export type SurveyEventProperties = Record<string, string | number | boolean | null>

const REQUEST_TYPE_SLUGS: Record<ContactRequestLabel, ContactRequestType> = {
  'Bug or technical issue': 'bug',
  'Inaccurate information': 'inaccurate_information',
  'Feature request': 'feature_request',
  'Partnership or affiliation': 'partnership',
  Other: 'other'
}

export const contactRequestTypeSlug = (
  requestType: ContactRequestLabel
): ContactRequestType => REQUEST_TYPE_SLUGS[requestType]

export const roundCoordinate = (value: number): number => Number(value.toFixed(5))

export const buildBrowserContext = (): SurveyEventProperties => {
  if (typeof window === 'undefined') return {}

  const properties: SurveyEventProperties = {
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    device_pixel_ratio: window.devicePixelRatio,
    contact_pathname: window.location.pathname
  }

  if (typeof navigator !== 'undefined') {
    properties.user_agent = navigator.userAgent
    properties.platform = navigator.platform
    properties.language = navigator.language
  }

  return properties
}

export const trackContactFormLoaded = ({
  status,
  reason,
  online,
  analyticsStatus
}: {
  status: 'ready' | 'unavailable'
  reason: ContactUnavailableReason | null
  online: boolean
  analyticsStatus: AnalyticsStatusLabel
}): void => {
  trackAppEvent('contact form loaded', {
    status,
    reason,
    online,
    analytics_status: analyticsStatus
  })
}

export const trackContactSubmitted = ({
  requestType,
  email,
  diagnosticContextIncluded
}: {
  requestType: ContactRequestLabel
  email: string
  diagnosticContextIncluded: boolean
}): void => {
  trackAppEvent('contact submitted', {
    request_type: contactRequestTypeSlug(requestType),
    has_email: email.trim().length > 0,
    diagnostic_context_included: diagnosticContextIncluded
  })
}

export const trackContactFallbackUsed = (
  reason: ContactUnavailableReason,
  hasFallbackEmail: boolean
): void => {
  trackAppEvent('contact fallback used', {
    reason,
    has_fallback_email: hasFallbackEmail
  })
}
