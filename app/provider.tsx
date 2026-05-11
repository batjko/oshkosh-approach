import { useEffect } from 'react'
import posthogJs from 'posthog-js'
import { PostHogProvider } from '@posthog/react'

import { initAnalytics } from '~/utils/analytics'

export const PHProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    initAnalytics()
  }, [])

  return <PostHogProvider client={posthogJs}>{children}</PostHogProvider>
}
