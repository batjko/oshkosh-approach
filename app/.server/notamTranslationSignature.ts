import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export interface NotamTranslationSignatureInput {
  id: string
  number: string
  type: string
  effectiveStart?: string
  effectiveEnd?: string
  text: string
  icaoLocation?: string
}

const fallbackSigningSecret = randomBytes(32).toString('base64url')

const signingSecret = (): string =>
  process.env.NOTAM_TRANSLATION_SIGNING_SECRET ??
  process.env.OPENROUTER_API_KEY ??
  fallbackSigningSecret

const normalize = (value: string | undefined): string =>
  (value ?? '').replace(/\s+/g, ' ').trim()

const signaturePayload = (input: NotamTranslationSignatureInput): string =>
  JSON.stringify({
    id: normalize(input.id),
    number: normalize(input.number),
    type: normalize(input.type),
    effectiveStart: normalize(input.effectiveStart),
    effectiveEnd: normalize(input.effectiveEnd),
    text: normalize(input.text),
    icaoLocation: normalize(input.icaoLocation)
  })

export const signNotamTranslationRequest = (
  input: NotamTranslationSignatureInput
): string =>
  createHmac('sha256', signingSecret())
    .update(signaturePayload(input))
    .digest('base64url')

export const verifyNotamTranslationRequest = (
  input: NotamTranslationSignatureInput,
  signature: string | undefined
): boolean => {
  if (!signature) return false
  const expected = signNotamTranslationRequest(input)
  const expectedBuffer = Buffer.from(expected)
  const actualBuffer = Buffer.from(signature)
  if (expectedBuffer.length !== actualBuffer.length) return false
  return timingSafeEqual(expectedBuffer, actualBuffer)
}
