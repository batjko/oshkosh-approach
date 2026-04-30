/**
 * Server-side structured logger backed by OpenTelemetry → PostHog Logs.
 *
 * Boots a single OTel NodeSDK on first import and exposes a small
 * typed API (`serverLogger.info/warn/error/debug`) so call sites stay
 * one-liners. Uses the public PostHog project token (same one as the
 * client) which can be overridden with `POSTHOG_PROJECT_KEY` env var.
 *
 * Init is idempotent and best-effort: if the SDK fails to start, log
 * calls degrade to a `console.*` fallback so the loader never throws
 * because of telemetry.
 */
import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import type { Logger as OtelLogger, LogAttributes } from '@opentelemetry/api-logs'

/**
 * Default PostHog client token used if `POSTHOG_PROJECT_KEY` is not set.
 * This is intentionally the same public token already shipped in the
 * client bundle (`app/entry.client.tsx`) - it is not a secret.
 */
const DEFAULT_POSTHOG_TOKEN =
  'phc_Fdzlm8xerItmC8dlIam0qQ59QdCDWfdC7aBUw5aReqa'

const POSTHOG_LOGS_ENDPOINT = 'https://eu.i.posthog.com/i/v1/logs'
const SERVICE_NAME = 'oshkosh-approach-server'
const SERVICE_VERSION = process.env.HEROKU_RELEASE_VERSION ?? 'dev'
const ENVIRONMENT =
  process.env.NODE_ENV === 'production' ? 'production' : 'development'

const token = process.env.POSTHOG_PROJECT_KEY ?? DEFAULT_POSTHOG_TOKEN

let otelLogger: OtelLogger | null = null

const startOtel = (): OtelLogger | null => {
  if (!token) return null
  try {
    const sdk = new NodeSDK({
      resource: resourceFromAttributes({
        'service.name': SERVICE_NAME,
        'service.version': SERVICE_VERSION,
        'deployment.environment': ENVIRONMENT
      }),
      logRecordProcessor: new BatchLogRecordProcessor(
        new OTLPLogExporter({
          url: POSTHOG_LOGS_ENDPOINT,
          headers: { Authorization: `Bearer ${token}` }
        })
      )
    })
    sdk.start()
    return logs.getLogger(SERVICE_NAME, SERVICE_VERSION)
  } catch (err) {
    console.warn('[serverLogger] OTel init failed, falling back:', err)
    return null
  }
}

if (!otelLogger) otelLogger = startOtel()

const SEVERITY: Record<string, SeverityNumber> = {
  debug: SeverityNumber.DEBUG,
  info: SeverityNumber.INFO,
  warn: SeverityNumber.WARN,
  error: SeverityNumber.ERROR
}

const emit = (
  level: 'debug' | 'info' | 'warn' | 'error',
  body: string,
  attributes?: LogAttributes
) => {
  if (otelLogger) {
    otelLogger.emit({
      severityNumber: SEVERITY[level],
      severityText: level.toUpperCase(),
      body,
      attributes
    })
    return
  }
  // Fallback - keep stderr clean of attributes serialisation noise
  const fn =
    level === 'error'
      ? console.error
      : level === 'warn'
        ? console.warn
        : console.log
  fn(`[${level}] ${body}`, attributes ?? '')
}

export const serverLogger = {
  debug: (body: string, attributes?: LogAttributes) =>
    emit('debug', body, attributes),
  info: (body: string, attributes?: LogAttributes) =>
    emit('info', body, attributes),
  warn: (body: string, attributes?: LogAttributes) =>
    emit('warn', body, attributes),
  error: (body: string, attributes?: LogAttributes) =>
    emit('error', body, attributes)
}
