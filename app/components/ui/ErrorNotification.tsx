import { useEffect, useState } from 'react'
import { MdClose, MdError, MdWarning, MdInfo } from 'react-icons/md'

export type NotificationType = 'error' | 'warning' | 'info' | 'success'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  autoClose?: boolean
}

// Global notification state
let notificationListeners: Array<(notifications: Notification[]) => void> = []
let notifications: Notification[] = []

export const showNotification = (notification: Omit<Notification, 'id'>) => {
  const id = Date.now().toString()
  const newNotification = { ...notification, id }
  notifications = [...notifications, newNotification]
  notificationListeners.forEach(listener => listener(notifications))
  
  if (notification.autoClose !== false) {
    setTimeout(() => {
      dismissNotification(id)
    }, 5000)
  }
}

export const dismissNotification = (id: string) => {
  notifications = notifications.filter(n => n.id !== id)
  notificationListeners.forEach(listener => listener(notifications))
}

export const ErrorNotification = () => {
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([])
  
  useEffect(() => {
    const listener = (newNotifications: Notification[]) => {
      setLocalNotifications(newNotifications)
    }
    
    notificationListeners.push(listener)
    return () => {
      notificationListeners = notificationListeners.filter(l => l !== listener)
    }
  }, [])
  
  if (localNotifications.length === 0) return null
  
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'error': return <MdError className="h-6 w-6" />
      case 'warning': return <MdWarning className="h-6 w-6" />
      case 'info': return <MdInfo className="h-6 w-6" />
      default: return <MdInfo className="h-6 w-6" />
    }
  }
  
  const getAlertClass = (type: NotificationType) => {
    switch (type) {
      case 'error': return 'alert-error'
      case 'warning': return 'alert-warning'
      case 'info': return 'alert-info'
      case 'success': return 'alert-success'
      default: return 'alert-info'
    }
  }
  
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
      {localNotifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`alert ${getAlertClass(notification.type)} shadow-lg animate-slide-in`}
        >
          {getIcon(notification.type)}
          <div className="flex-1">
            <h3 className="font-bold">{notification.title}</h3>
            {notification.message && (
              <div className="text-sm">{notification.message}</div>
            )}
          </div>
          <button
            onClick={() => dismissNotification(notification.id)}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <MdClose className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}