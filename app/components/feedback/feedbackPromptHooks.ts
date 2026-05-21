import { useEffect, useState } from 'react'

import { isAnalyticsDisabled, isAnalyticsReady } from '~/utils/analytics'

const ANALYTICS_READY_POLL_MS = 250

export type AnalyticsStatus = 'loading' | 'ready' | 'disabled'

export const useOnline = () => {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    setOnline(navigator.onLine)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  return online
}

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
