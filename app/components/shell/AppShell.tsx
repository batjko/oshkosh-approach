import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { hydrateAppStore, useAppStore } from '~/store/useAppStore'
import { useGeolocation } from '~/hooks/useGeolocation'
import { ErrorBoundary } from '~/components/ErrorBoundary'
import { ErrorNotification } from '~/components/ui/ErrorNotification'
import { OfflineIndicator } from '~/components/ui/OfflineIndicator'
import { OnboardingFlow } from '~/components/onboarding/OnboardingFlow'
import { ContactSheet } from '~/components/feedback/ContactSheet'
import { FeedbackPrompt } from '~/components/feedback/FeedbackPrompt'
import { NewsPanel } from '~/components/news/NewsPanel'
import { AppBar } from './AppBar'
import { StatusBar } from './StatusBar'
import { SkipToContent } from './SkipToContent'
import { PhaseSpine } from '~/components/phase/PhaseSpine'
import { PhaseHero } from '~/components/phase/PhaseHero'

interface AppShellProps {
  /** Anything that renders below the PhaseHero (sections, divert, sheets). */
  children?: ReactNode
  /** Optional banner area above the PhaseHero (CriticalNotamBanner). */
  topBanner?: ReactNode
}

export const AppShell = ({ children, topBanner }: AppShellProps) => {
  const theme = useAppStore((s) => s.theme)
  const mode = useAppStore((s) => s.mode)
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  const hasHydrated = useAppStore((s) => s.hasHydrated)

  useGeolocation()

  useEffect(() => {
    hydrateAppStore()
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <ErrorBoundary>
      <div className="min-h-screen min-w-0 bg-base-200 font-prose text-base-content">
        <SkipToContent />
        <ErrorNotification />
        {hasHydrated && !onboardingComplete && <OnboardingFlow />}

        <AppBar />
        <StatusBar />
        {topBanner}
        <PhaseSpine />

        <main
          id="main-content"
          tabIndex={-1}
          className="pb-[max(env(safe-area-inset-bottom),1.5rem)] focus:outline-none"
        >
          <PhaseHero variant={mode === 'in-flight' ? 'flight' : 'plan'} />
          <div className="mx-auto w-full max-w-screen-xl min-w-0 px-4 pt-4 tablet:px-6">
            {children}
          </div>
        </main>

        <OfflineIndicator />
        <NewsPanel />
        <ContactSheet />
        <FeedbackPrompt />
      </div>
    </ErrorBoundary>
  )
}
