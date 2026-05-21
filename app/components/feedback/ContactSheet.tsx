import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Survey } from 'posthog-js'

import { profileById } from '~/content/oshkosh'
import { Sheet } from '~/components/sheet/Sheet'
import { useAnalyticsStatus, useOnline } from '~/components/feedback/feedbackPromptHooks'
import {
  captureContactSurveyShown,
  loadContactSurvey,
  submitContactSurvey
} from '~/components/feedback/posthogFeedback'
import { useAppStore } from '~/store/useAppStore'

const REQUEST_TYPES = [
  'Bug or technical issue',
  'Inaccurate information',
  'Feature request',
  'Partnership or affiliation',
  'Other'
] as const

type ContactSurveyStatus = 'idle' | 'loading' | 'ready' | 'submitting' | 'submitted' | 'unavailable'

type SurveyEventProperties = Record<string, string | number | boolean | null>

const readEnv = (key: string): string | undefined => {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env
  return env?.[key]
}

const roundCoordinate = (value: number): number => Number(value.toFixed(5))

const buildBrowserContext = (): SurveyEventProperties => {
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
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [requestType, setRequestType] = useState<(typeof REQUEST_TYPES)[number]>(REQUEST_TYPES[0])
  const [details, setDetails] = useState('')
  const [email, setEmail] = useState('')

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
    setSurvey(null)
    setDetails('')
    setEmail('')
    setRequestType(REQUEST_TYPES[0])
  }, [open])

  useEffect(() => {
    if (!open || survey || status === 'submitted') return

    if (!online) {
      setStatus('unavailable')
      setMessage('The contact form needs a network connection. Reconnect and try again.')
      return
    }

    if (analyticsStatus === 'disabled') {
      setStatus('unavailable')
      setMessage('The contact form is unavailable because analytics is disabled or blocked.')
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
          return
        }
        setSurvey(survey)
        setStatus('ready')
        captureContactSurveyShown(survey)
        setMessage(null)
      })
      .catch(() => {
        if (cancelled) return
        setStatus('unavailable')
        setMessage('The contact form could not load. Please try again.')
      })

    return () => {
      cancelled = true
    }
  }, [analyticsStatus, diagnosticProperties, online, open, status, survey])

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
    setStatus('submitted')
    setMessage('Thanks, message received. Follow-up only happens if an email address was provided.')
  }

  const fallbackAction = fallbackEmail ? (
    <a
      href={`mailto:${fallbackEmail}?subject=Oshkosh%20Approach%20contact`}
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
                setRequestType(event.currentTarget.value as (typeof REQUEST_TYPES)[number])
              }
              disabled={status === 'submitted' || status === 'submitting'}
              className="block min-h-12 w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-base text-base-content shadow-inner outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {REQUEST_TYPES.map((type) => (
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
