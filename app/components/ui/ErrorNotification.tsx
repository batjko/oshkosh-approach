import { useEffect, useState } from 'react'
import { MdClose, MdError, MdWarning, MdInfo, MdCheckCircle } from 'react-icons/md'

export type NotificationType = 'error' | 'warning' | 'info' | 'success'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  autoClose?: boolean
}

let notificationListeners: Array<(notifications: Notification[]) => void> = []
let notifications: Notification[] = []

export const showNotification = (notification: Omit<Notification, 'id'>) => {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const next: Notification = { ...notification, id }
  notifications = [...notifications, next]
  notificationListeners.forEach((listener) => listener(notifications))

  if (notification.autoClose !== false) {
    setTimeout(() => dismissNotification(id), 5000)
  }
}

export const dismissNotification = (id: string) => {
  notifications = notifications.filter((n) => n.id !== id)
  notificationListeners.forEach((listener) => listener(notifications))
}

export const useNotificationCount = () => {
  const [count, setCount] = useState(notifications.length)

  useEffect(() => {
    const listener = (next: Notification[]) => setCount(next.length)
    notificationListeners.push(listener)
    return () => {
      notificationListeners = notificationListeners.filter((l) => l !== listener)
    }
  }, [])

  return count
}

const ICONS: Record<NotificationType, JSX.Element> = {
  error: <MdError className="h-5 w-5" />,
  warning: <MdWarning className="h-5 w-5" />,
  info: <MdInfo className="h-5 w-5" />,
  success: <MdCheckCircle className="h-5 w-5" />
}

const TONES: Record<NotificationType, string> = {
  error: 'alert-error',
  warning: 'alert-warning',
  info: 'alert-info',
  success: 'alert-success'
}

/**
 * Notification stack. Positioned in a non-overlapping safe area so it
 * never covers the AppBar or its toggles.
 *
 * - Mobile: anchored to the bottom (above the safe-area inset).
 * - >=md: anchored top-right but BELOW the AppBar (`top-24`).
 */
export const ErrorNotification = () => {
  const [list, setList] = useState<Notification[]>([])

  useEffect(() => {
    const listener = (next: Notification[]) => setList(next)
    notificationListeners.push(listener)
    return () => {
      notificationListeners = notificationListeners.filter((l) => l !== listener)
    }
  }, [])

  if (list.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 pb-[env(safe-area-inset-bottom)] md:bottom-auto md:left-auto md:right-4 md:top-24 md:items-end md:px-0"
      role="region"
      aria-label="Notifications"
    >
      {list.map((n) => (
        <div
          key={n.id}
          className={`alert ${TONES[n.type]} pointer-events-auto w-full max-w-sm animate-slide-in shadow-lg`}
          role="status"
        >
          {ICONS[n.type]}
          <div className="flex-1">
            <h3 className="font-semibold leading-tight">{n.title}</h3>
            {n.message && (
              <div className="text-xs leading-snug opacity-90">{n.message}</div>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismissNotification(n.id)}
            className="btn btn-ghost btn-circle btn-sm"
            aria-label="Dismiss notification"
          >
            <MdClose className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
