import { useEffect } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'

import { initAnalytics } from '~/utils/analytics'

/**
 * PostHog provider. Renders `<PostHogProvider>` from first paint so the
 * subtree never unmounts after hydration. The SDK is initialized in a
 * post-hydration `useEffect`; capture/identify calls before init are
 * no-ops thanks to the guard inside `~/utils/analytics`.
 *
 * Per PostHog's Remix integration guide:
 * https://posthog.com/docs/libraries/remix
 */
export const PHProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    initAnalytics()
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
