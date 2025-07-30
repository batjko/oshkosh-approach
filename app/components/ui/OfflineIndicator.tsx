import { useState, useEffect } from 'react'
import { MdWifiOff, MdWifi } from 'react-icons/md'

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="alert alert-warning shadow-lg max-w-sm">
        <MdWifiOff className="h-6 w-6" />
        <div>
          <h3 className="font-bold">Offline Mode</h3>
          <div className="text-xs">Using cached data</div>
        </div>
      </div>
    </div>
  )
}