import { useEffect, useRef, useState } from 'react'
import {
  MdMoreVert,
  MdLightMode,
  MdDarkMode,
  MdMap,
  MdMapsHomeWork,
  MdRestartAlt,
  MdLocalParking,
  MdLocalAirport,
  MdAirlineStops,
  MdInstallMobile
} from 'react-icons/md'
import { ModeToggle } from '~/components/ui/ModeToggle'
import { useAppStore } from '~/store/useAppStore'
import { usePwaInstall } from '~/hooks/usePwaInstall'

const OverflowMenu = () => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const enableMap = useAppStore((s) => s.enableMap)
  const setEnableMap = useAppStore((s) => s.setEnableMap)
  const resetOnboarding = useAppStore((s) => s.resetOnboarding)
  const openSheet = useAppStore((s) => s.openSheetAction)
  const mode = useAppStore((s) => s.mode)
  const { canInstall, promptInstall } = usePwaInstall()

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn btn-ghost btn-circle btn-sm"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More options"
      >
        <MdMoreVert className="h-5 w-5" />
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-cockpit border border-base-300 bg-base-100 shadow-cockpit"
        >
          {canInstall && (
            <li role="none" className="border-b border-base-300">
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  void promptInstall()
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 bg-primary/5 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
              >
                <MdInstallMobile className="h-4 w-4" /> Install app
              </button>
            </li>
          )}
          <li role="none">
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                toggleTheme()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-base-200"
            >
              {theme === 'cockpit' ? (
                <MdLightMode className="h-4 w-4" />
              ) : (
                <MdDarkMode className="h-4 w-4" />
              )}
              {theme === 'cockpit' ? 'Chart (day) theme' : 'Cockpit (night) theme'}
            </button>
          </li>
          <li role="none">
            <button
              role="menuitem"
              type="button"
              onClick={() => setEnableMap(!enableMap)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-base-200"
            >
              {enableMap ? (
                <MdMapsHomeWork className="h-4 w-4" />
              ) : (
                <MdMap className="h-4 w-4" />
              )}
              {enableMap ? 'Use map fallback' : 'Enable interactive map'}
            </button>
          </li>
          <li role="none" className="border-t border-base-300">
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                openSheet('signs')
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-base-200"
            >
              <MdLocalParking className="h-4 w-4" /> Parking signs
            </button>
          </li>
          <li role="none">
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                openSheet('alternates')
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-base-200"
            >
              <MdLocalAirport className="h-4 w-4" /> Alternates
            </button>
          </li>
          {mode === 'pre-flight' && (
            <li role="none">
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  openSheet('divert')
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-base-200"
              >
                <MdAirlineStops className="h-4 w-4" /> Divert briefing
              </button>
            </li>
          )}
          <li role="none" className="border-t border-base-300">
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                resetOnboarding()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-warning hover:bg-warning/10"
            >
              <MdRestartAlt className="h-4 w-4" /> Reset onboarding
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}

/** Top app bar: identity, mode toggle, overflow menu. */
export const AppBar = () => (
  <header
    role="banner"
    className="sticky top-0 z-40 border-b border-base-300 bg-base-100/95 backdrop-blur"
  >
    <div className="mx-auto flex w-full max-w-screen-xl items-center gap-2 px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-cockpit bg-primary text-primary-content">
          <span className="font-cockpit text-sm font-bold">OSH</span>
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold leading-tight">
            Oshkosh Approach
          </h1>
          <p className="truncate text-[11px] text-base-content/60">
            Fisk arrival companion
          </p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <ModeToggle />
        <OverflowMenu />
      </div>
    </div>
  </header>
)
