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
  MdInstallMobile,
  MdContactSupport,
  MdArticle
} from 'react-icons/md'
import { ModeToggle } from '~/components/ui/ModeToggle'
import { useAppStore } from '~/store/useAppStore'
import type { PwaInstallState } from '~/hooks/usePwaInstall'

const OverflowMenu = ({ pwaInstall }: { pwaInstall: PwaInstallState }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const theme = useAppStore((s) => s.theme)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const enableMap = useAppStore((s) => s.enableMap)
  const setEnableMap = useAppStore((s) => s.setEnableMap)
  const resetOnboarding = useAppStore((s) => s.resetOnboarding)
  const openSheet = useAppStore((s) => s.openSheetAction)
  const mode = useAppStore((s) => s.mode)
  const { canInstall, promptInstall } = pwaInstall

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
        className="btn btn-ghost btn-circle min-h-12 w-12"
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
                  void promptInstall('overflow_menu')
                  setOpen(false)
                }}
                className="flex min-h-12 w-full items-center gap-2 bg-primary/5 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
              >
                <MdInstallMobile className="h-4 w-4" /> Install app
              </button>
            </li>
          )}
          <li role="none" className="border-b border-base-300 tablet:hidden">
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                openSheet('contact', { surface: 'overflow_menu' })
                setOpen(false)
              }}
              className="flex min-h-12 w-full items-center gap-2 px-3 py-2 text-sm hover:bg-base-200"
            >
              <MdContactSupport className="h-4 w-4" /> Contact
            </button>
          </li>
          <li role="none">
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                toggleTheme()
                setOpen(false)
              }}
              className="flex min-h-12 w-full items-center gap-2 px-3 py-2 text-sm hover:bg-base-200"
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
              className="flex min-h-12 w-full items-center gap-2 px-3 py-2 text-sm hover:bg-base-200"
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
                openSheet('signs', { surface: 'overflow_menu' })
                setOpen(false)
              }}
              className="flex min-h-12 w-full items-center gap-2 px-3 py-2 text-sm hover:bg-base-200"
            >
              <MdLocalParking className="h-4 w-4" /> Parking signs
            </button>
          </li>
          <li role="none">
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                openSheet('alternates', { surface: 'overflow_menu' })
                setOpen(false)
              }}
              className="flex min-h-12 w-full items-center gap-2 px-3 py-2 text-sm hover:bg-base-200"
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
                  openSheet('divert', { surface: 'overflow_menu' })
                  setOpen(false)
                }}
                className="flex min-h-12 w-full items-center gap-2 px-3 py-2 text-sm hover:bg-base-200"
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
              className="flex min-h-12 w-full items-center gap-2 px-3 py-2 text-sm text-warning hover:bg-warning/10"
            >
              <MdRestartAlt className="h-4 w-4" /> Reset onboarding
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}

const NewsRibbonButton = () => {
  const openSheet = useAppStore((s) => s.openSheetAction)

  return (
    <button
      type="button"
      onClick={() => openSheet('news', { surface: 'news_ribbon' })}
      className="group absolute right-0 top-1/2 z-10 flex min-h-12 -translate-y-1/2 items-center gap-1.5 overflow-hidden rounded-l-full border border-r-0 border-white/45 bg-base-100/65 py-2 pl-3 pr-3 text-sm font-semibold text-primary shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl transition hover:bg-base-100/80 hover:shadow-cockpit tablet:gap-2 tablet:pl-4 tablet:pr-5"
      aria-label="Open AirVenture news"
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-l-full bg-gradient-to-br from-white/65 via-white/20 to-primary/15 opacity-90"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute left-4 top-1.5 h-px w-12 rounded-full bg-white/80 opacity-80 transition group-hover:w-16"
        aria-hidden="true"
      />
      <span className="relative grid h-7 w-7 place-items-center rounded-full border border-primary/20 bg-primary/15 shadow-sm">
        <MdArticle className="h-4 w-4" />
      </span>
      <span className="relative leading-none">News</span>
    </button>
  )
}

/** Top app bar: identity, mode toggle, overflow menu. */
export const AppBar = ({ pwaInstall }: { pwaInstall: PwaInstallState }) => {
  const openSheet = useAppStore((s) => s.openSheetAction)

  return (
    <header
      role="banner"
      className="sticky top-0 z-40 border-b border-base-300 bg-base-100/95 backdrop-blur"
    >
      <div className="relative mx-auto flex w-full max-w-screen-xl items-center gap-2 px-4 py-2 pr-[6.5rem] tablet:px-6 tablet:pr-36">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-cockpit bg-primary text-primary-content">
            <span className="font-cockpit text-sm font-bold">OSH</span>
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold leading-tight">
              Oshkosh Approach
            </h1>
            <p className="truncate text-[11px] text-base-content/60 max-[374px]:hidden">
              Fisk arrival companion
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center divide-x divide-base-300/70">
          <div className="hidden pl-1 tablet:block">
            <button
              type="button"
              onClick={() => openSheet('contact', { surface: 'app_bar' })}
              className="btn btn-ghost min-h-12 gap-1.5 rounded-l-none px-3 text-sm"
            >
              <MdContactSupport className="h-4 w-4" />
              Contact
            </button>
          </div>
          <div className="pl-1">
            <ModeToggle />
          </div>
          <div className="pl-1">
            <OverflowMenu pwaInstall={pwaInstall} />
          </div>
        </div>
      </div>
      <NewsRibbonButton />
    </header>
  )
}
