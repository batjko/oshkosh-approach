import { useEffect, useRef, useState } from 'react'
import { MdClose, MdInstallMobile, MdIosShare } from 'react-icons/md'

import type { PwaInstallState } from '~/hooks/usePwaInstall'
import { useAppStore } from '~/store/useAppStore'
import { trackAppEvent } from '~/utils/analytics'
import {
  canShowPwaInstallCard,
  getPwaInstallMethod
} from '~/utils/pwaInstall'

const DISMISS_UNTIL_KEY = 'osh-pwa-install-dismissed-until-v1'
const DISMISS_COOLDOWN_MS = 24 * 60 * 60_000

const isDismissed = (): boolean => {
  try {
    const raw = window.localStorage.getItem(DISMISS_UNTIL_KEY)
    const dismissedUntil = raw ? Number(raw) : 0
    return Number.isFinite(dismissedUntil) && dismissedUntil > Date.now()
  } catch {
    return false
  }
}

const saveDismissal = (): void => {
  try {
    window.localStorage.setItem(
      DISMISS_UNTIL_KEY,
      String(Date.now() + DISMISS_COOLDOWN_MS)
    )
  } catch {
    // Local storage can be unavailable in restricted browser contexts.
  }
}

interface PwaInstallCardProps {
  installState: PwaInstallState
}

export const PwaInstallCard = ({ installState }: PwaInstallCardProps) => {
  const mode = useAppStore((state) => state.mode)
  const onboardingComplete = useAppStore((state) => state.onboardingComplete)
  const hasHydrated = useAppStore((state) => state.hasHydrated)
  const [storageChecked, setStorageChecked] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const trackedOpportunity = useRef<string | null>(null)

  useEffect(() => {
    setDismissed(isDismissed())
    setStorageChecked(true)
  }, [])

  const method = getPwaInstallMethod(installState)
  const visible = canShowPwaInstallCard({
    storageChecked,
    hasHydrated,
    onboardingComplete,
    mode,
    isStandalone: installState.isStandalone,
    dismissed,
    method
  })

  useEffect(() => {
    if (!visible || !method || trackedOpportunity.current === method) return
    trackedOpportunity.current = method
    trackAppEvent('pwa install opportunity shown', {
      surface: 'post_onboarding',
      method
    })
  }, [method, visible])

  if (!visible || !method) return null

  const dismiss = () => {
    saveDismissal()
    setDismissed(true)
  }

  const install = async () => {
    const outcome = await installState.promptInstall('post_onboarding')
    if (outcome !== 'accepted') dismiss()
  }

  const ios = method === 'ios_instructions'

  return (
    <aside
      aria-label="Install Oshkosh Approach"
      className="border-b border-primary/20 bg-primary/5"
    >
      <div className="mx-auto flex w-full max-w-screen-xl items-start gap-3 px-4 py-3 tablet:items-center tablet:px-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
          {ios ? (
            <MdIosShare className="h-5 w-5" aria-hidden="true" />
          ) : (
            <MdInstallMobile className="h-5 w-5" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-base-content">
            Install for faster flight-day access
          </h2>
          <p className="mt-0.5 text-xs leading-relaxed text-base-content/70">
            {ios
              ? 'On iPhone or iPad, tap Share, then Add to Home Screen.'
              : 'Keep the companion on your home screen. Live NOTAMs still require a connection.'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {ios ? (
            <button type="button" onClick={dismiss} className="btn btn-primary btn-sm tap-target">
              Got it
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void install()}
              className="btn btn-primary btn-sm tap-target gap-1.5"
            >
              <MdInstallMobile className="h-4 w-4" aria-hidden="true" />
              Install app
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            className="btn btn-ghost btn-circle min-h-11 w-11"
            aria-label="Dismiss install suggestion for 24 hours"
          >
            <MdClose className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  )
}
