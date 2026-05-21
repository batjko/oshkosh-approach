import { useEffect } from 'react'
import posthogJs from 'posthog-js'
import { PostHogProvider } from '@posthog/react'

import { clientLogger } from '~/lib/clientLogger'
import { initAnalytics } from '~/utils/analytics'

const readMode = (): string => {
  const env = (import.meta as unknown as { env?: { MODE?: string } }).env
  return env?.MODE ?? 'production'
}

export const PHProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    initAnalytics()
    clientLogger.info('client.booted', {
      service: 'oshkosh-approach-client',
      environment: readMode(),
      userAgent: navigator.userAgent
    })
  }, [])

  return <PostHogProvider client={posthogJs}>{children}</PostHogProvider>
}
