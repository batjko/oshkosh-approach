import { MdWifiOff } from 'react-icons/md'
import { useOriginReachability } from '~/hooks/useOriginReachability'

export const OfflineIndicator = () => {
  const isOnline = useOriginReachability()

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="alert alert-warning shadow-lg max-w-sm">
        <MdWifiOff className="h-6 w-6" />
        <div>
          <h3 className="font-bold">App connection unavailable</h3>
          <div className="text-xs">Using cached app data</div>
        </div>
      </div>
    </div>
  )
}
