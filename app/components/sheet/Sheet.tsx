import { useEffect, useId, useRef, type ReactNode } from 'react'
import { MdClose } from 'react-icons/md'
import { useAppStore, type SheetId } from '~/store/useAppStore'

interface SheetProps {
  id: SheetId
  title: string
  description?: string
  children: ReactNode
  /** Optional sticky footer for primary actions. */
  footer?: ReactNode
}

/**
 * Sheet primitive backed by the native `<dialog>` element. Using
 * `showModal()` gives us focus trap, scroll lock, and Escape-to-close
 * for free.
 *
 * Visual: slide-up bottom sheet on mobile (<= 640), centred dialog on
 * larger viewports. The DaisyUI `modal` styling is intentionally NOT
 * used because we want full control over the slide-up affordance.
 */
export const Sheet = ({ id, title, description, children, footer }: SheetProps) => {
  const ref = useRef<HTMLDialogElement>(null)
  const open = useAppStore((s) => s.openSheet) === id
  const close = useAppStore((s) => s.closeSheet)
  const headingId = useId()

  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    if (open && !dlg.open) {
      dlg.showModal()
    } else if (!open && dlg.open) {
      dlg.close()
    }
  }, [open])

  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    const handleCancel = (event: Event) => {
      event.preventDefault()
      close({ method: 'escape' })
    }
    const handleClose = () => close({ method: 'native' })
    const handleClick = (e: MouseEvent) => {
      // Backdrop click: native <dialog> reports the dialog as the target.
      if (e.target === dlg) close({ method: 'backdrop' })
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

  return (
    <dialog
      ref={ref}
      aria-labelledby={headingId}
      className="m-0 max-h-[100dvh] w-full max-w-none bg-transparent p-0 backdrop:bg-black/60 backdrop:backdrop-blur-sm md:m-auto md:max-h-[85dvh] md:w-[min(40rem,calc(100vw-2rem))]"
    >
      <div
        className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-base-100 shadow-cockpit md:rounded-cockpit"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <header className="flex items-start justify-between gap-3 border-b border-base-300 px-5 py-4">
          <div className="min-w-0">
            <h2 id={headingId} className="text-lg font-semibold leading-tight">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-sm text-base-content/70">{description}</p>
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
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="border-t border-base-300 bg-base-100 px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  )
}

/** Convenience hook for opening a specific sheet. */
export const useSheet = () => {
  const openSheet = useAppStore((s) => s.openSheetAction)
  const closeSheet = useAppStore((s) => s.closeSheet)
  return { open: openSheet, close: closeSheet }
}
