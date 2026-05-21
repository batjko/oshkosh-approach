import { useEffect, useState } from 'react'

import { isAnalyticsDisabled, isAnalyticsReady } from '~/utils/analytics'

const ANALYTICS_READY_POLL_MS = 250

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

export const useAnalyticsReady = () => {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (isAnalyticsReady()) {
      setReady(true)
      return
    }
    if (isAnalyticsDisabled()) return

    const intervalId = window.setInterval(() => {
      if (isAnalyticsReady()) {
        setReady(true)
        window.clearInterval(intervalId)
      } else if (isAnalyticsDisabled()) {
        window.clearInterval(intervalId)
      }
    }, ANALYTICS_READY_POLL_MS)

    return () => window.clearInterval(intervalId)
  }, [])

  return ready
}
