import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import type { Survey } from 'posthog-js'

import { profileById } from '~/content/oshkosh'
import { Sheet } from '~/components/sheet/Sheet'
import { useAnalyticsStatus, useOnline } from '~/components/feedback/feedbackPromptHooks'
import {
  buildBrowserContext,
  CONTACT_REQUEST_TYPES,
  roundCoordinate,
  trackContactFallbackUsed,
  trackContactFormLoaded,
  trackContactSubmitted,
  type ContactRequestLabel,
  type SurveyEventProperties
} from '~/components/feedback/contactAnalytics'
import {
  captureContactSurveyShown,
  loadContactSurvey,
  submitContactSurvey
} from '~/components/feedback/posthogFeedback'
import { useAppStore } from '~/store/useAppStore'
import type { ContactUnavailableReason } from '~/utils/analytics'

type ContactSurveyStatus = 'idle' | 'loading' | 'ready' | 'submitting' | 'submitted' | 'unavailable'

const readEnv = (key: string): string | undefined => {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env
  return env?.[key]
}

export const ContactSheet = () => {
  const open = useAppStore((s) => s.openSheet) === 'contact'
  const currentPhase = useAppStore((s) => s.currentPhase)
  const activeSection = useAppStore((s) => s.activeSection)
  const mode = useAppStore((s) => s.mode)
  const theme = useAppStore((s) => s.theme)
  const aircraftProfileId = useAppStore((s) => s.aircraftProfileId)
  const aircraftIdentity = useAppStore((s) => s.aircraftIdentity)
  const gpsEnabled = useAppStore((s) => s.gpsEnabled)
  const currentLocation = useAppStore((s) => s.currentLocation)
  const online = useOnline()
  const analyticsStatus = useAnalyticsStatus()
  const fallbackEmail = readEnv('VITE_PUBLIC_CONTACT_EMAIL')
  const [status, setStatus] = useState<ContactSurveyStatus>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [unavailableReason, setUnavailableReason] =
    useState<ContactUnavailableReason | null>(null)
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [requestType, setRequestType] = useState<ContactRequestLabel>(CONTACT_REQUEST_TYPES[0])
  const [details, setDetails] = useState('')
  const [email, setEmail] = useState('')
  const contactLoadTrackedRef = useRef<string | null>(null)

  const captureContactLoad = useCallback((
    loadStatus: 'ready' | 'unavailable',
    reason: ContactUnavailableReason | null
  ) => {
    const key = `${loadStatus}:${reason ?? 'none'}:${online}:${analyticsStatus}`
    if (contactLoadTrackedRef.current === key) return
    contactLoadTrackedRef.current = key
    trackContactFormLoaded({
      status: loadStatus,
      reason,
      online,
      analyticsStatus
    })
  }, [analyticsStatus, online])

  const diagnosticProperties = useMemo(() => {
    const profile = aircraftProfileId ? profileById(aircraftProfileId) : undefined
    const properties: SurveyEventProperties = {
      ...buildBrowserContext(),
      current_phase: currentPhase,
      active_section: activeSection,
      app_mode: mode,
      theme,
      online,
      gps_enabled: gpsEnabled,
      aircraft_profile_id: aircraftProfileId,
      aircraft_profile_label: profile?.label ?? null
    }

    const aircraftType = aircraftIdentity?.type.trim()
    if (aircraftType) properties.aircraft_type = aircraftType

    if (gpsEnabled && currentLocation) {
      properties.gps_latitude = roundCoordinate(currentLocation.lat)
      properties.gps_longitude = roundCoordinate(currentLocation.lng)
      properties.gps_accuracy_m = Math.round(currentLocation.accuracy)
    }

    return properties
  }, [
    activeSection,
    aircraftIdentity?.type,
    aircraftProfileId,
    currentLocation,
    currentPhase,
    gpsEnabled,
    mode,
    online,
    theme
  ])

  useEffect(() => {
    if (open) return
    setStatus('idle')
    setMessage(null)
    setUnavailableReason(null)
    setSurvey(null)
    setDetails('')
    setEmail('')
    setRequestType(CONTACT_REQUEST_TYPES[0])
    contactLoadTrackedRef.current = null
  }, [open])

  useEffect(() => {
    if (!open || survey || status === 'submitted') return

    if (!online) {
      setStatus('unavailable')
      setMessage('The contact form needs a network connection. Reconnect and try again.')
      setUnavailableReason('offline')
      captureContactLoad('unavailable', 'offline')
      return
    }

    if (analyticsStatus === 'disabled') {
      setStatus('unavailable')
      setMessage('The contact form is unavailable because analytics is disabled or blocked.')
      setUnavailableReason('analytics_disabled')
      captureContactLoad('unavailable', 'analytics_disabled')
      return
    }

    if (analyticsStatus === 'loading') {
      setStatus('loading')
      setMessage('Loading contact form...')
      return
    }

    let cancelled = false
    setStatus('loading')
    setMessage('Loading contact form...')

    loadContactSurvey()
      .then((survey) => {
        if (cancelled) return
        if (!survey) {
          setStatus('unavailable')
          setMessage('The contact form is not configured yet.')
          setUnavailableReason('survey_unconfigured')
          captureContactLoad('unavailable', 'survey_unconfigured')
          return
        }
        setSurvey(survey)
        setStatus('ready')
        setUnavailableReason(null)
        captureContactSurveyShown(survey)
        captureContactLoad('ready', null)
        setMessage(null)
      })
      .catch(() => {
        if (cancelled) return
        setStatus('unavailable')
        setMessage('The contact form could not load. Please try again.')
        setUnavailableReason('load_failed')
        captureContactLoad('unavailable', 'load_failed')
      })

    return () => {
      cancelled = true
    }
  }, [analyticsStatus, captureContactLoad, online, open, status, survey])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!survey) return

    const trimmedDetails = details.trim()
    if (!trimmedDetails) {
      setMessage('Add a short message before submitting.')
      return
    }

    setStatus('submitting')
    setMessage('Submitting contact message...')
    submitContactSurvey(survey, {
      requestType,
      message: trimmedDetails,
      email: email.trim(),
      properties: requestType === 'Bug or technical issue' ? diagnosticProperties : {}
    })
    trackContactSubmitted({
      requestType,
      email,
      diagnosticContextIncluded: requestType === 'Bug or technical issue'
    })
    setStatus('submitted')
    setMessage('Thanks, message received. Follow-up only happens if an email address was provided.')
  }

  const fallbackAction = fallbackEmail ? (
    <a
      href={`mailto:${fallbackEmail}?subject=Oshkosh%20Approach%20contact`}
      onClick={() =>
        trackContactFallbackUsed(unavailableReason ?? 'load_failed', true)
      }
      className="btn btn-outline tap-target mt-3 w-full"
    >
      Email contact instead
    </a>
  ) : (
    <p className="mt-3 text-sm text-base-content/70">
      Try again when you are online and analytics is available.
    </p>
  )

  return (
    <Sheet
      id="contact"
      title="Contact"
      description="Non-urgent feedback, corrections, feature ideas, and partnership requests."
    >
      <div className="space-y-4">
        <section className="rounded-cockpit border border-warning/30 bg-warning/10 p-3">
          <h3 className="text-sm font-semibold text-warning">Not monitored in real time</h3>
          <p className="mt-1 text-sm leading-relaxed">
            Do not use this while flying or for urgent operational decisions.
            The FAA AirVenture Notice and ATC remain authoritative.
          </p>
        </section>

        <section className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-cockpit border border-base-300 bg-base-100 p-3">
            <h3 className="font-semibold">Bugs or inaccuracies</h3>
            <p className="mt-1 text-base-content/70">
              Include what you expected, what happened, and the affected phase or section.
            </p>
          </div>
          <div className="rounded-cockpit border border-base-300 bg-base-100 p-3">
            <h3 className="font-semibold">Requests or partnerships</h3>
            <p className="mt-1 text-base-content/70">
              Share the use case, organization, and an email if you want a reply.
            </p>
          </div>
        </section>

        <p className="text-xs leading-relaxed text-base-content/60">
          Bug reports automatically include the current phase, section, browser,
          device, aircraft profile/type if selected, and GPS location only when
          GPS is already enabled. The app does not attach call signs, tail
          numbers, aircraft color, screenshots, or raw NOTAM text.
        </p>

        {message && (
          <p
            className={`rounded-cockpit px-3 py-2 text-sm ${
              status === 'unavailable'
                ? 'bg-warning/10 text-warning'
                : 'bg-base-200 text-base-content/70'
            }`}
            role="status"
          >
            {message}
          </p>
        )}

        {status === 'unavailable' && fallbackAction}

        {(status === 'ready' || status === 'submitting' || status === 'submitted') && (
          <form className="space-y-4" onSubmit={submit}>
            <label className="block text-sm font-medium" htmlFor="contact-request-type">
              Request type
            </label>
            <select
              id="contact-request-type"
              value={requestType}
              onChange={(event) =>
                setRequestType(event.currentTarget.value as ContactRequestLabel)
              }
              disabled={status === 'submitted' || status === 'submitting'}
              className="block min-h-12 w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-base text-base-content shadow-inner outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {CONTACT_REQUEST_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <div>
              <label className="block text-sm font-medium" htmlFor="contact-details">
                Message
              </label>
              <textarea
                id="contact-details"
                value={details}
                onChange={(event) => setDetails(event.currentTarget.value)}
                disabled={status === 'submitted' || status === 'submitting'}
                required
                rows={5}
                placeholder="Tell us what happened, what should change, or who should get in touch."
                className="mt-1 block min-h-32 w-full resize-y rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-base text-base-content shadow-inner outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="contact-email">
                Email for follow-up <span className="font-normal text-base-content/60">(optional)</span>
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                disabled={status === 'submitted' || status === 'submitting'}
                placeholder="you@example.com"
                className="mt-1 block min-h-12 w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-base text-base-content shadow-inner outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {status !== 'submitted' && (
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="btn btn-primary tap-target w-full"
              >
                {status === 'submitting' ? 'Submitting...' : 'Submit contact message'}
              </button>
            )}
          </form>
        )}
      </div>
    </Sheet>
  )
}
