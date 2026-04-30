import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'

import { initAnalytics } from '~/utils/analytics'

// Initialize PostHog eagerly on the client, not in a `useEffect`. In
// React, child effects run before parent effects, so any on-mount
// `trackAppEvent` call (e.g. `notams loaded`) would otherwise fire
// before the provider's effect had a chance to initialize the SDK and
// be silently dropped by the `initialized` guard. `initAnalytics` is
// idempotent and no-ops on the server, so this is SSR-safe.
//
// Per PostHog's Remix integration guide the client instance is
// initialized eagerly during render: https://posthog.com/docs/libraries/remix
if (typeof window !== 'undefined') {
  initAnalytics()
}

export const PHProvider = ({ children }: { children: React.ReactNode }) => {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
