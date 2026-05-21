import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode
} from 'react'
import { MdClose } from 'react-icons/md'
import { useAppStore, type SheetId } from '~/store/useAppStore'

interface SidePanelProps {
  id: SheetId
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

interface PointerStart {
  x: number
  y: number
}

const CLOSE_ANIMATION_MS = 220
const SWIPE_CLOSE_PX = 80

export const SidePanel = ({
  id,
  title,
  description,
  children,
  footer
}: SidePanelProps) => {
  const ref = useRef<HTMLDialogElement>(null)
  const pointerStartRef = useRef<PointerStart | null>(null)
  const [visible, setVisible] = useState(false)
  const open = useAppStore((s) => s.openSheet) === id
  const close = useAppStore((s) => s.closeSheet)
  const headingId = useId()

  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return

    if (open) {
      if (!dlg.open) dlg.showModal()
      const frame = window.requestAnimationFrame(() => setVisible(true))
      return () => window.cancelAnimationFrame(frame)
    }

    if (!dlg.open) return
    setVisible(false)
    const timeoutId = window.setTimeout(() => {
      if (dlg.open) dlg.close()
    }, CLOSE_ANIMATION_MS)
    return () => window.clearTimeout(timeoutId)
  }, [open])

  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return

    const handleCancel = (event: Event) => {
      event.preventDefault()
      close({ method: 'escape' })
    }
    const handleClose = () => {
      setVisible(false)
      close({ method: 'native' })
    }
    const handleClick = (event: MouseEvent) => {
      if (event.target === dlg) close({ method: 'backdrop' })
    }

    dlg.addEventListener('cancel', handleCancel)
    dlg.addEventListener('close', handleClose)
    dlg.addEventListener('click', handleClick)
    return () => {
      dlg.removeEventListener('cancel', handleCancel)
      dlg.removeEventListener('close', handleClose)
      dlg.removeEventListener('click', handleClick)
    }
  }, [close])

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY }
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current
    pointerStartRef.current = null
    if (!start) return

    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    if (deltaX > SWIPE_CLOSE_PX && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      close({ method: 'swipe' })
    }
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={headingId}
      className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-black/55 backdrop:backdrop-blur-sm"
    >
      <div className="relative flex h-[100dvh] justify-end">
        <button
          type="button"
          className="absolute inset-0 cursor-default"
          tabIndex={-1}
          aria-label="Close panel"
          onClick={() => close({ method: 'backdrop' })}
        />
        <div
          className={`relative flex h-full w-full max-w-[min(100vw,30rem)] flex-col overflow-hidden border-l border-base-300 bg-base-100 shadow-cockpit transition-transform duration-200 ease-out will-change-transform motion-reduce:transition-none tablet:max-w-[28rem] desktop:max-w-[30rem] ${
            visible ? 'translate-x-0' : 'translate-x-full'
          }`}
          onPointerDown={onPointerDown}
          onPointerCancel={() => {
            pointerStartRef.current = null
          }}
          onPointerUp={onPointerUp}
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)'
          }}
        >
          <header className="flex items-start justify-between gap-3 border-b border-base-300 px-5 py-4">
            <div className="min-w-0">
              <h2 id={headingId} className="text-lg font-semibold leading-tight">
                {title}
              </h2>
              {description && (
                <p className="mt-0.5 text-sm text-base-content/70">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => close({ method: 'button' })}
              className="btn btn-ghost btn-circle btn-sm shrink-0"
              aria-label="Close"
            >
              <MdClose className="h-5 w-5" />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            {children}
          </div>
          {footer && (
            <footer className="border-t border-base-300 bg-base-100 px-5 py-3">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </dialog>
  )
}
