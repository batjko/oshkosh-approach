import posthogJs, {
  DisplaySurveyType,
  type Survey
} from 'posthog-js'

import { isAnalyticsReady } from '~/utils/analytics'

const DEFAULT_FEEDBACK_SURVEY_ID = '0190f6e7-a0e3-0000-1557-d212289b8a18'
const DEFAULT_FEEDBACK_SURVEY_NAME = 'Feedback'
const SURVEY_LOAD_TIMEOUT_MS = 8_000

type SurveyLoadContext = {
  isLoaded: boolean
  error?: string
}

const readEnv = (key: string): string | undefined => {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env
  return env?.[key]
}

const resolveFeedbackSurveyId = (): string =>
  readEnv('VITE_PUBLIC_POSTHOG_FEEDBACK_SURVEY_ID') ?? DEFAULT_FEEDBACK_SURVEY_ID

const settleOnce = <Value>(
  timeoutId: number,
  settle: (value: Value) => void,
  value: Value
): void => {
  window.clearTimeout(timeoutId)
  settle(value)
}

const getSurveys = (): Promise<Survey[]> =>
  new Promise((resolve, reject) => {
    if (!isAnalyticsReady()) {
      reject(new Error('PostHog is not ready yet.'))
      return
    }

    let settled = false
    const timeoutId = window.setTimeout(() => {
      settled = true
      reject(new Error('Timed out while loading feedback.'))
    }, SURVEY_LOAD_TIMEOUT_MS)

    const resolveOnce = (surveys: Survey[]) => {
      if (settled) return
      settled = true
      settleOnce(timeoutId, resolve, surveys)
    }

    const rejectOnce = (error: Error) => {
      if (settled) return
      settled = true
      settleOnce(timeoutId, reject, error)
    }

    try {
      posthogJs.getSurveys((surveys, context?: SurveyLoadContext) => {
        if (context?.error) {
          rejectOnce(new Error(context.error))
          return
        }
        if (context && !context.isLoaded) return
        resolveOnce(surveys)
      }, true)
    } catch (error) {
      rejectOnce(error instanceof Error ? error : new Error('Feedback failed to load.'))
    }
  })

export const loadFeedbackSurvey = async (): Promise<Survey | null> => {
  const surveys = await getSurveys()
  const surveyId = resolveFeedbackSurveyId()

  return (
    surveys.find((survey) => survey.id === surveyId) ??
    surveys.find((survey) => survey.name.toLowerCase() === DEFAULT_FEEDBACK_SURVEY_NAME.toLowerCase()) ??
    null
  )
}

export const displayFeedbackSurvey = (surveyId: string, selector: string): void => {
  posthogJs.displaySurvey(surveyId, {
    displayType: DisplaySurveyType.Inline,
    selector,
    ignoreConditions: true,
    ignoreDelay: true,
    properties: { surface: 'first_party_feedback_prompt' }
  })
}

export const cancelFeedbackSurvey = (surveyId: string): void => {
  posthogJs.cancelPendingSurvey(surveyId)
}
