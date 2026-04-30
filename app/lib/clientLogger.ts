/**
 * Thin wrapper over `posthog.logger` for client-side structured logging.
 *
 * - Safe before `posthog.init()` runs (each method checks `posthog.logger`).
 * - Safe in SSR (returns no-ops when `window` is absent).
 * - Logger calls do NOT write to the browser console; if you want
 *   something in the console too, log it explicitly there.
 */
import posthogJs from 'posthog-js'

type Attrs = Record<
  string,
  string | number | boolean | string[] | number[] | undefined | null
>

const isBrowser = (): boolean => typeof window !== 'undefined'

const safe = (
  level: 'debug' | 'info' | 'warn' | 'error',
  body: string,
  attributes?: Attrs
) => {
  if (!isBrowser()) return
  const logger = posthogJs.logger
  if (!logger) return
  try {
    logger[level](body, attributes)
  } catch {
    // Telemetry must never throw - swallow.
  }
}

export const clientLogger = {
  debug: (body: string, attributes?: Attrs) => safe('debug', body, attributes),
  info: (body: string, attributes?: Attrs) => safe('info', body, attributes),
  warn: (body: string, attributes?: Attrs) => safe('warn', body, attributes),
  error: (body: string, attributes?: Attrs) => safe('error', body, attributes)
}
