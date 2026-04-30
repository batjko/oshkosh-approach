import type { ActionFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'

import {
  requestNotamTranslation,
  type NotamTranslationRequest
} from '../.server/notamTranslation'
import { verifyNotamTranslationRequest } from '../.server/notamTranslationSignature'
import { serverLogger } from '../.server/logger'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0'
}
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 30

interface RateLimitBucket {
  count: number
  resetAt: number
}

const rateLimitBuckets = new Map<string, RateLimitBucket>()

const isTranslationRequest = (
  value: unknown
): value is NotamTranslationRequest => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<NotamTranslationRequest>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.number === 'string' &&
    typeof candidate.type === 'string' &&
    typeof candidate.text === 'string' &&
    (candidate.effectiveStart === undefined ||
      typeof candidate.effectiveStart === 'string') &&
    (candidate.effectiveEnd === undefined ||
      typeof candidate.effectiveEnd === 'string') &&
    (candidate.icaoLocation === undefined ||
      typeof candidate.icaoLocation === 'string') &&
    (candidate.translationToken === undefined ||
      typeof candidate.translationToken === 'string')
  )
}

const firstForwardedValue = (value: string | null): string | null =>
  value?.split(',')[0]?.trim() || null

const expectedOrigins = (request: Request): string[] => {
  const url = new URL(request.url)
  const forwardedProto = firstForwardedValue(request.headers.get('X-Forwarded-Proto'))
  const forwardedHost = firstForwardedValue(request.headers.get('X-Forwarded-Host')) ??
    request.headers.get('Host')
  const origins = new Set([url.origin])

  if (forwardedProto && forwardedHost) {
    origins.add(`${forwardedProto}://${forwardedHost}`)
  }

  return [...origins]
}

const sameOrigin = (request: Request): boolean => {
  const allowedOrigins = expectedOrigins(request)
  const origin = request.headers.get('Origin')
  if (origin) return allowedOrigins.includes(origin)

  const referer = request.headers.get('Referer')
  try {
    return Boolean(referer && allowedOrigins.includes(new URL(referer).origin))
  } catch {
    return false
  }
}

const requestKey = (request: Request): string => {
  const forwardedFor = request.headers.get('X-Forwarded-For')
  const clientIp = forwardedFor?.split(',')[0]?.trim()
  return clientIp || request.headers.get('User-Agent') || 'unknown'
}

const retryAfterMs = (request: Request): number => {
  const now = Date.now()
  for (const [key, bucket] of rateLimitBuckets) {
    if (bucket.resetAt <= now) rateLimitBuckets.delete(key)
  }

  const key = requestKey(request)
  const existing = rateLimitBuckets.get(key)

  if (!existing || existing.resetAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS
    })
    return 0
  }

  existing.count += 1
  return existing.count > RATE_LIMIT_MAX_REQUESTS
    ? Math.max(1_000, existing.resetAt - now)
    : 0
}

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    return json(
      { status: 'invalid', error: 'method_not_allowed' },
      { status: 405, headers: NO_STORE_HEADERS }
    )
  }

  if (!sameOrigin(request)) {
    serverLogger.warn('notam.translation.rejected', {
      reason: 'same_origin_required',
      origin: request.headers.get('Origin') ?? '',
      refererOrigin: (() => {
        try {
          const referer = request.headers.get('Referer')
          return referer ? new URL(referer).origin : ''
        } catch {
          return 'invalid'
        }
      })(),
      expectedOrigins: expectedOrigins(request).join(',')
    })
    return json(
      { status: 'invalid', error: 'same_origin_required' },
      { status: 403, headers: NO_STORE_HEADERS }
    )
  }

  const retryAfter = retryAfterMs(request)
  if (retryAfter > 0) {
    return json(
      { status: 'error', error: 'rate_limited', retryAfterMs: retryAfter },
      {
        status: 429,
        headers: {
          ...NO_STORE_HEADERS,
          'Retry-After': String(Math.ceil(retryAfter / 1000))
        }
      }
    )
  }

  try {
    const body = (await request.json()) as unknown
    if (!isTranslationRequest(body)) {
      return json(
        { status: 'invalid', error: 'invalid_request' },
        { status: 400, headers: NO_STORE_HEADERS }
      )
    }

    if (!verifyNotamTranslationRequest(body, body.translationToken)) {
      serverLogger.warn('notam.translation.rejected', {
        reason: 'invalid_translation_token',
        notamNumber: body.number,
        hasToken: Boolean(body.translationToken)
      })
      return json(
        { status: 'invalid', error: 'invalid_translation_token' },
        { status: 403, headers: NO_STORE_HEADERS }
      )
    }

    const result = await requestNotamTranslation(body)
    const httpStatus = result.status === 'invalid' ? 400 : 200
    return json(result, { status: httpStatus, headers: NO_STORE_HEADERS })
  } catch {
    return json(
      { status: 'invalid', error: 'invalid_json' },
      { status: 400, headers: NO_STORE_HEADERS }
    )
  }
}
