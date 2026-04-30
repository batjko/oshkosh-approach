import { useCallback, useEffect, useState } from 'react'
import { trackAppEvent } from '~/utils/analytics'

/**
 * `beforeinstallprompt` event shape per the W3C spec. Not yet in the
 * default `lib.dom.d.ts`, so we declare a narrow local type rather
 * than reach for `any`.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const PWA_DISPLAY_MODES = ['standalone', 'minimal-ui', 'fullscreen'] as const

const detectStandalone = (): boolean => {
  if (typeof window === 'undefined') return false
  for (const mode of PWA_DISPLAY_MODES) {
    if (window.matchMedia(`(display-mode: ${mode})`).matches) return true
  }
  // iOS Safari: pre-spec property on Navigator.
  const navAny = window.navigator as Navigator & { standalone?: boolean }
  return navAny.standalone === true
}

const detectActiveDisplayMode = ():
  | 'standalone'
  | 'minimal-ui'
  | 'browser'
  | 'unknown' => {
  if (typeof window === 'undefined') return 'unknown'
  if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone'
  if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui'
  if (window.matchMedia('(display-mode: browser)').matches) return 'browser'
  return 'unknown'
}

export interface PwaInstallState {
  /** True when a native install prompt is currently available to fire. */
  canInstall: boolean
  /** True when the page is running as an installed PWA. */
  isStandalone: boolean
  /**
   * Trigger the deferred native install prompt. Resolves once the user
   * has chosen, or immediately if no prompt is currently available.
   */
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>
}

/**
 * Capture and surface the deferred PWA install prompt.
 *
 * Browsers fire `beforeinstallprompt` once when the install criteria are
 * met. We stash the event and expose `promptInstall()` so the AppBar
 * overflow menu can present a deliberate, user-initiated trigger
 * (better UX than the floating browser banner).
 */
export const usePwaInstall = (): PwaInstallState => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState<boolean>(() => detectStandalone())

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
    }

    const handleInstalled = () => {
      setDeferred(null)
      setIsStandalone(true)
      trackAppEvent('pwa installed', {
        display_mode: detectActiveDisplayMode()
      })
    }

    const standaloneQuery = window.matchMedia('(display-mode: standalone)')
    const handleStandaloneChange = () => setIsStandalone(detectStandalone())

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)
    // Safari < 14 only exposes the deprecated `addListener`/`removeListener`
    // API on MediaQueryList. Modern browsers expose both, so prefer the
    // standard one and fall back without dropping the listener silently.
    if (typeof standaloneQuery.addEventListener === 'function') {
      standaloneQuery.addEventListener('change', handleStandaloneChange)
    } else if (typeof standaloneQuery.addListener === 'function') {
      standaloneQuery.addListener(handleStandaloneChange)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
      if (typeof standaloneQuery.removeEventListener === 'function') {
        standaloneQuery.removeEventListener('change', handleStandaloneChange)
      } else if (typeof standaloneQuery.removeListener === 'function') {
        standaloneQuery.removeListener(handleStandaloneChange)
      }
    }
  }, [])

  const promptInstall = useCallback<PwaInstallState['promptInstall']>(async () => {
    if (!deferred) {
      trackAppEvent('pwa install prompted', {
        surface: 'overflow_menu',
        outcome: 'unavailable'
      })
      return 'unavailable'
    }
    try {
      await deferred.prompt()
      const choice = await deferred.userChoice
      trackAppEvent('pwa install prompted', {
        surface: 'overflow_menu',
        outcome: choice.outcome
      })
      // The event can only be used once.
      setDeferred(null)
      return choice.outcome
    } catch {
      trackAppEvent('pwa install prompted', {
        surface: 'overflow_menu',
        outcome: 'dismissed'
      })
      setDeferred(null)
      return 'dismissed'
    }
  }, [deferred])

  return {
    canInstall: deferred !== null && !isStandalone,
    isStandalone,
    promptInstall
  }
}
