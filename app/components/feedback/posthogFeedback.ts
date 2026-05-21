import posthogJs, {
  DisplaySurveyType,
  type Survey
} from 'posthog-js'

import { isAnalyticsReady } from '~/utils/analytics'

const DEFAULT_FEEDBACK_SURVEY_ID = '0190f6e7-a0e3-0000-1557-d212289b8a18'
const DEFAULT_FEEDBACK_SURVEY_NAME = 'Feedback'
const DEFAULT_CONTACT_SURVEY_NAME = 'Contact'
const SURVEY_LOAD_TIMEOUT_MS = 8_000

type SurveyLoadContext = {
  isLoaded: boolean
  error?: string
}

type SurveyEventProperties = Record<string, string | number | boolean | null>

type ContactSurveyResponse = {
  requestType: string
  message: string
  email: string
  properties: SurveyEventProperties
}

const readEnv = (key: string): string | undefined => {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env
  return env?.[key]
}

const resolveFeedbackSurveyId = (): string =>
  readEnv('VITE_PUBLIC_POSTHOG_FEEDBACK_SURVEY_ID') ?? DEFAULT_FEEDBACK_SURVEY_ID

const resolveContactSurveyId = (): string | undefined =>
  readEnv('VITE_PUBLIC_POSTHOG_CONTACT_SURVEY_ID')

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

const surveyNameEquals = (survey: Survey, name: string): boolean =>
  survey.name.toLowerCase() === name.toLowerCase()

const loadSurvey = async (
  surveyId: string | undefined,
  surveyNames: string[]
): Promise<Survey | null> => {
  const surveys = await getSurveys()

  return (
    (surveyId ? surveys.find((survey) => survey.id === surveyId) : undefined) ??
    surveys.find((survey) =>
      surveyNames.some((name) => surveyNameEquals(survey, name))
    ) ??
    null
  )
}

export const loadFeedbackSurvey = async (): Promise<Survey | null> =>
  loadSurvey(resolveFeedbackSurveyId(), [DEFAULT_FEEDBACK_SURVEY_NAME])

export const loadContactSurvey = async (): Promise<Survey | null> =>
  loadSurvey(resolveContactSurveyId(), [DEFAULT_CONTACT_SURVEY_NAME])

export const displayInlineSurvey = (
  surveyId: string,
  selector: string,
  surface: 'first_party_feedback_prompt' | 'contact_modal',
  properties: SurveyEventProperties = {}
): void => {
  posthogJs.displaySurvey(surveyId, {
    displayType: DisplaySurveyType.Inline,
    selector,
    ignoreConditions: true,
    ignoreDelay: true,
    properties: { surface, ...properties }
  })
}

export const displayFeedbackSurvey = (surveyId: string, selector: string): void =>
  displayInlineSurvey(surveyId, selector, 'first_party_feedback_prompt')

const responseKey = (questionId: string | undefined, index: number): string =>
  questionId ? `$survey_response_${questionId}` : index === 0 ? '$survey_response' : `$survey_response_${index}`

export const captureContactSurveyShown = (
  survey: Survey,
  properties: SurveyEventProperties = {}
): void => {
  posthogJs.capture('survey shown', {
    $survey_id: survey.id,
    $survey_name: survey.name,
    surface: 'contact_modal',
    ...properties
  })
}

export const submitContactSurvey = (
  survey: Survey,
  response: ContactSurveyResponse
): void => {
  const [requestTypeQuestion, messageQuestion, emailQuestion] = survey.questions
  const responses = {
    [responseKey(requestTypeQuestion?.id, 0)]: response.requestType,
    [responseKey(messageQuestion?.id, 1)]: response.message,
    [responseKey(emailQuestion?.id, 2)]: response.email
  }

  posthogJs.capture('survey sent', {
    $survey_id: survey.id,
    $survey_name: survey.name,
    $survey_completed: true,
    $survey_submission_id: crypto.randomUUID(),
    surface: 'contact_modal',
    ...response.properties,
    ...responses
  })
}

export const cancelFeedbackSurvey = (surveyId: string): void => {
  posthogJs.cancelPendingSurvey(surveyId)
}
