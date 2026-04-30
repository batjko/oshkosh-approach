import { RemixBrowser } from '@remix-run/react'
import { startTransition, useEffect } from 'react'
import { hydrateRoot } from 'react-dom/client'
import posthog from 'posthog-js'

const POSTHOG_TOKEN = 'phc_Fdzlm8xerItmC8dlIam0qQ59QdCDWfdC7aBUw5aReqa'
const SERVICE_NAME = 'oshkosh-approach-web'
// Build-time env exposed by Vite. Falls back to the runtime hostname check.
const ENVIRONMENT =
  typeof window !== 'undefined' &&
  window.location.hostname === 'localhost'
    ? 'development'
    : 'production'

function PosthogInit() {
  useEffect(() => {
    posthog.init(POSTHOG_TOKEN, {
      api_host: 'https://eu.i.posthog.com',
      person_profiles: 'identified_only',
      autocapture: true,
      // PostHog Logs (OTLP-compatible) - structured logger only.
      // We deliberately do NOT enable `captureConsoleLogs` because it
      // forwards every console.* call from the app and its dependencies,
      // which has a large privacy/blast-radius (see PostHog docs).
      logs: {
        serviceName: SERVICE_NAME,
        environment: ENVIRONMENT
      }
    })
    posthog.logger?.info('client booted', {
      service: SERVICE_NAME,
      environment: ENVIRONMENT,
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    })
  }, [])

  return null
}

startTransition(() => {
  hydrateRoot(
    document,
    <>
      <RemixBrowser />
      <PosthogInit />
    </>
  )
})
