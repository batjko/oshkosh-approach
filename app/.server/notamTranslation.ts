import { serverLogger } from './logger'
import {
  buildNotamTranslationCacheKey,
  readNotamTranslationCache,
  writeNotamTranslationCache,
  type NotamTranslationCacheIdentity
} from './notamTranslationCache'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const PROMPT_SCHEMA_VERSION = 'notam-translation-v1'
const DEFAULT_TIMEOUT_MS = 10_000
const MAX_NOTAM_TEXT_LENGTH = 5_000
const MAX_FIELD_LENGTH = 600
const MAX_ARRAY_ITEMS = 5

export type NotamTranslationStatus =
  | 'ready'
  | 'timeout'
  | 'unavailable'
  | 'invalid'
  | 'error'

export interface NotamTranslationRequest {
  id: string
  number: string
  type: string
  effectiveStart?: string
  effectiveEnd?: string
  text: string
  icaoLocation?: string
  translationToken?: string
}

export interface NotamTranslationValue {
  html: string
  summary: string
  generatedAt: string
  modelId: string
  promptSchemaVersion: string
}

export interface NotamTranslationResult {
  status: NotamTranslationStatus
  cacheKey?: string
  cached?: boolean
  translation?: NotamTranslationValue
  error?: string
}

interface StructuredNotamTranslation {
  summary: string
  plainLanguageImpact: string
  affectedOperation: string
  pilotConsiderations: string[]
  uncertainties: string[]
  sourceTerms: string[]
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

const inFlight = new Map<string, Promise<NotamTranslationResult>>()

const readTimeoutMs = (): number => {
  const raw = Number(process.env.OPENROUTER_NOTAM_TIMEOUT_MS)
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TIMEOUT_MS
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const textFromRecord = (
  record: Record<string, unknown>,
  key: keyof StructuredNotamTranslation
): string => {
  const value = record[key]
  return typeof value === 'string' ? value.trim() : ''
}

const stringArrayFromRecord = (
  record: Record<string, unknown>,
  key: keyof StructuredNotamTranslation
): string[] => {
  const value = record[key]
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, MAX_ARRAY_ITEMS)
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const renderList = (label: string, items: string[]): string => {
  if (!items.length) return ''
  return `<section><h4>${escapeHtml(label)}</h4><ul>${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('')}</ul></section>`
}

const renderTranslationHtml = (
  translation: StructuredNotamTranslation
): string =>
  [
    '<article>',
    `<p><strong>AI explanation:</strong> ${escapeHtml(translation.summary)}</p>`,
    `<p>${escapeHtml(translation.plainLanguageImpact)}</p>`,
    `<p><strong>Affects:</strong> ${escapeHtml(translation.affectedOperation)}</p>`,
    renderList('Pilot considerations', translation.pilotConsiderations),
    renderList('Uncertainties to verify', translation.uncertainties),
    renderList('Source NOTAM terms', translation.sourceTerms),
    '<p><em>Verify against the raw FAA NOTAM before flight.</em></p>',
    '</article>'
  ].join('')

const hasUnsafeContent = (value: string): boolean =>
  /<\s*\/?\s*(script|style|iframe|img|object|embed|svg|math)|on\w+\s*=|javascript:/i
    .test(value)

const hasUnsupportedAuthorityClaim = (value: string): boolean =>
  /\b(guaranteed|safe to ignore|ignore the raw|authoritative|official interpretation)\b/i
    .test(value)

const isReasonableText = (value: string): boolean =>
  value.length > 0 &&
  value.length <= MAX_FIELD_LENGTH &&
  !hasUnsafeContent(value) &&
  !hasUnsupportedAuthorityClaim(value)

const validateStructuredTranslation = (
  value: StructuredNotamTranslation
): string | null => {
  const requiredFields = [
    value.summary,
    value.plainLanguageImpact,
    value.affectedOperation
  ]
  if (!requiredFields.every(isReasonableText)) return 'invalid_required_fields'

  const arrayFields = [
    value.pilotConsiderations,
    value.uncertainties,
    value.sourceTerms
  ].flat()
  if (!arrayFields.every(isReasonableText)) return 'invalid_array_fields'

  if (!value.pilotConsiderations.length) return 'missing_considerations'
  if (!value.uncertainties.length) return 'missing_uncertainty'
  if (!value.sourceTerms.length) return 'missing_source_terms'
  return null
}

const parseStructuredTranslation = (
  content: string
): StructuredNotamTranslation | null => {
  const parsed = JSON.parse(content) as unknown
  if (!isRecord(parsed)) return null

  return {
    summary: textFromRecord(parsed, 'summary'),
    plainLanguageImpact: textFromRecord(parsed, 'plainLanguageImpact'),
    affectedOperation: textFromRecord(parsed, 'affectedOperation'),
    pilotConsiderations: stringArrayFromRecord(parsed, 'pilotConsiderations'),
    uncertainties: stringArrayFromRecord(parsed, 'uncertainties'),
    sourceTerms: stringArrayFromRecord(parsed, 'sourceTerms')
  }
}

const responseSchema = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: 'One concise plain-English sentence explaining the NOTAM.'
    },
    plainLanguageImpact: {
      type: 'string',
      description: 'What this changes for a VFR pilot in plain English.'
    },
    affectedOperation: {
      type: 'string',
      description: 'The airport, runway, navaid, airspace, or procedure affected.'
    },
    pilotConsiderations: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      maxItems: MAX_ARRAY_ITEMS
    },
    uncertainties: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      maxItems: MAX_ARRAY_ITEMS
    },
    sourceTerms: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      maxItems: MAX_ARRAY_ITEMS
    }
  },
  required: [
    'summary',
    'plainLanguageImpact',
    'affectedOperation',
    'pilotConsiderations',
    'uncertainties',
    'sourceTerms'
  ],
  additionalProperties: false
}

const buildMessages = (notam: NotamTranslationRequest) => [
  {
    role: 'system',
    content:
      'You explain United States FAA NOTAMs for general aviation pilots. NOTAM means Notice to Air Missions. Explain abbreviations and operational impact, but do not invent facts, do not issue clearances, and do not replace the FAA source. If the NOTAM is ambiguous, say what must be verified in the official NOTAM source.'
  },
  {
    role: 'user',
    content: [
      'Translate this active FAA NOTAM into concise plain English.',
      `NOTAM number: ${notam.number}`,
      `Type bucket: ${notam.type}`,
      `ICAO: ${notam.icaoLocation ?? 'unknown'}`,
      `Effective start: ${notam.effectiveStart ?? 'unknown'}`,
      `Effective end: ${notam.effectiveEnd ?? 'unknown'}`,
      'Raw NOTAM:',
      notam.text
    ].join('\n')
  }
]

const validateRequest = (
  value: NotamTranslationRequest
): string | null => {
  if (!value.id || !value.number || !value.type || !value.text) {
    return 'missing_required_fields'
  }
  if (value.text.length > MAX_NOTAM_TEXT_LENGTH) return 'notam_text_too_long'
  return null
}

const classifyError = (error: unknown): NotamTranslationStatus => {
  if (
    error instanceof Error &&
    (error.name === 'AbortError' || error.name === 'TimeoutError')
  ) {
    return 'timeout'
  }
  return 'error'
}

const performTranslation = async (
  notam: NotamTranslationRequest,
  key: string,
  sourceHash: string,
  modelId: string,
  apiKey: string
): Promise<NotamTranslationResult> => {
  const startedAt = Date.now()
  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://www.oshkosh-approach.com/',
        'X-Title': 'Oshkosh Approach'
      },
      body: JSON.stringify({
        model: modelId,
        messages: buildMessages(notam),
        temperature: 0.2,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'notam_explanation',
            strict: true,
            schema: responseSchema
          }
        }
      }),
      signal: AbortSignal.timeout(readTimeoutMs())
    })

    if (!response.ok) {
      serverLogger.warn('notam.translation.openrouter.failed', {
        status: response.status,
        modelId,
        elapsedMs: Date.now() - startedAt
      })
      return { status: 'error', cacheKey: key, error: 'openrouter_failed' }
    }

    const data = (await response.json()) as OpenRouterResponse
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      return { status: 'invalid', cacheKey: key, error: 'empty_response' }
    }

    const structured = parseStructuredTranslation(content)
    if (!structured) {
      return { status: 'invalid', cacheKey: key, error: 'invalid_json' }
    }

    const validationError = validateStructuredTranslation(structured)
    if (validationError) {
      return { status: 'invalid', cacheKey: key, error: validationError }
    }

    const translation: NotamTranslationValue = {
      html: renderTranslationHtml(structured),
      summary: structured.summary,
      generatedAt: new Date().toISOString(),
      modelId,
      promptSchemaVersion: PROMPT_SCHEMA_VERSION
    }

    await writeNotamTranslationCache({
      key,
      sourceHash,
      createdAt: translation.generatedAt,
      modelId,
      promptSchemaVersion: PROMPT_SCHEMA_VERSION,
      value: translation
    })

    serverLogger.info('notam.translation.success', {
      cacheKey: key,
      modelId,
      elapsedMs: Date.now() - startedAt
    })

    return {
      status: 'ready',
      cacheKey: key,
      cached: false,
      translation
    }
  } catch (error) {
    const status = classifyError(error)
    serverLogger.warn('notam.translation.failed', {
      cacheKey: key,
      modelId,
      status,
      elapsedMs: Date.now() - startedAt
    })
    return { status, cacheKey: key, error: status }
  }
}

export const translateNotam = async (
  notam: NotamTranslationRequest
): Promise<NotamTranslationResult> => {
  const requestError = validateRequest(notam)
  if (requestError) return { status: 'invalid', error: requestError }

  const apiKey = process.env.OPENROUTER_API_KEY
  const modelId = process.env.OPENROUTER_NOTAM_MODEL_ID
  if (!apiKey || !modelId) {
    return { status: 'unavailable', error: 'openrouter_not_configured' }
  }

  const identity: NotamTranslationCacheIdentity = {
    id: notam.id,
    number: notam.number,
    type: notam.type,
    icaoLocation: notam.icaoLocation,
    effectiveStart: notam.effectiveStart,
    effectiveEnd: notam.effectiveEnd,
    text: notam.text,
    modelId,
    promptSchemaVersion: PROMPT_SCHEMA_VERSION
  }
  const { key, sourceHash } = buildNotamTranslationCacheKey(identity)
  const cached = await readNotamTranslationCache<NotamTranslationValue>(
    key,
    sourceHash
  )

  if (cached) {
    return {
      status: 'ready',
      cacheKey: key,
      cached: true,
      translation: cached
    }
  }

  const existing = inFlight.get(key)
  if (existing) return existing

  const promise = performTranslation(notam, key, sourceHash, modelId, apiKey)
    .finally(() => {
      inFlight.delete(key)
    })
  inFlight.set(key, promise)
  return promise
}
