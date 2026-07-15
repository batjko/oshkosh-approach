import { useEffect, useState } from 'react'

import { useOriginReachability } from '~/hooks/useOriginReachability'
import { isAnalyticsDisabled, isAnalyticsReady } from '~/utils/analytics'

const ANALYTICS_READY_POLL_MS = 250

export type AnalyticsStatus = 'loading' | 'ready' | 'disabled'

export const useOnline = useOriginReachability

export const useAnalyticsStatus = (): AnalyticsStatus => {
  const [status, setStatus] = useState<AnalyticsStatus>(() => {
    if (isAnalyticsReady()) return 'ready'
    if (isAnalyticsDisabled()) return 'disabled'
    return 'loading'
  })

  useEffect(() => {
    if (isAnalyticsReady()) {
      setStatus('ready')
      return
    }
    if (isAnalyticsDisabled()) {
      setStatus('disabled')
      return
    }

    const intervalId = window.setInterval(() => {
      if (isAnalyticsReady()) {
        setStatus('ready')
        window.clearInterval(intervalId)
      } else if (isAnalyticsDisabled()) {
        setStatus('disabled')
        window.clearInterval(intervalId)
      }
    }, ANALYTICS_READY_POLL_MS)

    return () => window.clearInterval(intervalId)
  }, [])

  return status
}

export const useAnalyticsReady = () => useAnalyticsStatus() === 'ready'
