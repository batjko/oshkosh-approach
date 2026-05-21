import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { MdClose, MdFeedback } from 'react-icons/md'

import { useAppStore } from '~/store/useAppStore'
import { useAnalyticsReady, useOnline } from '~/components/feedback/feedbackPromptHooks'
import {
  cancelFeedbackSurvey,
  displayFeedbackSurvey,
  loadFeedbackSurvey
} from '~/components/feedback/posthogFeedback'
import { useNotificationCount } from '~/components/ui/ErrorNotification'

const DEFAULT_DELAY_MS = 120_000
const DISMISS_COOLDOWN_MS = 30 * 60_000
const DISMISSED_UNTIL_KEY = 'osh-feedback-dismissed-until'
const SURVEY_CONTAINER_ID = 'osh-feedback-survey-container'
const SURVEY_RENDER_TIMEOUT_MS = 8_000

type PromptState = 'hidden' | 'teaser' | 'survey'

const hasUsableSurveyContent = (container: HTMLElement): boolean =>
  container.querySelector('form, textarea, input, select, button, [role="button"]') !== null

const readDelayMs = (): number => {
  const raw = (import.meta as unknown as { env?: Record<string, string | undefined> })
    .env?.VITE_FEEDBACK_PROMPT_DELAY_MS
  const parsed = raw ? Number(raw) : DEFAULT_DELAY_MS
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_DELAY_MS
}

const dismissedUntil = (): number => {
  if (typeof window === 'undefined') return Number.POSITIVE_INFINITY
  try {
    const raw = window.sessionStorage.getItem(DISMISSED_UNTIL_KEY)
    const parsed = raw ? Number(raw) : 0
    return Number.isFinite(parsed) ? parsed : 0
  } catch {
    return 0
  }
}

const dismissForCooldown = () => {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(
      DISMISSED_UNTIL_KEY,
      String(Date.now() + DISMISS_COOLDOWN_MS)
    )
  } catch {
    // Storage can be unavailable in restricted mobile browser contexts.
  }
}

/**
 * Delayed, first-party wrapper around PostHog surveys. The SDK survey
 * extension is enabled only after the pilot explicitly opens feedback,
 * preventing page-load popovers from covering cockpit-critical controls.
 */
export const FeedbackPrompt = () => {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const mode = useAppStore((s) => s.mode)
  const hasHydrated = useAppStore((s) => s.hasHydrated)
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  const openSheet = useAppStore((s) => s.openSheet)
  const notificationCount = useNotificationCount()
  const online = useOnline()
  const analyticsReady = useAnalyticsReady()
  const [state, setState] = useState<PromptState>('hidden')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [surveyId, setSurveyId] = useState<string | null>(null)

  const eligible = useMemo(
    () =>
      hasHydrated &&
      onboardingComplete &&
      analyticsReady &&
      mode === 'pre-flight' &&
      online &&
      !openSheet &&
      notificationCount === 0,
    [analyticsReady, hasHydrated, mode, notificationCount, onboardingComplete, online, openSheet]
  )

  useEffect(() => {
    if (!eligible || state !== 'hidden') return
    if (dismissedUntil() > Date.now()) return

    const timeoutId = window.setTimeout(() => {
      if (dismissedUntil() <= Date.now()) setState('teaser')
    }, readDelayMs())

    return () => window.clearTimeout(timeoutId)
  }, [eligible, state])

  useEffect(() => {
    if (eligible || state === 'hidden') return
    setState('hidden')
    setLoading(false)
    setMessage(null)
    if (surveyId) cancelFeedbackSurvey(surveyId)
    setSurveyId(null)
  }, [eligible, state, surveyId])

  useEffect(() => {
    if (state !== 'survey' || !surveyId) return

    const container = document.getElementById(SURVEY_CONTAINER_ID)
    if (!container) return

    setMessage('Loading feedback form...')
    const observer = new MutationObserver(() => {
      if (!hasUsableSurveyContent(container)) return
      setMessage(null)
      observer.disconnect()
    })
    observer.observe(container, { childList: true, subtree: true })

    displayFeedbackSurvey(surveyId, `#${SURVEY_CONTAINER_ID}`)
    const timeoutId = window.setTimeout(() => {
      if (hasUsableSurveyContent(container)) return
      observer.disconnect()
      setMessage('Feedback could not load. Please try again.')
      setSurveyId(null)
      setState('teaser')
    }, SURVEY_RENDER_TIMEOUT_MS)

    return () => {
      observer.disconnect()
      window.clearTimeout(timeoutId)
    }
  }, [state, surveyId])

  useEffect(() => {
    if (state !== 'survey') return
    panelRef.current?.focus()
  }, [state])

  const close = () => {
    dismissForCooldown()
    if (surveyId) cancelFeedbackSurvey(surveyId)
    setState('hidden')
    setLoading(false)
    setMessage(null)
    setSurveyId(null)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }

    if (event.key !== 'Tab' || state !== 'survey') return

    const panel = panelRef.current
    if (!panel) return
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((node) => !node.hasAttribute('disabled'))

    if (focusable.length === 0) {
      event.preventDefault()
      panel.focus()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const openSurvey = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const survey = await loadFeedbackSurvey()
      if (!survey) {
        setMessage('Feedback is not available right now.')
        setLoading(false)
        return
      }
      setSurveyId(survey.id)
      setState('survey')
    } catch {
      setMessage('Feedback is not available right now.')
    } finally {
      setLoading(false)
    }
  }

  if (state === 'hidden') return null

  const shellClass =
    state === 'teaser'
      ? [
          'fixed inset-x-3 bottom-3 z-[1100] max-w-[calc(100vw-1.5rem)]',
          'rounded-full border border-base-300 bg-base-100 p-1.5 shadow-cockpit',
          'tablet:inset-x-auto tablet:bottom-5 tablet:right-5 tablet:w-auto'
        ].join(' ')
      : [
          'fixed inset-x-3 bottom-3 z-[1100] max-h-[min(82dvh,38rem)]',
          'max-w-[calc(100vw-1.5rem)] rounded-cockpit border border-base-300',
          'bg-base-100 p-3 shadow-cockpit',
          'tablet:inset-x-auto tablet:bottom-5 tablet:right-5 tablet:w-[24rem]'
        ].join(' ')

  return (
    <div
      ref={panelRef}
      role={state === 'survey' ? 'dialog' : 'region'}
      aria-modal={state === 'survey' ? 'true' : undefined}
      aria-labelledby={titleId}
      className={shellClass}
      tabIndex={state === 'survey' ? -1 : undefined}
      onKeyDown={onKeyDown}
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
    >
      <div className={`flex items-center ${state === 'teaser' ? 'gap-1.5' : 'items-start gap-3'}`}>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <MdFeedback className="h-5 w-5" />
        </div>
        <div className={`min-w-0 flex-1 ${state === 'teaser' ? 'px-1' : ''}`}>
          <h2 id={titleId} className="text-sm font-semibold leading-tight">
            {state === 'teaser' ? 'Share feedback' : 'Help improve this cockpit view'}
          </h2>
          {message && (
            <p className="mt-2 text-xs leading-snug text-warning" role="status">
              {message}
            </p>
          )}
        </div>
        {state === 'teaser' && (
          <button
            type="button"
            onClick={() => void openSurvey()}
            disabled={loading}
            className="btn btn-primary min-h-12 rounded-full px-4"
          >
            {loading ? 'Loading...' : 'Open'}
          </button>
        )}
        <button
          type="button"
          onClick={close}
          className="btn btn-ghost btn-circle min-h-12 w-12 shrink-0"
          aria-label="Dismiss feedback prompt"
        >
          <MdClose className="h-5 w-5" />
        </button>
      </div>

      {state === 'survey' && (
        <div
          id={SURVEY_CONTAINER_ID}
          className="feedback-survey mt-3 max-h-[min(58dvh,30rem)] overflow-y-auto overscroll-contain"
        />
      )}
    </div>
  )
}
